"use client";

import { useCallback, useEffect } from "react";
import { useApkPath } from "../hooks/useApkPath";
import { useRunStream } from "../hooks/useRunStream";
import { RunEventsPanel } from "./RunEventsPanel";
import { RunOverviewCard } from "./RunOverviewCard";

interface RunStreamViewerProps {
	runId: string;
}

export function RunStreamViewer({ runId }: RunStreamViewerProps) {
	const {
		events,
		status,
		errorMessage,
		stats,
		startRun,
		connect,
		disconnect,
		clearEvents,
	} = useRunStream(runId);
	const apkPath = useApkPath(runId);

	const handleConnect = useCallback(() => {
		clearEvents();
		connect();
	}, [clearEvents, connect]);

	// Auto-connect to stream on mount
	useEffect(() => {
		connect();
	}, [connect]);

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
