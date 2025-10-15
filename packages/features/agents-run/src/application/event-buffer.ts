/**
 * Event Buffer for Agents Run Feature
 * 
 * Provides a simple in-memory event buffer for testing and development.
 * In production, this could be replaced with a persistent store.
 */

import type { AgentEvent } from "@sg/agents-contracts";

export class EventBuffer {
	private events: AgentEvent[] = [];

	addEvent(event: AgentEvent): void {
		this.events.push(event);
	}

	getEvents(): AgentEvent[] {
		return [...this.events];
	}

	clear(): void {
		this.events = [];
	}

	getEventsForRun(runId: string): AgentEvent[] {
		return this.events.filter(event => event.runId === runId);
	}
}

export const eventBuffer = new EventBuffer();

// Export the methods that are expected by the use cases
export function recordEvent(event: AgentEvent): void {
	eventBuffer.addEvent(event);
}

export function getBufferedEvents(runId: string): AgentEvent[] {
	return eventBuffer.getEventsForRun(runId);
}
