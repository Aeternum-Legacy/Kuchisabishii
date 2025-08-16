# Architectural Decision Templates
## AUTHORITY: Architecture Agent (Weight 10)

This document provides standardized templates for making and documenting architectural decisions in the Kuchisabishii platform.

## 🏛️ DECISION AUTHORITY MATRIX

### Decision Types by Weight:
- **Weight 10 (Architecture Agent)**: Structural patterns, type hierarchies, interface standards
- **Weight 9 (Queen-Strategic)**: Cross-feature coordination, integration patterns  
- **Weight 8 (Type Safety Expert)**: TypeScript patterns, validation schemas
- **Weight 7 (Specialists)**: Domain-specific implementations within approved patterns
- **Weight 5 (General)**: Implementation details following established patterns

## 📋 ARCHITECTURAL DECISION TEMPLATE

### Format: ADR-[Number]-[Brief-Title]

```markdown
# ADR-XXX: [Brief Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[Describe the situation requiring a decision]

## Decision
[State the decision clearly]

## Consequences
### Positive:
- [Benefit 1]
- [Benefit 2]

### Negative:
- [Trade-off 1]
- [Trade-off 2]

## Implementation
### Required Changes:
- [Change 1]
- [Change 2]

### Migration Path:
- [Step 1]
- [Step 2]

## Compliance Requirements
- [Pattern that must be followed]
- [Type requirements]
- [Interface standards]

## Authority
**Decision Maker**: [Agent Name] (Weight [X])
**Approved By**: Architecture Agent
**Date**: [YYYY-MM-DD]
**Version**: [X.X.X]
```

## 🎯 DECISION CATEGORIES

### 1. Type System Decisions
**Template**: ADR-TYPE-XXX
**Authority**: Weight 8+ (Type Safety Expert or higher)

```markdown
# ADR-TYPE-XXX: [Type Decision Title]

## Type Pattern
[Describe the type pattern or interface]

## Usage Context
[When this type should be used]

## Implementation
```typescript
// Type definition
interface Example extends BaseComponent<DataType> {
  // Properties and methods
}
```

## Validation Rules
- [Rule 1]
- [Rule 2]

## Forbidden Patterns
- [Anti-pattern 1]
- [Anti-pattern 2]
```

### 2. Component Architecture Decisions
**Template**: ADR-COMP-XXX
**Authority**: Weight 7+ (Component Specialist or higher)

```markdown
# ADR-COMP-XXX: [Component Decision Title]

## Component Pattern
[Describe the component architecture pattern]

## Props Interface
```typescript
interface ComponentProps extends StandardComponentProps<DataType> {
  // Specific props
}
```

## State Management
[How state should be handled in this component type]

## Event Handling
[Standard event patterns for this component]

## Testing Requirements
- [Test requirement 1]
- [Test requirement 2]
```

### 3. API Architecture Decisions
**Template**: ADR-API-XXX
**Authority**: Weight 8+ (Type Safety Expert or higher)

```markdown
# ADR-API-XXX: [API Decision Title]

## Endpoint Pattern
[Describe the API endpoint pattern]

## Request/Response Format
```typescript
// Request type
interface Request {
  // Properties
}

// Response type
interface Response extends ApiResponse<DataType> {
  // Additional properties
}
```

## Error Handling
[Standard error response patterns]

## Validation
[Request validation requirements]

## Rate Limiting
[Rate limiting patterns]
```

### 4. State Management Decisions
**Template**: ADR-STATE-XXX
**Authority**: Weight 9+ (Queen-Strategic or higher)

```markdown
# ADR-STATE-XXX: [State Decision Title]

## State Layer
[Which layer this state belongs to: local, feature, global]

## State Shape
```typescript
interface StateShape {
  // State structure
}
```

## Actions/Reducers
[How state updates should be handled]

## Context Pattern
[If using React Context, describe the pattern]

## Performance Considerations
- [Consideration 1]
- [Consideration 2]
```

## 🔄 DECISION PROCESS WORKFLOW

### 1. Identify Need for Decision
```
Trigger: [New pattern needed | Conflict identified | Standard missing]
Agent: [Requesting agent name and weight]
Scope: [Local component | Feature-wide | Platform-wide]
```

### 2. Research Existing Patterns
```
Check: 
- /docs/KUCHISABISHII_ARCHITECTURE.md
- /src/types/base.ts
- Existing implementations
- Similar patterns in codebase
```

### 3. Draft Decision Document
```
Use appropriate template above
Include all required sections
Provide clear implementation guidance
Address compliance requirements
```

### 4. Review and Approval Process
```
Weight 5-6: Submit to specialist (Weight 7+)
Weight 7: Submit to Type Safety Expert (Weight 8+)
Weight 8: Submit to Queen-Strategic (Weight 9+)
Weight 9: Submit to Architecture Agent (Weight 10)
Weight 10: Final authority, no higher approval needed
```

### 5. Implementation and Documentation
```
Update architecture framework
Create migration plan if needed
Communicate to all relevant agents
Update compliance checklists
```

## 📚 DECISION REPOSITORY

### Active Decisions Log:
- **ADR-001**: Base Type System Establishment
- **ADR-002**: Standard Component Props Pattern
- **ADR-003**: API Response Standardization
- **ADR-004**: State Management Layer Architecture
- **ADR-005**: Error Handling Patterns

### Decision Categories:
- **TYPE**: Type system and interface decisions
- **COMP**: Component architecture patterns
- **API**: API design and standards
- **STATE**: State management patterns
- **PERF**: Performance optimization decisions
- **SEC**: Security implementation patterns

## ⚡ RAPID DECISION PROTOCOL

### For Urgent Decisions (Production Blockers):
1. **Immediate consultation** with highest available weight
2. **Temporary approval** for immediate fix
3. **Full review process** within 24 hours
4. **Documentation update** within 48 hours

### Emergency Override:
- Only Architecture Agent (Weight 10) can override established patterns
- Must document reason and timeline for proper resolution
- Requires immediate follow-up with formal ADR

## 🛡️ DECISION ENFORCEMENT

### Compliance Monitoring:
- All new code must reference applicable ADRs
- Code reviews must verify ADR compliance
- Architecture Agent reviews structural changes
- Regular compliance audits

### Violation Response:
1. **Immediate halt** of non-compliant implementation
2. **Reference** to applicable ADR
3. **Correction** following proper pattern
4. **Education** to prevent future violations

## 📞 DECISION SUPPORT

### For Pattern Questions:
1. Search existing ADRs first
2. Check architecture framework
3. Consult appropriate authority level
4. Document resolution if new pattern needed

### For Implementation Questions:
1. Reference specific ADR
2. Check compliance requirements
3. Review migration path if applicable
4. Escalate conflicts to higher authority

---

**This template system ensures consistent, well-documented architectural decisions across the Kuchisabishii platform. All agents must follow these templates and processes for any architectural decisions.**

**Architecture Agent has final authority on all decision templates and processes.**