"use client";

import type { AgentEvent } from "@sg/agents-contracts";
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import { cn } from "@ui/lib";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type StreamStatus = "idle" | "connecting" | "streaming" | "error";

interface RunStreamViewerProps {
	runId: string;
}

interface StreamEvent extends AgentEvent {
	name?: string;
	fn?: string;
}

interface RunStreamStats {
	startTime: number | null;
	latestSeq: number | null;
	totalEvents: number;
	finished: boolean;
}

interface UseRunStreamResult {
	events: StreamEvent[];
	status: StreamStatus;
	errorMessage: string | null;
	apkPath: string | null;
	stats: RunStreamStats;
	startRun: () => Promise<void>;
	connect: (options?: { fromSeq?: number }) => void;
	disconnect: () => void;
	clearEvents: () => void;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function formatTimestamp(epochMs: number) {
	return new Intl.DateTimeFormat("en-US", {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		fractionalSecondDigits: 3,
	}).format(epochMs);
}

function buildStreamPath(runId: string, fromSeq?: number) {
	const basePath = `/api/agents/runs/${encodeURIComponent(runId)}/stream`;
	if (typeof fromSeq === "number") {
		return `${basePath}?fromSeq=${fromSeq}`;
	}
	return basePath;
}

function readStoredApkPath(runId: string) {
	if (typeof window === "undefined") {
		return null;
	}
	return window.localStorage.getItem(`run_${runId}_apkPath`);
}

const EVENT_COLORS: Record<StreamEvent["type"], string> = {
	RunStarted: "text-emerald-600 dark:text-emerald-400",
	NodeStarted: "text-sky-600 dark:text-sky-400",
	DebugTrace: "text-slate-600 dark:text-slate-300",
	NodeFinished: "text-purple-600 dark:text-purple-400",
	RunFinished: "text-rose-600 dark:text-rose-400",
};

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

function useRunStream(runId: string): UseRunStreamResult {
	const [events, setEvents] = useState<StreamEvent[]>([]);
	const [status, setStatus] = useState<StreamStatus>("idle");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [apkPath, setApkPath] = useState<string | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		setApkPath(readStoredApkPath(runId));
	}, [runId]);

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

	const handleEventMessage = useCallback((event: MessageEvent<string>) => {
		try {
			const payload = JSON.parse(event.data) as StreamEvent;
			setEvents((prev) => {
				if (prev.some((existing) => existing.seq === payload.seq)) {
					return prev;
				}
				return [...prev, payload].sort((a, b) => a.seq - b.seq);
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

			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}

			setStatus("connecting");
			setErrorMessage(null);

			const eventSource = new EventSource(
				buildStreamPath(runId, options?.fromSeq),
			);
			eventSourceRef.current = eventSource;

			eventSource.onopen = () => {
				setStatus("streaming");
			};

			eventSource.onmessage = (message) => {
				handleEventMessage(message);
			};

			eventSource.onerror = () => {
				setErrorMessage("Connection lost. Please reconnect.");
				setStatus("error");
				eventSource.close();
				eventSourceRef.current = null;
			};
		},
		[handleEventMessage, runId],
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
		apkPath,
		stats,
		startRun,
		connect,
		disconnect,
		clearEvents,
	};
}

// -----------------------------------------------------------------------------
// Components
// -----------------------------------------------------------------------------

function RunOverviewCard({
	runId,
	apkPath,
	status,
	errorMessage,
	onStart,
	onConnect,
	onDisconnect,
	canDisconnect,
	canConnect,
}: {
	runId: string;
	apkPath: string | null;
	status: StreamStatus;
	errorMessage: string | null;
	onStart: () => void;
	onConnect: () => void;
	onDisconnect: () => void;
	canDisconnect: boolean;
	canConnect: boolean;
}) {
	return (
		<Card className="space-y-6 p-6">
			<div className="space-y-2">
				<div className="flex flex-wrap items-center gap-3">
					<h2 className="font-semibold text-xl">Run Overview</h2>
					<Badge variant="outline" className="font-mono text-xs">
						{runId}
					</Badge>
				</div>
				<p className="text-muted-foreground text-sm">
					Monitor real-time agent events as they stream from the
					backend.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<Card className="border-dashed bg-muted/30 p-4">
					<span className="text-muted-foreground text-xs uppercase tracking-wide">
						APK Path
					</span>
					<p className="mt-1 font-mono text-sm">
						{apkPath ?? "Not provided"}
					</p>
				</Card>
				<Card className="border-dashed bg-muted/30 p-4">
					<span className="text-muted-foreground text-xs uppercase tracking-wide">
						Status
					</span>
					<p className="mt-1 text-sm">
						{status === "idle" && "Ready"}
						{status === "connecting" && "Connecting"}
						{status === "streaming" && "Streaming"}
						{status === "error" && "Error"}
					</p>
				</Card>
			</div>

			<div className="flex flex-wrap gap-3">
				<Button onClick={onStart} disabled={status === "streaming"}>
					Start run & connect
				</Button>
				<Button
					variant="secondary"
					onClick={onConnect}
					disabled={!canConnect}
				>
					Connect only
				</Button>
				<Button
					variant="outline"
					onClick={onDisconnect}
					disabled={!canDisconnect}
				>
					Disconnect
				</Button>
			</div>

			{errorMessage && (
				<Card className="border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
					<p className="font-medium">Connection issue</p>
					<p className="text-sm">{errorMessage}</p>
				</Card>
			)}
		</Card>
	);
}

function RunEventCard({ event }: { event: StreamEvent }) {
	return (
		<Card className="border-muted/60 bg-muted/40 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<span className={cn("font-semibold", EVENT_COLORS[event.type])}>
					{event.type}
				</span>
				<span className="font-mono text-xs text-muted-foreground">
					#{event.seq}
				</span>
			</div>

			<dl className="mt-3 grid gap-2 text-xs md:grid-cols-2">
				<div>
					<dt className="text-muted-foreground">Timestamp</dt>
					<dd className="font-mono text-sm">
						{formatTimestamp(event.ts)}
					</dd>
				</div>
				<div>
					<dt className="text-muted-foreground">Source</dt>
					<dd className="font-mono text-sm">{event.source}</dd>
				</div>
				{event.name && (
					<div>
						<dt className="text-muted-foreground">Node</dt>
						<dd className="font-mono text-sm">{event.name}</dd>
					</div>
				)}
				{event.fn && (
					<div>
						<dt className="text-muted-foreground">Function</dt>
						<dd className="font-mono text-sm">{event.fn}</dd>
					</div>
				)}
			</dl>
		</Card>
	);
}

function RunEventsPanel({
	events,
	stats,
}: {
	events: StreamEvent[];
	stats: RunStreamStats;
}) {
	return (
		<Card className="p-6">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-xl">Event Stream</h2>
				<div className="flex gap-4 text-xs text-muted-foreground">
					<span>Events: {stats.totalEvents}</span>
					{stats.latestSeq !== null && (
						<span>Last seq: #{stats.latestSeq}</span>
					)}
					{stats.startTime && (
						<span>Started: {formatTimestamp(stats.startTime)}</span>
					)}
				</div>
			</div>

			{events.length === 0 ? (
				<p className="mt-8 text-center text-muted-foreground">
					No events yet. Start the run to view real-time updates.
				</p>
			) : (
				<Tabs defaultValue="timeline" className="mt-6">
					<TabsList>
						<TabsTrigger value="timeline">Timeline</TabsTrigger>
						<TabsTrigger value="raw">Raw JSON</TabsTrigger>
					</TabsList>

					<TabsContent value="timeline" className="space-y-4 pt-4">
						{events.map((event) => (
							<RunEventCard key={event.seq} event={event} />
						))}
					</TabsContent>

					<TabsContent value="raw" className="pt-4">
						<pre className="max-h-[420px] overflow-auto rounded-lg bg-muted/40 p-4 text-[11px] leading-relaxed">
							{JSON.stringify(events, null, 2)}
						</pre>
					</TabsContent>
				</Tabs>
			)}
		</Card>
	);
}

// -----------------------------------------------------------------------------
// Entry Component
// -----------------------------------------------------------------------------

export function RunStreamViewer({ runId }: RunStreamViewerProps) {
	const {
		events,
		status,
		errorMessage,
		apkPath,
		stats,
		startRun,
		connect,
		disconnect,
		clearEvents,
	} = useRunStream(runId);

	const handleConnect = useCallback(() => {
		clearEvents();
		connect();
	}, [clearEvents, connect]);

	return (
		<div className="space-y-8">
			<RunOverviewCard
				runId={runId}
				apkPath={apkPath}
				status={status}
				errorMessage={errorMessage}
				onStart={() => {
					void startRun();
				}}
				onConnect={handleConnect}
				onDisconnect={disconnect}
				canDisconnect={status === "streaming" || status === "error"}
				canConnect={status !== "streaming"}
			/>

			<RunEventsPanel events={events} stats={stats} />
		</div>
	);
}
