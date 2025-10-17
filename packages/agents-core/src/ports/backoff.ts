/**
 * Backoff policy shapes (no timers in M3)
 */
export interface RetryPolicy {
	maxAttempts: number;
}

export interface TimeoutPolicy {
	ms: number;
}
