# Architectural Consultation Protocols
## AUTHORITY: Architecture Agent (Weight 10)

This document establishes the mandatory consultation protocols for all agents working on the Kuchisabishii platform.

## 🏛️ WEIGHTED EXPERT SYSTEM

### Authority Hierarchy
```
User → Queen-Strategic → Architecture Agent → Specialized Agents → General Agents
```

### Weight Distribution
- **Architecture Agent**: Weight 10 (structural authority)
- **Queen-Strategic**: Weight 9 (coordination oversight)
- **Type Safety Expert**: Weight 8 (TypeScript decisions)
- **Component Specialists**: Weight 7 (domain expertise)
- **General Development**: Weight 5 (implementation only)

## 📋 MANDATORY CONSULTATION PROCESS

### BEFORE Creating New Components
1. **Check existing patterns** in `/docs/KUCHISABISHII_ARCHITECTURE.md`
2. **If pattern exists**: Follow exactly, no modifications
3. **If pattern missing**: Request architectural decision from Architecture Agent
4. **Document decision** in architecture framework
5. **NEVER create new patterns** without Weight 10 approval

### BEFORE Modifying Existing Components
1. **Identify current pattern** used in component
2. **Verify compliance** with architecture framework
3. **If non-compliant**: Plan migration to compliant pattern
4. **If uncertain**: Escalate to Architecture Agent
5. **Document changes** that affect architecture

### BEFORE Creating New APIs
1. **Follow ApiResponse pattern** from base types
2. **Use proper error handling** patterns
3. **Implement consistent validation**
4. **Get approval** for new endpoint patterns
5. **Document all endpoints** with proper types

## 🚨 ESCALATION TRIGGERS

### Automatic Escalation Required For:
- New interface patterns not in base types
- Function signature conflicts
- State management pattern changes
- Data flow modifications
- Type system extensions
- Component prop pattern variations

### Consultation Format:
```
ARCHITECTURAL CONSULTATION REQUEST
Agent: [Agent Name]
Weight: [Agent Weight]
Issue: [Brief description]
Current Pattern: [What exists now]
Proposed Pattern: [What you want to implement]
Justification: [Why the change is needed]
Impact Assessment: [What will be affected]
```

## ✅ APPROVED DECISION MAKING

### Weight 10 (Architecture Agent) Can:
- Create new architectural patterns
- Modify existing patterns
- Override any structural decisions
- Establish new type hierarchies
- Define component interfaces

### Weight 8-9 Can:
- Suggest architectural improvements
- Implement approved patterns
- Escalate conflicts for resolution
- Document implementation details

### Weight 5-7 Can:
- Follow existing patterns exactly
- Request pattern clarification
- Report pattern violations
- Implement approved designs only

## 🛡️ ENFORCEMENT PROTOCOL

### Pattern Violation Response:
1. **Immediate halt** of non-compliant implementation
2. **Escalation** to Architecture Agent
3. **Pattern correction** with proper approval
4. **Documentation update** if pattern evolves
5. **Knowledge sharing** to prevent future violations

### Architecture Document Authority:
- `/docs/KUCHISABISHII_ARCHITECTURE.md` is **SINGLE SOURCE OF TRUTH**
- `/src/types/base.ts` contains **FOUNDATIONAL TYPES**
- All decisions must reference these documents
- Updates require Architecture Agent approval

## 📞 CONSULTATION CHANNELS

### For Pattern Questions:
1. Check architecture framework first
2. Search existing implementations
3. Request guidance from Architecture Agent
4. Document resolution in framework

### For Type System Questions:
1. Reference base types in `/src/types/base.ts`
2. Use discriminated unions for complex states
3. Extend base interfaces for all components
4. Consult Type Safety Expert for complex scenarios

### For Integration Questions:
1. Follow unidirectional data flow patterns
2. Use standardized error handling
3. Implement consistent async operations
4. Escalate cross-component conflicts

## 🎯 SUCCESS METRICS

### Compliance Achieved When:
- ✅ Zero unauthorized pattern creation
- ✅ All components follow base type extensions
- ✅ Consistent consultation process followed
- ✅ Architecture framework remains current
- ✅ All agents understand authority hierarchy
- ✅ Escalation process working effectively

## 📚 REFERENCE MATERIALS

### Required Reading:
- `/docs/KUCHISABISHII_ARCHITECTURE.md` - Complete framework
- `/src/types/base.ts` - Foundational types
- This document - Consultation protocols

### Pattern Libraries:
- Standard component props patterns
- API response patterns
- State management patterns
- Error handling patterns
- Validation patterns

---

**REMEMBER: Architecture Agent has FINAL AUTHORITY on all structural decisions. This consultation protocol ensures systematic, consistent development across all agents.**

**COMPLIANCE IS MANDATORY. NO EXCEPTIONS.**