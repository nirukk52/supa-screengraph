import type { AgentEvent } from "@sg/agents-contracts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type StreamStatus = "idle" | "connecting" | "streaming" | "error";

export interface StreamEvent extends AgentEvent {
	name?: string;
	fn?: string;
}

export interface RunStreamStats {
	startTime: number | null;
	latestSeq: number | null;
	totalEvents: number;
	finished: boolean;
}

export interface UseRunStreamResult {
	events: StreamEvent[];
	status: StreamStatus;
	errorMessage: string | null;
	stats: RunStreamStats;
	startRun: () => Promise<void>;
	connect: (options?: { fromSeq?: number }) => void;
	disconnect: () => void;
	clearEvents: () => void;
}

function buildStreamPath(runId: string, fromSeq?: number) {
	const base = `/api/agents/runs/${encodeURIComponent(runId)}/stream`;
	return typeof fromSeq === "number" ? `${base}?fromSeq=${fromSeq}` : base;
}

export function useRunStream(runId: string): UseRunStreamResult {
	const [events, setEvents] = useState<StreamEvent[]>([]);
	const [status, setStatus] = useState<StreamStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		return () => {
			eventSourceRef.current?.close();
		};
	}, []);

	const stats = useMemo<RunStreamStats>(() => {
		return {
			startTime: events[0]?.ts ?? null,
			latestSeq: events.at(-1)?.seq ?? null,
			totalEvents: events.length,
			finished: events.some((event) => event.type === "RunFinished"),
		};
	}, [events]);

	const disconnect = useCallback(() => {
		eventSourceRef.current?.close();
		eventSourceRef.current = null;
		setStatus("idle");
	}, []);

	const handleMessage = useCallback((event: MessageEvent<string>) => {
		try {
			const data = JSON.parse(event.data) as StreamEvent;
			setEvents((prev) => {
				if (prev.some((existing) => existing.seq === data.seq)) {
					return prev;
				}
				return [...prev, data].sort((a, b) => a.seq - b.seq);
			});
		} catch (error) {
			console.error("Unable to parse stream payload", error);
		}
	}, []);

	const connect = useCallback(
		(options?: { fromSeq?: number }) => {
			if (typeof window === "undefined") {
				return;
			}

			eventSourceRef.current?.close();
			eventSourceRef.current = null;

			setStatus("connecting");
			setErrorMessage(null);

			const source = new EventSource(
				buildStreamPath(runId, options?.fromSeq),
			);
			eventSourceRef.current = source;

			source.onopen = () => {
				setStatus("streaming");
			};

			source.onmessage = (message) => {
				handleMessage(message);
			};

			source.onerror = () => {
				setStatus("error");
				setErrorMessage("Connection lost. Please reconnect.");
				source.close();
				eventSourceRef.current = null;
			};
		},
		[handleMessage, runId],
	);

	const startRun = useCallback(async () => {
		if (typeof window === "undefined") {
			return;
		}

		try {
			setStatus("connecting");
			setErrorMessage(null);
			setEvents([]);

			const response = await fetch("/api/agents/runs", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ runId }),
			});

			if (!response.ok) {
				throw new Error(`Unable to start run (${response.status})`);
			}

			connect();
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Unable to start the run";
			setStatus("error");
			setErrorMessage(message);
		}
	}, [connect, runId]);

	const clearEvents = useCallback(() => {
		setEvents([]);
	}, []);

	return {
		events,
		status,
		errorMessage,
		stats,
		startRun,
		connect,
		disconnect,
		clearEvents,
	};
}
