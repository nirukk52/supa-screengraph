# ADR-0001: Feature Registration System

**Status**: Active  
**Date**: 2025-01-14  
**Context**: Need clean architecture boundaries between API and feature layers while enabling feature discoverability  
**Decision**: Implement centralized feature registration system  
**Consequences**: Enables dynamic feature loading, maintains clean boundaries, improves testability

## Context

The monorepo architecture requires clean separation between layers:
- **API Layer**: Handles HTTP requests, routing, middleware
- **Feature Layer**: Contains business logic, domain models, use cases
- **Infrastructure Layer**: Database, external services, providers

**Problem**: Direct imports between API and feature layers violate clean architecture principles and create tight coupling.

**Previous Approach**: API directly imported feature modules, creating circular dependencies and making testing difficult.

## Decision

Implement a **centralized feature registration system** that:

1. **Registers Features**: Features self-register with metadata (id, name, version, dependencies)
2. **Dynamic Loading**: API discovers and loads features without direct imports
3. **Type Safety**: Validated feature definitions with TypeScript interfaces
4. **Auto-Registration**: Features automatically register when imported

## Implementation

### Core Registry Interface

```typescript
interface FeatureDefinition {
  id: string;
  name: string;
  version: string;
  description?: string;
  router?: any;
  procedures?: any;
  dependencies?: string[];
}

interface FeatureRegistry {
  register(feature: FeatureDefinition): void;
  get(id: string): FeatureDefinition | undefined;
  getAll(): FeatureDefinition[];
  getByType(type: 'router' | 'procedures'): FeatureDefinition[];
  has(id: string): boolean;
  clear(): void;
}
```

### Feature Registration

```typescript
// packages/features/agents-run/src/registry.ts
export function registerAgentsRunFeature(config = {}) {
  registerFeature({
    id: 'agents-run',
    name: 'Agents Run Manager',
    version: '1.0.0',
    description: 'Manages agent execution runs',
    dependencies: ['@sg/agents-contracts', '@sg/eventbus', '@sg/queue']
  });
}
```

### Dynamic API Loading

```typescript
// packages/api/modules/agents/router.ts
function getDynamicAgentRoutes() {
  const agentsFeature = getFeature('agents-run');
  if (!agentsFeature) return {};
  
  const { getStreamRun, postCancelRun, postStartRun } = require('@sg/feature-agents-run');
  return {
    'agents/stream': getStreamRun,
    'agents/cancel': postCancelRun,
    'agents/start': postStartRun,
  };
}
```

## Options Considered

### Option A: Direct Imports
**Pros**: Simple, immediate
**Cons**: Violates clean architecture, creates tight coupling, hard to test

### Option B: Dependency Injection
**Pros**: Testable, flexible
**Cons**: Complex setup, runtime overhead, configuration complexity

### Option C: Feature Registration (Chosen)
**Pros**: Clean boundaries, discoverable, testable, maintainable
**Cons**: Slight complexity, requires discipline

## Consequences

### Positive
- ✅ **Clean Architecture**: No cross-layer imports
- ✅ **Discoverability**: Features self-document through registration
- ✅ **Testability**: Clear separation enables better testing
- ✅ **Maintainability**: Easy to add/remove features
- ✅ **Type Safety**: Validated feature definitions

### Negative
- ⚠️ **Complexity**: Slightly more complex than direct imports
- ⚠️ **Discipline**: Requires consistent registration patterns
- ⚠️ **Runtime Discovery**: Features loaded dynamically vs statically

## Rationale

1. **Clean Boundaries**: Maintains architectural separation between layers
2. **Testability**: Enables testing API without feature dependencies
3. **Scalability**: Easy to add new features without modifying API
4. **Discoverability**: Features expose their capabilities through metadata

## Next Steps

1. **Documentation**: Update architecture docs with registration patterns
2. **Testing**: Expand test coverage for feature registry
3. **Monitoring**: Add feature health checks and metrics
4. **Validation**: Ensure all features follow registration patterns

## Related ADRs

- [ADR-0000: Template](./0000-template.md) - ADR structure and process

## References

- [Clean Architecture by Robert Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature Toggles Pattern](https://martinfowler.com/articles/feature-toggles.html)
- [Plugin Architecture Patterns](https://en.wikipedia.org/wiki/Plugin_architecture)