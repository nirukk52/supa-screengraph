"""
BaseNode: Abstract Base Class for All Orchestrator Nodes

PURPOSE:
--------
Provide common interface and utilities for all nodes in the orchestrator graph.
Every node inherits from BaseNode and implements run().

DEPENDENCIES (ALLOWED):
-----------------------
- abc (stdlib)
- domain types (AgentState)
- ports (injected via constructor)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters or SDKs
- NO I/O operations (use injected ports)

CONTRACT:
---------
Every node must implement:
    def run(self, state: AgentState) -> AgentState

INVARIANTS:
-----------
- Nodes are stateless (no instance state between calls)
- Nodes return NEW AgentState (immutable)
- Nodes never raise exceptions (use stop_reason instead)
- Nodes log via TelemetryPort

TODO:
-----
- [ ] Add timing decorator
- [ ] Add error handling wrapper
- [ ] Add state validation
"""

from abc import ABC, abstractmethod
# from ...domain.state import AgentState
# from ...ports.telemetry_port import TelemetryPort, LogLevel


class BaseNode(ABC):
    """
    Abstract base for all orchestrator nodes.
    
    USAGE:
    ------
    class EnsureDeviceNode(BaseNode):
        def __init__(self, driver: DriverPort, telemetry: TelemetryPort):
            super().__init__(telemetry)
            self.driver = driver
        
        def run(self, state: AgentState) -> AgentState:
            # Implementation
            return new_state
    """
    
    def __init__(self, telemetry: "TelemetryPort"):
        """
        Initialize base node with telemetry.
        
        Args:
            telemetry: TelemetryPort for logging.
        """
        self.telemetry = telemetry
        self.node_name = self.__class__.__name__
    
    @abstractmethod
    def run(self, state: "AgentState") -> "AgentState":
        """
        Execute node logic and return updated state.
        
        Args:
            state: Current agent state.
        
        Returns:
            New agent state with updates.
        
        Raises:
            Never raises; sets stop_reason on unrecoverable errors.
        """
        pass
    
    def _log(self, level: "LogLevel", message: str, **context) -> None:
        """
        Convenience method for logging with node context.
        
        TODO: Implement with node_name injection
        """
        self.telemetry.log(
            level=level,
            message=f"[{self.node_name}] {message}",
            context=context,
        )
    
    def _trace_start(self, state: "AgentState") -> str:
        """
        Start trace span for this node.
        
        TODO: Implement with state context
        """
        return self.telemetry.trace_start(
            span_name=self.node_name,
            context={
                "run_id": state.run_id,
                "app_id": state.app_id,
                "signature": state.signature.hash,
            },
        )
    
    def _trace_end(self, span_id: str, status: str = "ok", **context) -> None:
        """
        End trace span for this node.
        
        TODO: Implement with final context
        """
        self.telemetry.trace_end(span_id=span_id, status=status, context=context)

