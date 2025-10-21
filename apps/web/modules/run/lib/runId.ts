export function generateRunId(): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).substring(2, 9);
	return `run_${timestamp}_${random}`;
}
