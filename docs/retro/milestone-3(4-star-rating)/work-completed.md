Overview of Work Completed (Actual implementation may vary)
# 🧩 Milestone 1 — Scaffolding and Boundaries  
**PR:** `scaffolding`  
**Goal:** Establish foundational structure, enforce architectural boundaries, and define hygiene rules.

---

## ✅ Deliverables

1. **Scaffolding CLI and Templates**
   - `tooling/scripts/scaffold/` — CLI for package/feature scaffolding  
   - Templates:  
     - `templates/package/`  
     - `templates/feature/`  
   - Runnable harness (`pnpm dev:feature:<name>`) to test new modules end-to-end.

2. **Boundary Enforcement**
   - Package metadata (`package.json`):
     ```json
     {
       "sg:layer": "contracts" | "domain" | "application" | "infra" | "feature",
       "sg:scope": "eventbus" | "queue" | "agents-run" | "shared" | "<feature-name>"
     }
     ```
   - `dependency-cruiser` reads metadata to enforce:
     ```
     contracts → domain → application → infra
     (no back edges)
     ```
   - Features can depend on shared libs, **never on other features**.

3. **Architecture Lints**
   - `eslint` rules:
     - `max-lines`: ≤150  
     - `max-lines-per-function`: ≤75  
     - `switch-exhaustiveness-check`
     - Custom rule: **no-exported-literals** (except in `contracts` and `tests`)
   - `dependency-cruiser` + `commitlint` integrated.
   - `scripts/check-arch.ts` → `pnpm lint:arch`

4. **Docs and Hygiene**
   - `claude.md` — standard per package (sections: Purpose, Inputs, Outputs, Ports, Adapters, Memory Hooks)  
   - `docs/adr/0000-template.md` — ADR base  
   - `docs/architecture/flow.md` — declared canonical  
   - `.github/PULL_REQUEST_TEMPLATE.md` — checklist (boundaries, literals, tests, docs)  
   - `CODEOWNERS` — ownership enforced  
   - `README.md` — explains dev harness, adapter replacement

---

## 📁 Standard Package Structure

packages/<name>/
claude.md
package.json # includes sg:layer & sg:scope
src/
contracts/
domain/
application/
infra/
tests/
unit/
integration/


- Exactly **4 folders** under `src`: `contracts`, `domain`, `application`, `infra`.
- Feature template includes a **dev harness** that runs an in-memory bus/queue and logs function traces.

---

## 🧰 Commands / Tasks

| Command | Description |
|----------|--------------|
| `pnpm scaffold:package <name>` | Generate new library package |
| `pnpm scaffold:feature <name>` | Generate new feature package |
| `pnpm lint:arch` | Validate architectural boundaries |
| `pnpm lint` | Run ESLint (size, literals, style) |
| `pnpm commit` | Commitlint validation |

---

## 🎯 Acceptance Criteria

- Running scaffold commands produces **runnable modules** with working dev harness.
- `pnpm lint:arch` **fails** on cross-feature or back-edge violations.
- ESLint **enforces** size caps and literal export restrictions.
- PR template and `CODEOWNERS` present; ADR template committed.
- `docs/architecture/flow.md` marked **canonical**.
- Contracts remain **single source of truth**.

---

# ⚙️ Milestone 2 — Contracts and First Debug Flow  
**PR:** `debug-flow`  
**Goal:** Wire up first runnable flow with contracts, ports/adapters, and feature echo.

---

## ✅ Deliverables

### Core Contracts
- `packages/agents-contracts/src/contracts/{events.ts, constants.ts}`
  - Events:  
    `RunStarted`, `NodeStarted`, `NodeFinished`, `RunFinished`, `DebugTrace`

### Event Bus and Queue
- **Ports:**  
  - `packages/eventbus/src/port.ts`  
  - `packages/queue/src/port.ts`
- **Adapters (in-memory):**  
  - `packages/eventbus-inmemory/src/index.ts`  
  - `packages/queue-inmemory/src/index.ts`

### Feature: `agents-run`
packages/features/agents-run/
src/
contracts/events.ts # re-exports from agents-contracts
application/usecases/
start-run.ts
stream-run.ts
cancel-run.ts
infra/api/
post-start-run.ts
get-stream-run.ts
post-cancel-run.ts
infra/workers/
run-worker.ts # simulated loop emits DebugTrace events

- `packages/api` dynamically loads feature router via `register(router)` hook.

---

## 🧩 Flow Summary

1. **POST** `/agents/runs` with `{ runId }`
2. Worker simulates execution loop:
runId_NodeStarted(EnsureDevice)
...
runId_RunFinished
3. **GET** `/agents/runs/{id}/stream` emits **DebugTrace** events (SSE or logs).

---

## 🎯 Acceptance Criteria

- `/agents/runs` endpoint echoes runId through all layers.
- Stream shows sequence of node-level debug traces.
- Logs print **function names** in correct order across packages.
- No sensitive or extraneous data in output.
- End-to-end run fully observable through **contracts + adapters + logs**.

---