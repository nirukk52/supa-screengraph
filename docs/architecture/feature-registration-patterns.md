# Feature Registration Patterns

This document describes the patterns and best practices for implementing features in the Screengraph monorepo using the centralized feature registration system.

## Overview

The feature registration system enables clean architecture boundaries between the API layer and feature layers while maintaining discoverability and testability.

## Core Principles

### 1. Clean Boundaries
- **API Layer**: Never directly imports feature modules
- **Feature Layer**: Self-registers and exposes capabilities
- **Infrastructure Layer**: Shared utilities and providers

### 2. Feature Discovery
- Features register themselves with metadata
- API discovers features dynamically
- Capabilities exposed through registration

### 3. Type Safety
- Validated feature definitions
- TypeScript interfaces for all metadata
- Runtime validation of registrations

## Implementation Patterns

### Feature Registration

Every feature must implement a registration function:

```typescript
// packages/features/your-feature/src/registry.ts
import { registerFeature } from '@repo/api/src/feature-registry';

export interface YourFeatureConfig {
  maxItems?: number;
  timeout?: number;
}

export function registerYourFeature(config: YourFeatureConfig = {}) {
  registerFeature({
    id: 'your-feature',
    name: 'Your Feature Name',
    version: '1.0.0',
    description: 'What this feature does',
    dependencies: ['@sg/some-dependency'],
  });

  // Store configuration
  (globalThis as any).__yourFeatureConfig = config;
}

// Auto-register in Node.js
if (typeof window === 'undefined') {
  registerYourFeature();
}
```

### Feature Export

Export the registration function from your feature's main index:

```typescript
// packages/features/your-feature/src/index.ts
export { registerYourFeature, getYourFeatureConfig } from './registry';
// ... other exports
```

### API Integration

API modules dynamically load features:

```typescript
// packages/api/modules/your-domain/router.ts
import { getFeature, autoRegisterFeatures } from '../../src/feature-registry';

// Auto-register all features
autoRegisterFeatures();

export const yourRouter = publicProcedure.prefix("/api").router({
  ...getDynamicYourRoutes(),
});

function getDynamicYourRoutes() {
  const feature = getFeature('your-feature');
  if (!feature) {
    console.warn('your-feature not registered');
    return {};
  }

  try {
    const { getYourData, postYourAction } = require('@sg/your-feature');
    return {
      'your/data': getYourData,
      'your/action': postYourAction,
    };
  } catch (error) {
    console.warn('Could not load your-feature routes:', error.message);
    return {};
  }
}
```

## Best Practices

### Feature Structure
```
packages/features/your-feature/
├── src/
│   ├── registry.ts          # Registration logic
│   ├── index.ts            # Main exports
│   ├── application/        # Use cases
│   ├── domain/            # Domain models
│   └── infrastructure/    # External integrations
├── tests/                 # Feature-specific tests
└── package.json
```

### Naming Conventions
- **Feature IDs**: kebab-case (`agents-run`, `user-management`)
- **Registration Functions**: `register{FeatureName}Feature`
- **Config Functions**: `get{FeatureName}Config`

### Error Handling
- Graceful degradation when features unavailable
- Warning logs for missing features
- Fallback behavior for critical paths

### Testing
- Test feature registration independently
- Mock feature registry for API tests
- Integration tests for feature loading

## Migration Guide

### From Direct Imports

**Before:**
```typescript
// packages/api/modules/agents/router.ts
import { getStreamRun, postCancelRun } from '@sg/feature-agents-run';

export const agentsRouter = publicProcedure.router({
  'agents/stream': getStreamRun,
  'agents/cancel': postCancelRun,
});
```

**After:**
```typescript
// packages/api/modules/agents/router.ts
import { getFeature, autoRegisterFeatures } from '../../src/feature-registry';

autoRegisterFeatures();

export const agentsRouter = publicProcedure.router({
  ...getDynamicAgentRoutes(),
});

function getDynamicAgentRoutes() {
  const feature = getFeature('agents-run');
  if (!feature) return {};
  
  const { getStreamRun, postCancelRun } = require('@sg/feature-agents-run');
  return {
    'agents/stream': getStreamRun,
    'agents/cancel': postCancelRun,
  };
}
```

## Common Patterns

### Feature Configuration
```typescript
// Store configuration globally for feature access
(globalThis as any).__yourFeatureConfig = config;

// Access configuration from anywhere in the feature
export function getYourFeatureConfig(): YourFeatureConfig {
  return (globalThis as any).__yourFeatureConfig || {};
}
```

### Dependency Management
```typescript
// Declare dependencies in registration
registerFeature({
  id: 'your-feature',
  dependencies: ['@sg/agents-contracts', '@sg/eventbus'],
  // ... other metadata
});
```

### Feature Health Checks
```typescript
// Add health check to feature registration
registerFeature({
  id: 'your-feature',
  healthCheck: () => {
    // Verify dependencies are available
    return checkDependencies();
  },
});
```

## Troubleshooting

### Feature Not Loading
1. Check feature registration function is exported
2. Verify auto-registration is called
3. Check for import errors in feature module

### Circular Dependencies
1. Use dynamic imports (`require()`) in API layer
2. Avoid importing API modules from features
3. Use dependency injection for shared utilities

### Type Errors
1. Ensure feature registry types are exported
2. Check feature definition interface compliance
3. Verify TypeScript paths are configured

## Future Enhancements

- **Feature Health Monitoring**: Track feature availability and performance
- **Dynamic Feature Loading**: Load features on-demand based on requests
- **Feature Versioning**: Support multiple versions of the same feature
- **Feature Dependencies**: Automatic dependency resolution and loading