# Project Structure

## Monorepo Organization

### Root Level
- **apps/**: Application entry points
- **packages/**: Shared libraries and services
- **tooling/**: Development tools and configurations
- **docs/**: Documentation and architecture decisions
- **config/**: Shared configuration packages

### Apps Structure
```
apps/
└── web/                    # Next.js frontend application
    ├── app/               # Next.js App Router pages
    │   ├── (marketing)/   # Marketing pages (grouped route)
    │   ├── (saas)/       # SaaS application (grouped route)
    │   └── api/          # API routes
    ├── modules/          # Feature modules
    │   ├── analytics/
    │   ├── marketing/
    │   ├── saas/
    │   ├── shared/
    │   └── ui/
    └── content/          # MDX content (docs, legal, posts)
```

### Packages Structure
```
packages/
├── agent/              # Python FastAPI service
├── api/               # Node.js oRPC API backend
├── auth/              # Authentication (better-auth)
├── database/          # Database layer (Prisma)
├── agents-contracts/  # Shared contracts and types
├── agents-core/       # Agent orchestration
├── eventbus/          # Event bus abstraction
├── eventbus-inmemory/ # In-memory event bus implementation
├── queue/             # Queue abstraction
├── queue-inmemory/    # In-memory queue implementation
├── features/          # Feature packages
│   └── agents-run/    # Agent execution feature
├── ai/                # AI/LLM integrations
├── i18n/              # Internationalization
├── logs/              # Logging utilities
├── mail/              # Email services
├── payments/          # Payment processing
├── storage/           # File storage abstraction
└── utils/             # Shared utilities
```

## Architecture Patterns

### Feature Registration System
- Features self-register with the API layer
- No direct imports between API and features
- Dynamic feature discovery and loading
- Clean architectural boundaries

### Contract-Driven Development
- All events, enums, and DTOs defined in `packages/agents-contracts`
- Single source of truth for data structures
- No string literals at application/infrastructure boundaries

### Layered Architecture
```
packages/features/your-feature/
├── src/
│   ├── registry.ts        # Feature registration
│   ├── application/       # Use cases and business logic
│   ├── domain/           # Domain models and entities
│   └── infrastructure/   # External integrations
└── tests/               # Feature-specific tests
```

## Naming Conventions

### Packages
- **Workspace prefixes**: `@repo/` for shared packages, `@sg/` for domain-specific
- **Feature IDs**: kebab-case (`agents-run`, `user-management`)
- **Package names**: kebab-case matching directory names

### Files and Directories
- **Directories**: kebab-case (`user-management`, `api-routes`)
- **TypeScript files**: camelCase (`userService.ts`, `apiClient.ts`)
- **React components**: PascalCase (`UserProfile.tsx`, `ApiStatus.tsx`)
- **Configuration files**: kebab-case (`biome.json`, `turbo.json`)

### Functions and Variables
- **Registration functions**: `register{FeatureName}Feature`
- **Config functions**: `get{FeatureName}Config`
- **Route handlers**: descriptive names (`getStreamRun`, `postCancelRun`)

## Import Patterns

### Workspace Dependencies
```typescript
// Use workspace protocol in package.json
"@repo/api": "workspace:*"
"@sg/agents-contracts": "workspace:*"

// Import from workspace packages
import { EventBus } from '@sg/eventbus';
import { UserService } from '@repo/api';
```

### Feature Loading
```typescript
// Dynamic imports for features (avoid circular dependencies)
const { getStreamRun } = require('@sg/feature-agents-run');

// Static imports for contracts
import { AgentRunEvent } from '@sg/agents-contracts';
```

## Configuration Management

### Environment Variables
- Root `.env` for shared configuration
- Package-specific `.env` files when needed
- Port configuration through environment variables
- dotenv-cli for consistent loading

### TypeScript Configuration
- Shared configs in `tooling/typescript/`
- Package-specific `tsconfig.json` extends shared configs
- Path mapping for workspace packages

### Build Configuration
- Turborepo for orchestration (`turbo.json`)
- Package-specific build scripts
- Shared tooling configurations in `tooling/`

## Testing Structure

### Unit Tests
- Co-located with source code or in `tests/` directory
- Vitest for TypeScript packages
- pytest for Python packages

### Integration Tests
- API integration tests in `packages/api/tests/`
- Feature-specific integration tests
- Database tests with test containers

### E2E Tests
- Playwright tests in `apps/web/tests/`
- Cross-service integration testing
- Mock service worker for API mocking