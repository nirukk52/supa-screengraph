# supa-screengraph

[![codecov](https://codecov.io/gh/nirukk52/supa-screengraph/branch/main/graph/badge.svg)](https://codecov.io/gh/nirukk52/supa-screengraph)

## Some background
We are building our SAAS on top of supastarter starter repo.

## What we are building
A modular SAAS app.
A SAAS app where you can connect your apk file and it crawls through your android app and generates a screengraph.

## Architecture

This is a hybrid monorepo containing:
- **TypeScript/Node.js** packages for web frontend and API backend
- **Python** agent service for specialized processing (APK analysis, graph generation)

### Packages
- `packages/api` - Node.js API backend (oRPC)
- `packages/agent` - Python agent service (FastAPI)
- `packages/auth` - Authentication (better-auth)
- `packages/database` - Database layer (Prisma/Drizzle)
- Other supporting packages (ai, mail, payments, storage, etc.)

## Development

### Prerequisites
- Node.js 20+
- Python 3.11+
- pnpm (for Node.js packages)
- uv (recommended for Python packages)

### Getting Started

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies (in packages/agent)
cd packages/agent
uv sync

# Start development servers
pnpm dev  # Starts both Node.js and Python services
```

## Helpful links

- [📘 Documentation](https://supastarter.dev/docs/nextjs)
- [🚀 Demo](https://demo.supastarter.dev)
