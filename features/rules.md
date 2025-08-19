# Kuchisabishii Development Rules & Hive Protocol

## 🚨 MANDATORY RULES FOR ALL CLAUDE SESSIONS

### 1. **SPARC Hive Initialization Protocol**
**REQUIREMENT**: At the start of every session, unless explicitly told otherwise:

```bash
# Initialize SPARC-based persistent hive
npx claude-flow sparc pipeline "session-initialization"
```

**VERIFICATION STEPS**:
- Launch current SPARC-based persistent hive
- Provide hive status and structure for verification
- Confirm all agents are operational and coordinated

### 2. **Queen Strategic Coordination**
**REQUIREMENT**: Unless otherwise explicitly directed:

- **ALL actions** shall be performed through coordination of the Queen
- **ALL agents** must execute under Queen's strategic command
- Use `Task` tool to deploy specialized agents for complex work
- Queen provides consolidated reports and strategic direction

**FORBIDDEN**: Direct execution without Queen coordination

### 3. **Remote Deployment Only**
**REQUIREMENT**: The hive shall NOT use localhost servers

- **ALL design and coding** for remote deployment purposes only
- **NO localhost references** in production code
- **NO hardcoded localhost URLs** anywhere in codebase
- Environment detection must work for any deployment URL

**FORBIDDEN**: Any localhost dependencies or hardcoded localhost references

### 4. **Staging Deployment Default**
**REQUIREMENT**: Unless otherwise explicitly told:

- **ALL deployments** target staging environment by default
- Use staging branch for all commits and pushes
- Staging URL: Uses NEXTAUTH_URL environment variable
- Test on staging before any production considerations

### 5. **Dynamic URL Resolution**
**REQUIREMENT**: Do NOT hardcode URLs into code

- Use environment-aware URL resolution (`getBaseUrl()`)
- Prioritize NEXTAUTH_URL and VERCEL_URL environment variables
- All URLs must be dynamically generated based on deployment environment
- Email templates, OAuth callbacks, and redirects must be environment-aware

**FORBIDDEN**: Any hardcoded URLs (localhost, staging, production)

### 6. **Architecture Conformance**
**REQUIREMENT**: Always conform design to Architecture.md

- Review `features/Architecture.md` before implementing any features
- Ensure new code follows established patterns and conventions
- Maintain consistency with existing architecture decisions
- Update Architecture.md if new patterns are introduced

## 📋 Session Initialization Checklist

Before starting any work, verify:

- [ ] SPARC hive initialized and operational
- [ ] Queen coordination protocol active
- [ ] All agents responding to Queen commands
- [ ] Architecture.md reviewed and understood
- [ ] Staging deployment environment confirmed
- [ ] No localhost dependencies identified

## 🎯 Hive Agent Roles

### **Strategic Queen** 👑
- Coordinates all agent activities
- Provides consolidated strategic direction
- Ensures architectural consistency
- Manages complex multi-agent tasks

### **Core Development Agents**
- **Database Architect**: Schema design and database operations
- **Authentication Specialist**: Security and OAuth implementations  
- **Environment Detective**: Deployment and configuration management
- **Performance Optimizer**: Speed and efficiency improvements
- **Integration Tester**: End-to-end workflow validation

### **Specialized Agents** (Deploy as needed)
- **SPARC Coordinator**: Methodology compliance
- **Code Reviewer**: Quality assurance
- **Security Manager**: Vulnerability assessment
- **Documentation Specialist**: Technical writing

## 🚀 Deployment Protocol

### Standard Development Flow:
1. Initialize SPARC hive with Queen coordination
2. Review Architecture.md for context
3. Deploy relevant agents through Queen
4. Implement solutions with staging target
5. Test on remote staging environment
6. Commit to staging branch
7. Verify deployment success

### Emergency Protocol:
- Critical issues may bypass some steps with explicit authorization
- Always maintain Queen coordination even in emergency mode
- Document any architecture deviations for future review

## 📖 Documentation Standards

### Feature Documentation:
- Each new feature gets its own `<feature>.md` file in `/features`
- Follow SPARC methodology documentation patterns
- Include architecture impact analysis
- Document environment and deployment considerations

### Code Documentation:
- Inline comments for complex logic
- Architecture decision records for significant changes
- Update Architecture.md for structural changes
- Maintain deployment and environment documentation

---

**CRITICAL**: These rules ensure consistency, maintainability, and quality across all development sessions. Violation of these rules may result in deployment failures, security vulnerabilities, or architectural debt.

**VERSION**: 1.0
**LAST UPDATED**: 2025-01-19
**ENFORCED BY**: Strategic Queen and Hive Protocol