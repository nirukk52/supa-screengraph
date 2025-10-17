/**
 * Clock port
 *
 * TS Note: Injected for determinism in tests. Mirrors Python design: no direct Date.now() calls.
 */
export interface Clock {
	now(): number;
}
