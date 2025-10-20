import { Card } from "@ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/components/tabs";
import type { RunStreamStats, StreamEvent } from "../hooks/useRunStream";
import { formatTimestamp } from "../lib/time";
import { RunEventCard } from "./RunEventCard";

interface RunEventsPanelProps {
	events: StreamEvent[];
	stats: RunStreamStats;
}

export function RunEventsPanel({ events, stats }: RunEventsPanelProps) {
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
