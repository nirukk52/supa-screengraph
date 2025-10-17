# Philosophy (4/6)

## Clean Architecture, pragmatic
- Domain/application code is pure; infra is replaceable adapters.
- Features orchestrate flows; packages provide capabilities.
- Contracts are the boundary language.

## TDD where it pays
- Write tests first for domain/application; infra can follow with integration tests.
- Use fixtures for contract tests; prevent breaking changes.

## Small, iterative delivery
- One vertical slice at a time; demo via a stream & timeline.
- Swap in real adapters only after the slice is stable.

## Observability as a feature
- Design spans/metrics alongside the code; ensure debugability before scale.

## Defaults
- TypeScript everywhere; no implicit any; enums/constants only.
- RSC-first UI; minimal client JS; streaming UX.

## Founders Mantras:
Speed and isolation first, determinism second, scale later.
Developer experience and rapid dev efforts should keep on going up.