import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import { Card } from "@ui/components/card";
import type { StreamStatus } from "../hooks/useRunStream";

interface RunOverviewCardProps {
	runId: string;
	apkPath: string | null;
	status: StreamStatus;
	errorMessage: string | null;
	onStart: () => void;
	onConnect: () => void;
	onDisconnect: () => void;
	canConnect: boolean;
	canDisconnect: boolean;
}

export function RunOverviewCard({
	runId,
	apkPath,
	status,
	errorMessage,
	onStart,
	onConnect,
	onDisconnect,
	canConnect,
	canDisconnect,
}: RunOverviewCardProps) {
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
