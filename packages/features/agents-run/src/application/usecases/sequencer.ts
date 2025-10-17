const nextByRun = new Map<string, number>();

export function nextSeq(runId: string): number {
	const next = nextByRun.get(runId) ?? 1;
	nextByRun.set(runId, next + 1);
	return next;
}

// Prime or override the next sequence number for a run (used after seeding RunStarted)
export function setNextSeq(runId: string, next: number): void {
	nextByRun.set(runId, next);
}
