# Kuchisabishii Architecture Framework
## CRITICAL SYSTEM ARCHITECTURAL SPECIFICATION

**Authority Level**: SYSTEM-CRITICAL
**Last Updated**: 2025-08-15
**Version**: 1.0.0

---

## 🚨 ARCHITECTURAL CRISIS RESOLUTION

This document establishes the **UNIFIED ARCHITECTURAL FRAMEWORK** for the Kuchisabishii platform to resolve systemic inconsistencies and ensure all agents follow standardized patterns.

## 🏛️ EXPERT WEIGHTING PROTOCOL

### Authority Hierarchy
```
User → Queen-Strategic → Architecture Agent → All Other Agents
```

**Weight Distribution:**
- **Architecture Agent**: Weight 10 (highest authority for structural decisions)
- **Queen-Strategic**: Weight 9 (coordination and conflict resolution)
- **Type Safety Expert**: Weight 8 (TypeScript and interface decisions)
- **Component Specialists**: Weight 7 (domain-specific expertise)
- **General Agents**: Weight 5 (implementation only, no architectural decisions)

### Decision Authority Rules
1. **No agent may create new architectural patterns** without Architecture Agent approval
2. **All structural decisions** must reference this document
3. **Conflicts are escalated** to Architecture Agent for resolution
4. **This document is the single source of truth** for all architectural decisions

---

## 📊 CURRENT ARCHITECTURAL PROBLEMS IDENTIFIED

### 1. Function Signature Chaos
**❌ CURRENT INCONSISTENT PATTERNS:**
```typescript
// SettingsTab.tsx - Lines 62, 74
updatePrivacy(key: string, value: Record<string, unknown>) // Pattern A
updateDataSetting(key: string, value: Record<string, unknown>) // Pattern A

// But also mixed with:
updateNotification(key: string, value: boolean) // Pattern B
```

### 2. Type System Conflicts
**❌ PROBLEMS:**
- Mixed use of `Record<string, unknown>` vs typed interfaces
- Inconsistent interface definitions across files
- No unified type hierarchy

### 3. Data Flow Inconsistency
**❌ PROBLEMS:**
- No standardized state management pattern
- Mixed prop drilling and direct state manipulation
- Inconsistent data transformation approaches

---

## ✅ UNIFIED ARCHITECTURAL STANDARDS

## 1. FUNCTION SIGNATURE STANDARDS

### ✅ APPROVED PATTERN: Typed Union Pattern
```typescript
// STANDARD: Use typed unions for all state updates
type SettingValue = string | boolean | number | string[]

interface SettingUpdate<T extends SettingValue> {
  key: string
  value: T
}

// STANDARD function signature
const updateSetting = <T extends SettingValue>(
  key: string, 
  value: T,
  validator?: (value: T) => boolean
): void => {
  if (validator && !validator(value)) {
    throw new Error(`Invalid value for ${key}`)
  }
  setState(prev => ({ ...prev, [key]: value }))
}
```

### ❌ FORBIDDEN PATTERNS:
```typescript
// NEVER USE: Generic Record types for known data
updateSetting(key: string, value: Record<string, unknown>)

// NEVER USE: Untyped any
updateSetting(key: string, value: any)
```

## 2. TYPE SYSTEM HIERARCHY

### ✅ BASE INTERFACES STANDARD
```typescript
// Base interfaces that all components must extend
interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

interface BaseUserProfile extends BaseEntity {
  username: string | null
  display_name: string | null
  bio: string | null
  location: string | null
}

interface BaseComponent<T = unknown> {
  className?: string
  testId?: string
  ariaLabel?: string
  data?: T
}

// All component props must extend BaseComponent
interface SettingsTabProps extends BaseComponent<UserSettings> {
  userProfile: UserProfile
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>
  onError: (error: string) => void
}
```

### ✅ TYPE UNION STANDARDS
```typescript
// Use discriminated unions for complex states
type ComponentState = 
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: UserProfile; error: null }
  | { status: 'error'; data: null; error: string }

// Use mapped types for settings
type UserSettings = {
  notifications: {
    [K in NotificationType]: boolean
  }
  privacy: {
    [K in PrivacySetting]: boolean | string
  }
  preferences: {
    [K in UserPreference]: string | number | boolean
  }
}
```

## 3. DATA FLOW ARCHITECTURE

### ✅ STANDARD: Unidirectional Data Flow
```typescript
// STANDARD: Props down, events up pattern
interface ComponentArchitecture {
  // Data flows DOWN through props
  data: readonly T[]
  
  // Events flow UP through callbacks
  onUpdate: (id: string, changes: Partial<T>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onError: (error: Error) => void
}

// STANDARD: State management hierarchy
const useComponentState = <T>() => {
  // 1. Local state for UI-only concerns
  const [uiState, setUiState] = useState<UIState>()
  
  // 2. Shared state through context for related components
  const sharedState = useContext(SharedStateContext)
  
  // 3. Global state for app-wide concerns
  const globalState = useAuth() // or useGlobalState()
  
  return { uiState, sharedState, globalState }
}
```

### ✅ STANDARD: Error Handling Pattern
```typescript
// STANDARD: All async operations must use this pattern
interface AsyncOperation<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const useAsyncOperation = <T>(
  operation: () => Promise<T>
): AsyncOperation<T> & {
  execute: () => Promise<void>
  reset: () => void
} => {
  const [state, setState] = useState<AsyncOperation<T>>({
    data: null,
    loading: false,
    error: null
  })
  
  const execute = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await operation()
      setState({ data, loading: false, error: null })
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }
  
  const reset = () => setState({ data: null, loading: false, error: null })
  
  return { ...state, execute, reset }
}
```

## 4. COMPONENT INTERFACE STANDARDS

### ✅ STANDARD: Component Prop Patterns
```typescript
// STANDARD: All components follow this structure
interface StandardComponentProps<TData = unknown> extends BaseComponent<TData> {
  // Required data
  children?: React.ReactNode
  
  // State management
  loading?: boolean
  error?: string | null
  
  // Event handlers (always async for data operations)
  onSave?: (data: TData) => Promise<void>
  onCancel?: () => void
  onError?: (error: string) => void
  
  // Customization
  variant?: 'default' | 'compact' | 'detailed'
  size?: 'sm' | 'md' | 'lg'
}

// STANDARD: Form component pattern
interface FormComponentProps<TFormData> extends StandardComponentProps<TFormData> {
  initialData?: Partial<TFormData>
  validationSchema?: ValidationSchema<TFormData>
  onSubmit: (data: TFormData) => Promise<void>
  onValidationError?: (errors: ValidationErrors<TFormData>) => void
}

// STANDARD: List component pattern
interface ListComponentProps<TItem> extends StandardComponentProps<TItem[]> {
  items: readonly TItem[]
  onItemSelect?: (item: TItem) => void
  onItemUpdate?: (id: string, updates: Partial<TItem>) => Promise<void>
  onItemDelete?: (id: string) => Promise<void>
  renderItem?: (item: TItem, index: number) => React.ReactNode
  emptyState?: React.ReactNode
}
```

## 5. API INTERFACE STANDARDS

### ✅ STANDARD: API Response Pattern
```typescript
// STANDARD: All API responses follow this structure
interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error: string | null
  metadata?: {
    timestamp: string
    requestId: string
    version: string
  }
}

// STANDARD: Paginated responses
interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// STANDARD: API client pattern
interface ApiClient {
  get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>>
  post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>>
  put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>>
  delete<T>(endpoint: string): Promise<ApiResponse<T>>
}
```

## 6. STATE MANAGEMENT ARCHITECTURE

### ✅ STANDARD: State Layer Hierarchy
```typescript
// Layer 1: Component Local State (UI only)
const useLocalState = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState(0)
  // UI-only state that doesn't affect other components
}

// Layer 2: Feature Context State (related components)
const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [featureState, setFeatureState] = useState<FeatureState>()
  
  return (
    <FeatureContext.Provider value={{ featureState, setFeatureState }}>
      {children}
    </FeatureContext.Provider>
  )
}

// Layer 3: Global Application State
const useGlobalState = () => {
  // Authentication, user settings, app-wide preferences
  const auth = useAuth()
  const settings = useSettings()
  const notifications = useNotifications()
  
  return { auth, settings, notifications }
}
```

---

## 🔧 MIGRATION PLAN FOR EXISTING CODE

### Phase 1: Immediate Fixes (High Priority)
1. **Fix SettingsTab.tsx function signatures**
   - Replace `Record<string, unknown>` with proper types
   - Implement typed setting updates

2. **Standardize ReviewsTab.tsx interfaces**
   - Ensure all interfaces extend base types
   - Fix taste profile rendering type issues

3. **Unify useAuth.ts patterns**
   - Standardize UserProfile interface
   - Implement consistent error handling

### Phase 2: Component Interface Migration
1. **Update all component props** to extend StandardComponentProps
2. **Implement consistent error boundaries**
3. **Standardize async operation patterns**

### Phase 3: Type System Cleanup
1. **Remove all `Record<string, unknown>` usage**
2. **Implement proper type hierarchy**
3. **Add comprehensive type validation**

---

## 🛠️ ARCHITECTURAL REFERENCE PROTOCOL

### For All Agents: MANDATORY CONSULTATION PROCESS

#### BEFORE creating any new component:
1. **Check this document** for existing patterns
2. **If pattern exists**: Follow it exactly
3. **If pattern doesn't exist**: Request architectural decision from Architecture Agent
4. **NEVER create new patterns** without approval

#### BEFORE modifying existing components:
1. **Identify current pattern** used in component
2. **Check if it matches this document**
3. **If non-compliant**: Plan migration to compliant pattern
4. **If uncertain**: Consult Architecture Agent

#### BEFORE creating new APIs:
1. **Follow ApiResponse pattern** exactly
2. **Use proper error handling**
3. **Implement consistent validation**
4. **Document all endpoints**

---

## 📋 COMPLIANCE CHECKLIST

### Every Component Must:
- [ ] Extend appropriate base interface
- [ ] Use typed props (no `Record<string, unknown>`)
- [ ] Implement standard error handling
- [ ] Follow unidirectional data flow
- [ ] Use consistent naming conventions
- [ ] Include proper TypeScript types
- [ ] Handle loading/error states
- [ ] Support accessibility requirements

### Every Function Must:
- [ ] Have explicit return types
- [ ] Use typed parameters
- [ ] Handle errors properly
- [ ] Follow naming conventions
- [ ] Include JSDoc documentation
- [ ] Validate inputs when necessary

### Every API Endpoint Must:
- [ ] Return ApiResponse format
- [ ] Include proper error handling
- [ ] Validate request data
- [ ] Include rate limiting
- [ ] Support proper HTTP methods
- [ ] Include request/response types

---

## 🚫 FORBIDDEN PATTERNS

### ❌ NEVER USE:
```typescript
// Generic Record types for known data structures
Record<string, unknown>
Record<string, any>
any

// Untyped props
interface Props {
  data: any
  onChange: (value: any) => void
}

// Direct state mutation
user.name = "new name"
setUsers(users.push(newUser))

// Inconsistent error handling
try { ... } catch (e) { console.log(e) }

// Mixed data flow patterns
const [data, setData] = useState()
const contextData = useContext()
const globalData = useGlobalStore()
// Then using all three inconsistently
```

### ✅ ALWAYS USE:
```typescript
// Proper type definitions
interface UserProfile {
  id: string
  name: string
  email: string
}

// Typed function signatures
const updateUser = (id: string, updates: Partial<UserProfile>): Promise<void>

// Consistent state patterns
const { data, loading, error, execute } = useAsyncOperation(fetchUser)

// Proper error handling
try {
  await operation()
} catch (error) {
  onError(error instanceof Error ? error.message : 'Unknown error')
}
```

---

## 🎯 SUCCESS METRICS

### Compliance Achieved When:
✅ Zero `Record<string, unknown>` usage in new code
✅ All components follow StandardComponentProps
✅ Consistent error handling across all features
✅ Unified type system implementation
✅ All agents following architectural consultation protocol
✅ No function signature conflicts
✅ Consistent data flow patterns

---

## 📞 ARCHITECTURAL SUPPORT

### For Architectural Questions:
1. **Check this document first**
2. **Search existing implementations**
3. **Consult Architecture Agent** if not found
4. **Document new decisions** in this framework

### For Type System Questions:
1. **Follow type hierarchy** defined above
2. **Use discriminated unions** for complex states
3. **Extend base interfaces** for all components
4. **Consult Type Safety Expert** for complex scenarios

---

**REMEMBER: This document is LIVING and must be updated with each architectural decision. The Architecture Agent has FINAL AUTHORITY on all structural decisions.**

**ALL AGENTS MUST FOLLOW THESE PATTERNS EXACTLY. NO EXCEPTIONS.**

---

*This document establishes the unified architecture for Kuchisabishii. Compliance is mandatory for all development work.*