"""
TelemetryPort: Observability Interface

PURPOSE:
--------
Bridge to app-wide logging module for structured logs, metrics, and traces.
Enables every node to emit telemetry without coupling to specific libraries.

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO logging libraries (Pino, Winston, etc.)
- NO metrics libraries (Prometheus, StatsD)
- NO tracing libraries (OpenTelemetry, Jaeger)

METHODS:
--------
- log(level, message, context)
- metric(name, value, tags)
- trace_start(span_name, context) -> span_id
- trace_end(span_id, status, context)

LOG LEVELS:
-----------
- DEBUG: Verbose debugging
- INFO: Normal operations
- WARN: Recoverable errors
- ERROR: Unrecoverable errors
- FATAL: System failure

CONTEXT FIELDS:
---------------
- run_id, app_id, screen_signature
- node_type, action_verb
- latency_ms, tokens, cost_usd
- error_type, error_message

METRICS:
--------
- Counter: steps_total, screens_new, errors
- Gauge: cache_hit_rate, budget_remaining_pct
- Histogram: llm_latency_ms, action_duration_ms

TRACES:
-------
- Span per node execution
- Span per LLM call
- Span per persistence operation

TODO:
-----
- [ ] Add log sampling (reduce volume)
- [ ] Add metric aggregation
- [ ] Add distributed tracing
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from enum import Enum


class LogLevel(str, Enum):
    """Log severity levels."""
    DEBUG = "debug"
    INFO = "info"
    WARN = "warn"
    ERROR = "error"
    FATAL = "fatal"


class TelemetryPort(ABC):
    """
    Interface for structured logging, metrics, and traces.
    Implemented by adapters/telemetry.
    """
    
    @abstractmethod
    def log(
        self,
        level: LogLevel,
        message: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        Emit a structured log entry.
        
        Args:
            level: Log severity.
            message: Human-readable message.
            context: Additional fields (run_id, node_type, etc.).
        """
        pass
    
    @abstractmethod
    def metric(
        self,
        name: str,
        value: float,
        tags: Optional[Dict[str, str]] = None,
    ) -> None:
        """
        Emit a metric data point.
        
        Args:
            name: Metric name (e.g., steps_total, llm_latency_ms).
            value: Metric value.
            tags: Dimension tags (run_id, node_type, etc.).
        """
        pass
    
    @abstractmethod
    def trace_start(
        self,
        span_name: str,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """
        Start a trace span.
        
        Args:
            span_name: Span identifier (e.g., ChooseActionNode).
            context: Span attributes.
        
        Returns:
            Span ID for correlation.
        """
        pass
    
    @abstractmethod
    def trace_end(
        self,
        span_id: str,
        status: str = "ok",
        context: Optional[Dict[str, Any]] = None,
    ) -> None:
        """
        End a trace span.
        
        Args:
            span_id: Span ID from trace_start.
            status: Span status (ok, error).
            context: Final span attributes (latency, tokens, etc.).
        """
        pass

