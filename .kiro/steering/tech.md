# Technology Stack

## Architecture
Hybrid monorepo with TypeScript/Node.js frontend/backend and Python agent services for specialized APK processing.

## Build System & Package Management
- **Monorepo**: Turborepo for build orchestration
- **Package Manager**: pnpm with workspaces
- **Node.js**: Version 20+ required
- **Python**: Version 3.11+ required (uv recommended for Python packages)

## Frontend Stack
- **Framework**: Next.js 15 with App Router
- **UI**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Authentication**: better-auth
- **Forms**: React Hook Form with Zod validation

## Backend Stack
- **API**: oRPC (type-safe RPC)
- **Database**: Prisma ORM
- **Queue**: Custom queue abstraction with in-memory implementation
- **Event Bus**: Custom event bus with RxJS
- **Dependency Injection**: Awilix container

## Python Services
- **Framework**: FastAPI
- **Package Management**: uv with pyproject.toml
- **Code Quality**: Ruff (linting), MyPy (type checking)
- **Testing**: pytest with async support

## Code Quality & Formatting
- **Linter/Formatter**: Biome (replaces ESLint/Prettier)
- **Git Hooks**: Husky with commitlint
- **Architecture**: Custom dependency cruiser rules
- **Testing**: Vitest for unit tests, Playwright for E2E

## Common Commands

### Development
```bash
# Start all services
pnpm dev

# Start with specific concurrency
pnpm dev --concurrency 15

# Restart development servers
pnpm dev:restart
```

### Building & Testing
```bash
# Build all packages
pnpm build

# Run all tests
pnpm test

# Run database tests
pnpm test:db

# Backend-specific tests
pnpm backend:test
```

### Code Quality
```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Check architecture rules
pnpm lint:arch

# Type check
pnpm type-check
```

### Python Agent (in packages/agent)
```bash
# Install dependencies
uv sync

# Run tests
uv run pytest

# Start development server
uv run python -m src.cli dev
```

## Environment Variables
- Uses dotenv-cli for environment management
- Global environment variables defined in turbo.json
- Port configuration: WEB_PORT, AGENT_PORT, APPIUM_PORT, MAIL_PREVIEW_PORT