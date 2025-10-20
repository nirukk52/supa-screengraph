# Local CI Parity Guide

## Overview
This guide explains how to run the GitHub Actions workflow locally using `act` and ensure toolchain parity with `mise`.

## Setup Steps
1. Install dependencies:
   ```bash
   brew install act mise
   ```
2. Configure `act`:
   - `.actrc` already points to the GitHub runner image
   - `tooling/ci/act.env` contains required environment variables
3. Pin toolchain versions:
   ```bash
   mise install
   ```
   This enforces Node 20 and pnpm 10.14.0.

## Commands
- `pnpm ci:local` – run entire CI workflow locally
- `pnpm ci:local:lint` – run lint job only
- `pnpm ci:local:unit` – run unit tests job only
- `pnpm ci:local:be` – run backend e2e job
- `pnpm ci:local:web` – run frontend e2e job

## Pre-push Hook
Before pushing, the pre-push hook runs a fast `pr:check` with `SKIP_E2E` and `SKIP_COVERAGE`. Use `SKIP_PR_CHECK=1` to bypass deliberately.

## Troubleshooting
- Ensure Docker is running (required by `act`)
- For Apple Silicon, pass `--container-architecture linux/amd64`
- If environment variables differ, update `tooling/ci/act.env`

