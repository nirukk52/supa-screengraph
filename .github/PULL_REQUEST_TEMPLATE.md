## Summary

- What changed and why?

## Checklist

- [ ] Conventional Commit in PR title
- [ ] Boundaries respected (no cross-feature imports; contracts→domain→application→infra only)
- [ ] No exported string literals outside contracts/tests
- [ ] All external inputs validated (zod) and unknowns normalized
- [ ] Unit tests for logic branches; integration tests for routes/workers
- [ ] Updated claude.md (Purpose, Inputs, Outputs, Ports, Adapters, Memory Hooks)
- [ ] ADR added/updated if ports/adapters or boundaries changed
- [ ] Diagrams align with docs/architecture/flow.md (canonical)

## Links

- ADR:
- Issue:
- Diagram:


