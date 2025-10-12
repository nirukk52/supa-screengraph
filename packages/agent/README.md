# Agent Service

Python-based agent service for Screengraph application.

## Purpose

This package provides AI agent functionality and can be extended for:
- Machine learning inference
- Data processing pipelines
- Specialized backend logic
- Integration with Python-specific libraries

## Architecture

Follows clean architecture principles:
- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External integrations and adapters
- **API Layer**: FastAPI endpoints

## Development

### Prerequisites

- Python 3.11+
- [uv](https://github.com/astral-sh/uv) (recommended) or pip

### Setup

```bash
# Install dependencies with uv (recommended)
uv sync

# Or with pip
pip install -e ".[dev]"
```

### Running

```bash
# Development mode with hot reload
pnpm dev

# Production mode
pnpm start
```

### Testing

```bash
# Run all tests
pnpm test

# Run with coverage
uv run pytest --cov=agent --cov-report=html
```

### Code Quality

```bash
# Lint
pnpm lint

# Format
pnpm format

# Type check
pnpm type-check
```

## API Documentation

Once running, visit:
- API docs: http://localhost:8001/docs
- Alternative docs: http://localhost:8001/redoc

## Dependencies

- **FastAPI**: Modern, fast web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **httpx**: HTTP client for external API calls

## Testing

All tests are located in the `tests/` directory, following the same structure as `src/`.

## Integration with Node.js Backend

This service communicates with the Node.js backend via:
- HTTP/REST endpoints
- Shared data contracts (Pydantic models match TypeScript types)
- Environment-based configuration

## Environment Variables

Create a `.env` file:

```env
# API Configuration
PORT=8001
HOST=0.0.0.0

# Node.js Backend
BACKEND_API_URL=http://localhost:3000/api

# Add your environment variables here
```

