import { db } from "@repo/database/prisma/client";
import type { AgentEvent } from "@sg/agents-contracts";
import { TOPIC_AGENTS_RUN } from "@sg/agents-contracts";
import { bus } from "../../application/singletons";

export async function startOutboxWorker(pollMs = 200) {
	async function tick() {
		// Find candidate runs where nextSeq <= lastSeq
		const candidates = await db.runOutbox.findMany({
			take: 50,
			orderBy: { updatedAt: "asc" },
		});

		for (const c of candidates) {
			await db.$transaction(
				async (tx) => {
					// Lock outbox row by updating a no-op field (updatedAt via update)
					const outbox = await tx.runOutbox.update({
						where: { runId: c.runId },
						data: {},
					});
					const run = await tx.run.findUniqueOrThrow({
						where: { id: c.runId },
					});
					if (outbox.nextSeq > run.lastSeq) {
						return; // nothing to publish
					}

					const evtRow = await tx.runEvent.findUnique({
						where: {
							runId_seq: { runId: c.runId, seq: outbox.nextSeq },
						},
					});
					if (!evtRow) {
						return; // inconsistent append; guardrail elsewhere
					}
					if (evtRow.publishedAt) {
						return; // already published
					}

					const evt: AgentEvent = {
						runId: evtRow.runId,
						seq: evtRow.seq,
						ts: Number(evtRow.ts),
						type: evtRow.type as AgentEvent["type"],
						v: 1,
						source: "outbox",
						...(evtRow.name ? { name: evtRow.name } : {}),
						...(evtRow.fn ? { fn: evtRow.fn } : {}),
					} as AgentEvent;

					// Publish then mark (at-least-once publish)
					await bus.publish(TOPIC_AGENTS_RUN, evt);

					await tx.runEvent.update({
						where: {
							runId_seq: { runId: c.runId, seq: outbox.nextSeq },
						},
						data: { publishedAt: new Date() },
					});
					await tx.runOutbox.update({
						where: { runId: c.runId },
						data: { nextSeq: { increment: 1 } },
					});

					if (evt.type === "RunFinished") {
						await tx.run.update({
							where: { id: c.runId },
							data: {
								state: "finished",
								finishedAt: new Date(evt.ts),
							},
						});
					}
				},
				{ timeout: 5000 },
			);
		}
	}

	const id = setInterval(() => {
		tick().catch(() => {});
	}, pollMs);
	return () => clearInterval(id);
}
