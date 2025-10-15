/**
 * Trace utilities for logging
 */

import { logger } from "./logger";

export const LOG_LEVELS = {
	INFO: "INFO",
	DEBUG: "DEBUG",
	WARN: "WARN",
	ERROR: "ERROR",
} as const;

export const TRACE_PHASE = {
	START: "START",
	END: "END",
} as const;

export type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];
export type TracePhase = (typeof TRACE_PHASE)[keyof typeof TRACE_PHASE];

export interface TraceEvent {
	phase: TracePhase;
	level: LogLevel;
	message: string;
	timestamp: number;
	metadata?: Record<string, any>;
}

export function write(event: TraceEvent): void {
	const { phase, level, message, metadata } = event;

	const logMessage = `${phase} [${level}] ${message}`;

	switch (level) {
		case LOG_LEVELS.INFO:
			logger.info(logMessage, metadata);
			break;
		case LOG_LEVELS.DEBUG:
			logger.debug(logMessage, metadata);
			break;
		case LOG_LEVELS.WARN:
			logger.warn(logMessage, metadata);
			break;
		case LOG_LEVELS.ERROR:
			logger.error(logMessage, metadata);
			break;
		default:
			logger.info(logMessage, metadata);
	}
}

export function traceStart(
	message: string,
	metadata?: Record<string, any>,
): void {
	write({
		phase: TRACE_PHASE.START,
		level: LOG_LEVELS.INFO,
		message,
		timestamp: Date.now(),
		metadata,
	});
}

export function traceEnd(
	message: string,
	metadata?: Record<string, any>,
): void {
	write({
		phase: TRACE_PHASE.END,
		level: LOG_LEVELS.INFO,
		message,
		timestamp: Date.now(),
		metadata,
	});
}
