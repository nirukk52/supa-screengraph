const nextByRun = new Map<string, number>();

export function nextSeq(runId: string): number {
	const next = nextByRun.get(runId) ?? 1;
	nextByRun.set(runId, next + 1);
	return next;
}
