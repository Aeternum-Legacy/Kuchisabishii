# SPARC PSEUDOCODE: Skip Onboarding Algorithm Design

## ALGORITHM REQUIREMENT ANALYSIS

**CURRENT BROKEN FLOW**:
```
User completes OAuth → Profile created → Onboarding check → Skip button → FAILURE → Redirect loop
```

**ROOT CAUSE ANALYSIS**:
1. **Database Schema Inconsistency**: Multiple profile tables (profiles, user_profiles) with inconsistent onboarding_completed columns
2. **Authentication State Management**: Session restoration issues between OAuth callback and frontend
3. **Onboarding Status Validation**: Unreliable onboarding completion checks
4. **Error Handling**: Missing graceful degradation for database failures
5. **State Synchronization**: Frontend/backend onboarding state mismatch

---

## ALGORITHM 1: SKIP ONBOARDING TRIGGER SYSTEM

### PRIMARY ALGORITHM: handleSkipOnboarding()

```pseudocode
ALGORITHM skip_onboarding_trigger
INPUT: user_session, current_context
OUTPUT: redirect_success OR error_state

BEGIN
    // Step 1: Validate Pre-conditions
    IF user_session IS NULL THEN
        RETURN error_state("AUTHENTICATION_REQUIRED")
    END IF
    
    IF user_session.user_id IS NULL THEN
        RETURN error_state("INVALID_SESSION")
    END IF
    
    // Step 2: User Confirmation with Context
    confirmation_message = "You can restart the AI Taste Profiling anytime through the Settings menu in your profile.\n\nContinue to skip?"
    user_confirms = show_confirmation_dialog(confirmation_message)
    
    IF NOT user_confirms THEN
        RETURN cancelled_by_user
    END IF
    
    // Step 3: Multi-Phase Database Update
    database_update_result = execute_onboarding_completion_update(user_session.user_id)
    
    // Step 4: Local State Management
    set_local_storage("onboardingCompleted", "true")
    set_local_storage("skipTimestamp", current_timestamp())
    
    // Step 5: Session State Synchronization
    sync_result = synchronize_session_state(user_session.user_id)
    
    // Step 6: Controlled Redirect
    IF database_update_result.success AND sync_result.success THEN
        perform_safe_redirect("/app")
        RETURN success_state
    ELSE
        // Graceful degradation - allow app access with warning
        log_warning("Onboarding skip partially failed", database_update_result, sync_result)
        perform_safe_redirect("/app?warning=onboarding_sync_partial")
        RETURN partial_success_state
    END IF
END
```

---

## ALGORITHM 2: DATABASE STATE MANAGEMENT SYSTEM

### PRIMARY ALGORITHM: execute_onboarding_completion_update()

```pseudocode
ALGORITHM execute_onboarding_completion_update
INPUT: user_id
OUTPUT: update_result {success: boolean, table_used: string, errors: array}

BEGIN
    update_result = {success: false, table_used: null, errors: []}
    
    // Step 1: Database Schema Detection
    schema_info = detect_profile_table_schema()
    
    // Step 2: Primary Table Update (OAuth-compatible table first)
    IF schema_info.profiles_table_exists AND schema_info.profiles_has_onboarding_column THEN
        primary_result = update_profiles_table(user_id)
        update_result.table_used = "profiles"
        update_result.success = primary_result.success
        
        IF NOT primary_result.success THEN
            update_result.errors.append(primary_result.error)
        END IF
    END IF
    
    // Step 3: Secondary Table Update (Backup/consistency)
    IF schema_info.user_profiles_table_exists AND schema_info.user_profiles_has_onboarding_column THEN
        secondary_result = update_user_profiles_table(user_id)
        
        IF NOT secondary_result.success THEN
            update_result.errors.append(secondary_result.error)
        END IF
        
        // If primary failed but secondary succeeded, use secondary
        IF NOT update_result.success AND secondary_result.success THEN
            update_result.success = true
            update_result.table_used = "user_profiles"
        END IF
    END IF
    
    // Step 4: Profile Creation Fallback
    IF NOT update_result.success THEN
        creation_result = create_missing_profile(user_id)
        update_result.success = creation_result.success
        update_result.table_used = creation_result.table_name
        
        IF NOT creation_result.success THEN
            update_result.errors.append(creation_result.error)
        END IF
    END IF
    
    // Step 5: Verification Step
    IF update_result.success THEN
        verification_result = verify_onboarding_completion(user_id, update_result.table_used)
        
        IF NOT verification_result.verified THEN
            update_result.success = false
            update_result.errors.append("VERIFICATION_FAILED")
        END IF
    END IF
    
    RETURN update_result
END
```

### SUB-ALGORITHM: update_profiles_table()

```pseudocode
ALGORITHM update_profiles_table
INPUT: user_id
OUTPUT: result {success: boolean, error: string}

BEGIN
    TRY
        // Use UTC timestamp for consistency
        current_timestamp = get_utc_timestamp()
        
        sql_query = "
            UPDATE profiles 
            SET 
                onboarding_completed = true,
                onboarding_completed_at = $2,
                updated_at = $2
            WHERE id = $1
        "
        
        affected_rows = execute_sql(sql_query, [user_id, current_timestamp])
        
        IF affected_rows > 0 THEN
            RETURN {success: true, error: null}
        ELSE
            RETURN {success: false, error: "NO_ROWS_AFFECTED"}
        END IF
        
    CATCH database_error
        log_error("profiles table update failed", database_error)
        RETURN {success: false, error: database_error.message}
    END TRY
END
```

### SUB-ALGORITHM: create_missing_profile()

```pseudocode
ALGORITHM create_missing_profile
INPUT: user_id
OUTPUT: result {success: boolean, table_name: string, error: string}

BEGIN
    TRY
        // Get user data from auth.users
        user_data = get_auth_user_data(user_id)
        
        IF user_data IS NULL THEN
            RETURN {success: false, table_name: null, error: "AUTH_USER_NOT_FOUND"}
        END IF
        
        // Prepare profile data
        profile_data = {
            id: user_id,
            email: user_data.email,
            display_name: user_data.user_metadata.display_name OR user_data.email,
            first_name: user_data.user_metadata.first_name OR "",
            last_name: user_data.user_metadata.last_name OR "",
            profile_image_url: user_data.user_metadata.profile_image_url,
            email_verified: user_data.email_confirmed_at IS NOT NULL,
            privacy_level: "friends",
            onboarding_completed: true,
            onboarding_completed_at: get_utc_timestamp(),
            created_at: get_utc_timestamp(),
            updated_at: get_utc_timestamp()
        }
        
        // Try profiles table first (OAuth-compatible)
        IF table_exists("profiles") THEN
            upsert_result = upsert_profile_data("profiles", profile_data)
            
            IF upsert_result.success THEN
                RETURN {success: true, table_name: "profiles", error: null}
            END IF
        END IF
        
        // Fallback to user_profiles table
        IF table_exists("user_profiles") THEN
            // Adapt data structure for user_profiles table
            user_profile_data = adapt_to_user_profiles_schema(profile_data)
            upsert_result = upsert_profile_data("user_profiles", user_profile_data)
            
            IF upsert_result.success THEN
                RETURN {success: true, table_name: "user_profiles", error: null}
            END IF
        END IF
        
        RETURN {success: false, table_name: null, error: "ALL_TABLES_FAILED"}
        
    CATCH profile_creation_error
        log_error("profile creation failed", profile_creation_error)
        RETURN {success: false, table_name: null, error: profile_creation_error.message}
    END TRY
END
```

---

## ALGORITHM 3: ONBOARDING VALIDATION SYSTEM

### PRIMARY ALGORITHM: validate_onboarding_status()

```pseudocode
ALGORITHM validate_onboarding_status
INPUT: user_session, request_context
OUTPUT: validation_result {status: string, redirect_url: string, should_block: boolean}

BEGIN
    validation_result = {status: "unknown", redirect_url: null, should_block: false}
    
    // Step 1: Session Validation
    IF user_session IS NULL OR user_session.user_id IS NULL THEN
        validation_result.status = "no_session"
        validation_result.redirect_url = "/auth/login"
        validation_result.should_block = true
        RETURN validation_result
    END IF
    
    // Step 2: Context-Aware Validation
    requires_onboarding = determine_onboarding_requirement(request_context.path)
    
    IF NOT requires_onboarding THEN
        validation_result.status = "not_required"
        validation_result.should_block = false
        RETURN validation_result
    END IF
    
    // Step 3: Multi-Source Status Check
    onboarding_status = check_onboarding_status_multi_source(user_session.user_id)
    
    // Step 4: Status Decision Logic
    SWITCH onboarding_status.result
        CASE "completed":
            validation_result.status = "completed"
            validation_result.should_block = false
            
        CASE "not_completed":
            validation_result.status = "required"
            validation_result.redirect_url = "/onboarding"
            validation_result.should_block = true
            
        CASE "unknown":
            // Graceful degradation - allow access with warning
            log_warning("Onboarding status unknown, allowing access", user_session.user_id)
            validation_result.status = "unknown_allowed"
            validation_result.should_block = false
            
        CASE "error":
            // Handle API failures gracefully
            log_error("Onboarding status check failed", onboarding_status.error)
            
            // Check local storage as fallback
            local_completion = get_local_storage("onboardingCompleted")
            
            IF local_completion == "true" THEN
                validation_result.status = "local_completed"
                validation_result.should_block = false
            ELSE
                validation_result.status = "error_block"
                validation_result.redirect_url = "/onboarding"
                validation_result.should_block = true
            END IF
    END SWITCH
    
    RETURN validation_result
END
```

### SUB-ALGORITHM: check_onboarding_status_multi_source()

```pseudocode
ALGORITHM check_onboarding_status_multi_source
INPUT: user_id
OUTPUT: status_result {result: string, confidence: number, error: string}

BEGIN
    status_checks = []
    
    // Source 1: User session cache
    session_status = get_cached_onboarding_status(user_id)
    IF session_status IS NOT NULL THEN
        status_checks.append({source: "session", completed: session_status, confidence: 0.8})
    END IF
    
    // Source 2: API call with timeout
    TRY
        api_status = call_with_timeout("/api/auth/me", 2000ms)
        IF api_status.success THEN
            status_checks.append({
                source: "api", 
                completed: api_status.user.onboardingCompleted, 
                confidence: 0.9
            })
        END IF
    CATCH timeout_error
        log_warning("API timeout during onboarding check", timeout_error)
        status_checks.append({source: "api", completed: null, confidence: 0.0})
    END TRY
    
    // Source 3: Direct database query (fallback)
    TRY
        db_status = query_onboarding_status_direct(user_id)
        status_checks.append({source: "database", completed: db_status, confidence: 1.0})
    CATCH db_error
        log_error("Database query failed", db_error)
        status_checks.append({source: "database", completed: null, confidence: 0.0})
    END TRY
    
    // Source 4: Local storage (last resort)
    local_status = get_local_storage("onboardingCompleted")
    IF local_status IS NOT NULL THEN
        status_checks.append({
            source: "local", 
            completed: (local_status == "true"), 
            confidence: 0.3
        })
    END IF
    
    // Consensus Algorithm
    return consensus_onboarding_status(status_checks)
END
```

---

## ALGORITHM 4: ERROR HANDLING & RECOVERY SYSTEM

### PRIMARY ALGORITHM: handle_onboarding_error()

```pseudocode
ALGORITHM handle_onboarding_error
INPUT: error_context, user_session, attempted_operation
OUTPUT: recovery_action {action: string, redirect_url: string, user_message: string}

BEGIN
    recovery_action = {action: "unknown", redirect_url: null, user_message: ""}
    
    SWITCH error_context.error_type
        CASE "DATABASE_TIMEOUT":
            // Allow user to continue with degraded experience
            recovery_action.action = "allow_with_warning"
            recovery_action.redirect_url = "/app?warning=sync_delayed"
            recovery_action.user_message = "Your profile is being updated. You can continue using the app."
            
            // Background retry
            schedule_background_retry(attempted_operation, user_session.user_id)
            
        CASE "INVALID_SESSION":
            // Force re-authentication
            recovery_action.action = "re_authenticate"
            recovery_action.redirect_url = "/auth/login?reason=session_expired"
            recovery_action.user_message = "Please sign in again to continue."
            
            // Clear invalid session data
            clear_session_data()
            
        CASE "PROFILE_NOT_FOUND":
            // Attempt profile recreation
            creation_result = attempt_profile_recreation(user_session.user_id)
            
            IF creation_result.success THEN
                recovery_action.action = "retry_operation"
                recovery_action.redirect_url = "/app"
                recovery_action.user_message = "Profile restored successfully."
            ELSE
                recovery_action.action = "manual_setup"
                recovery_action.redirect_url = "/onboarding/manual-setup"
                recovery_action.user_message = "Let's set up your profile manually."
            END IF
            
        CASE "NETWORK_ERROR":
            // Offline-capable fallback
            recovery_action.action = "offline_mode"
            recovery_action.redirect_url = "/app?mode=offline"
            recovery_action.user_message = "Working offline. Will sync when connection returns."
            
            // Enable offline functionality
            enable_offline_mode()
            
        CASE "AUTHORIZATION_ERROR":
            // Permission-based redirect
            recovery_action.action = "limited_access"
            recovery_action.redirect_url = "/app?access=limited"
            recovery_action.user_message = "Limited features available. Please contact support."
            
        DEFAULT:
            // Generic error handling
            recovery_action.action = "safe_fallback"
            recovery_action.redirect_url = "/onboarding"
            recovery_action.user_message = "Something went wrong. Let's start fresh."
            
            log_error("Unhandled onboarding error", error_context)
    END SWITCH
    
    // Log recovery action for monitoring
    log_recovery_action(recovery_action, error_context, user_session.user_id)
    
    RETURN recovery_action
END
```

---

## ALGORITHM 5: SESSION STATE SYNCHRONIZATION

### PRIMARY ALGORITHM: synchronize_session_state()

```pseudocode
ALGORITHM synchronize_session_state
INPUT: user_id
OUTPUT: sync_result {success: boolean, state_synchronized: boolean, errors: array}

BEGIN
    sync_result = {success: false, state_synchronized: false, errors: []}
    
    // Step 1: Gather State Sources
    states = gather_onboarding_states(user_id)
    
    // Step 2: Resolve State Conflicts
    canonical_state = resolve_state_conflicts(states)
    
    // Step 3: Update All Sources to Canonical State
    TRY
        // Update database
        db_update = update_database_onboarding_state(user_id, canonical_state)
        
        // Update session cache
        cache_update = update_session_cache(user_id, canonical_state)
        
        // Update local storage
        local_update = update_local_storage_state(canonical_state)
        
        // Update user object in memory
        memory_update = update_user_object_state(user_id, canonical_state)
        
        // Verify synchronization
        all_updates_successful = (db_update.success AND 
                                cache_update.success AND 
                                local_update.success AND 
                                memory_update.success)
        
        IF all_updates_successful THEN
            sync_result.success = true
            sync_result.state_synchronized = true
        ELSE
            // Partial success - log issues but don't fail completely
            sync_result.success = true
            sync_result.state_synchronized = false
            
            collect_partial_sync_errors(sync_result.errors, 
                                      db_update, cache_update, 
                                      local_update, memory_update)
        END IF
        
    CATCH sync_error
        log_error("State synchronization failed", sync_error)
        sync_result.success = false
        sync_result.errors.append(sync_error.message)
    END TRY
    
    RETURN sync_result
END
```

---

## ALGORITHM 6: SAFE REDIRECT SYSTEM

### PRIMARY ALGORITHM: perform_safe_redirect()

```pseudocode
ALGORITHM perform_safe_redirect
INPUT: target_url, redirect_context
OUTPUT: redirect_result {success: boolean, final_url: string}

BEGIN
    redirect_result = {success: false, final_url: target_url}
    
    // Step 1: URL Validation
    IF NOT is_valid_internal_url(target_url) THEN
        log_security_warning("Invalid redirect URL attempted", target_url)
        redirect_result.final_url = "/app"  // Safe default
    END IF
    
    // Step 2: Pre-redirect State Cleanup
    cleanup_result = cleanup_temporary_states()
    
    // Step 3: Session State Verification
    session_valid = verify_session_state_before_redirect()
    
    IF NOT session_valid THEN
        log_warning("Session invalid before redirect, refreshing")
        refresh_session_result = attempt_session_refresh()
        
        IF NOT refresh_session_result.success THEN
            redirect_result.final_url = "/auth/login?reason=session_refresh_failed"
        END IF
    END IF
    
    // Step 4: Redirect Execution
    TRY
        // Use router.push for SPA navigation to maintain state
        IF is_spa_context() THEN
            router.push(redirect_result.final_url)
        ELSE
            // Server-side redirect
            perform_server_redirect(redirect_result.final_url)
        END IF
        
        redirect_result.success = true
        
        // Step 5: Post-redirect Verification
        schedule_post_redirect_verification(redirect_result.final_url)
        
    CATCH redirect_error
        log_error("Redirect execution failed", redirect_error)
        redirect_result.success = false
        
        // Fallback: Force page reload
        force_page_reload(redirect_result.final_url)
    END TRY
    
    RETURN redirect_result
END
```

---

## INTEGRATION CONSTRAINTS & SPECIFICATIONS

### DATABASE COMPATIBILITY MATRIX

```pseudocode
TABLE_COMPATIBILITY_REQUIREMENTS:
  Primary: public.profiles
    - onboarding_completed: BOOLEAN DEFAULT false
    - onboarding_completed_at: TIMESTAMP WITH TIME ZONE
    - OAuth callback compatible: YES
    
  Fallback: public.user_profiles  
    - onboarding_completed: BOOLEAN DEFAULT false
    - onboarding_completed_at: TIMESTAMP WITH TIME ZONE
    - OAuth callback compatible: NO (requires adaptation)
    
  Data Synchronization: BIDIRECTIONAL when both exist
```

### SECURITY REQUIREMENTS

```pseudocode
SECURITY_CONSTRAINTS:
  - User must be authenticated before skip operation
  - No privileged escalation during onboarding bypass
  - Session integrity maintained throughout process
  - Audit trail for all onboarding operations
  - Rate limiting on skip attempts (max 3 per hour)
  - CSRF protection on all onboarding endpoints
```

### PERFORMANCE SPECIFICATIONS

```pseudocode
PERFORMANCE_REQUIREMENTS:
  - Skip operation: < 2 seconds total time
  - Database query timeout: 3 seconds maximum
  - API call timeout: 2 seconds maximum
  - Maximum retry attempts: 3 per operation
  - Background sync completion: < 30 seconds
  - Session state consistency: < 1 second
```

### ERROR TOLERANCE LEVELS

```pseudocode
TOLERANCE_MATRIX:
  CRITICAL_ERRORS (Block operation):
    - Invalid authentication
    - Security violations
    - Data corruption risks
    
  RECOVERABLE_ERRORS (Allow with degradation):
    - Database timeouts
    - Network connectivity issues
    - Cache misses
    
  IGNORABLE_ERRORS (Log and continue):
    - Analytics failures
    - Non-essential API calls
    - UI preference sync failures
```

---

## IMPLEMENTATION PRIORITY MATRIX

### PHASE 1: CRITICAL PATH (Immediate)
1. ✅ **Skip button trigger algorithm**
2. ✅ **Database state management**
3. ✅ **Basic error handling**
4. ✅ **Safe redirect system**

### PHASE 2: RELIABILITY (Next Sprint)
1. ⏳ **Multi-source validation**
2. ⏳ **Session synchronization**
3. ⏳ **Advanced error recovery**
4. ⏳ **Performance optimization**

### PHASE 3: ENHANCEMENT (Future)
1. 📋 **Offline capability**
2. 📋 **Analytics integration**
3. 📋 **A/B testing framework**
4. 📋 **Advanced monitoring**

---

**DELIVERABLE COMPLETE**: This pseudocode provides comprehensive algorithms for skip onboarding functionality with step-by-step logic, robust error handling, and database state management that addresses all identified issues in the current broken flow.