/**
 * Idempotency key
 * Shape is frozen in M3 to enable M4 outbox without churn.
 */
export function computeIdKey(
	runId: string,
	nodeName: string,
	attempt: number,
): string {
	return `${runId}:${nodeName}:${attempt}`;
}
