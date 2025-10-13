# TDD Playbook

## Workflow: Red → Green → Refactor
- Write a failing test (smallest observable failure)
- Implement just enough to pass
- Refactor safely (keep tests green)

## Test Structure
- Arrange → Act → Assert
- Prefer pure functions in domain/application; push I/O to infra
- Use table-driven tests for branches

## Fixtures & Utilities
- Shared fixtures in `:tests/_utils`; feature-specific in each feature
- Use deterministic seeds; avoid time/network unless mocked

## Coverage Expectations
- 80% patch coverage on changed lines (CI gate optional initially)
- Cover all branches for domain/application logic

## When to Write Tests
- TDD: before implementation for new logic
- Test-alongside: during development for complex flows
- After (legacy): when wrapping existing behavior

## Affected Tests (Pre-push)
- Run only tests impacted by changed files; fallback to full suite
- Skip via `SKIP_TESTS=1 git push` in emergencies

## Scaffolding Templates
- New features/packages include spec templates under `tests/unit` and `__tests__`
- Example path: `src/application/usecases/__tests__/my-usecase.spec.ts`

## Notes
- Contracts-first: schemas drive fixtures
- Multi-tenant cases require per-tenant fixtures
- Streaming: coalesce chatty signals in assertions
