export const RUNS_BASE = "/api/agents/runs" as const;

export function buildStreamPath(runId: string, fromSeq?: number): string {
	const base = `${RUNS_BASE}/${encodeURIComponent(runId)}/stream`;
	return typeof fromSeq === "number" ? `${base}?fromSeq=${fromSeq}` : base;
}

export function buildStartRunPath(): string {
	return `${RUNS_BASE}/start`;
}
