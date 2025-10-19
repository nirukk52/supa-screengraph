import { Card } from "@ui/components/card";
import { cn } from "@ui/lib";
import type { StreamEvent } from "../hooks/useRunStream";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "../lib/events";
import { formatTimestamp } from "../lib/time";

interface RunEventCardProps {
	event: StreamEvent;
}

export function RunEventCard({ event }: RunEventCardProps) {
	return (
		<Card className="border-muted/60 bg-muted/40 p-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<span
					className={cn(
						"font-semibold",
						EVENT_TYPE_COLORS[event.type],
					)}
				>
					{EVENT_TYPE_LABELS[event.type]}
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
