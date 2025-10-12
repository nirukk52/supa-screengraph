"""
BudgetPort: Resource Tracking Interface

PURPOSE:
--------
Track resource usage (steps, time, tokens, $) and enforce caps.
Enables ShouldContinueNode to make informed routing decisions.

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)
- domain types (Budgets, Counters)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO external services
- NO persistence (ephemeral, in-memory only)

METHODS:
--------
- track_step(run_id: str)
- track_tokens(run_id: str, tokens: int, cost: float)
- track_error(run_id: str)
- get_usage(run_id: str) -> Usage
- is_budget_exceeded(run_id: str, budgets: Budgets) -> bool

ENFORCEMENT:
------------
- BudgetPort tracks usage
- Orchestrator enforces caps (can stop loop)
- ShouldContinueNode considers usage in routing

TODO:
-----
- [ ] Add cost estimation per provider
- [ ] Add dynamic budget adjustment
- [ ] Add budget sharing across runs
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
from dataclasses import dataclass


@dataclass
class Usage:
    """Resource usage for a run."""
    steps: int = 0
    tokens: int = 0
    cost_usd: float = 0.0
    elapsed_ms: int = 0
    errors: int = 0


class BudgetPort(ABC):
    """
    Interface for resource tracking.
    Implemented by adapters/budget.
    """
    
    @abstractmethod
    async def track_step(self, run_id: str) -> None:
        """
        Increment step counter.
        
        Args:
            run_id: Run identifier.
        """
        pass
    
    @abstractmethod
    async def track_tokens(
        self,
        run_id: str,
        tokens: int,
        cost_usd: float,
    ) -> None:
        """
        Track token usage and cost.
        
        Args:
            run_id: Run identifier.
            tokens: Token count.
            cost_usd: Estimated cost in USD.
        """
        pass
    
    @abstractmethod
    async def track_error(self, run_id: str) -> None:
        """
        Increment error counter.
        
        Args:
            run_id: Run identifier.
        """
        pass
    
    @abstractmethod
    async def get_usage(self, run_id: str) -> Usage:
        """
        Get current usage for a run.
        
        Args:
            run_id: Run identifier.
        
        Returns:
            Usage summary.
        """
        pass
    
    @abstractmethod
    async def is_budget_exceeded(
        self,
        run_id: str,
        budgets: "Budgets",
    ) -> bool:
        """
        Check if any budget limit is exceeded.
        
        Args:
            run_id: Run identifier.
            budgets: Budget limits.
        
        Returns:
            True if any limit exceeded.
        """
        pass
    
    @abstractmethod
    async def reset(self, run_id: str) -> None:
        """
        Reset usage counters for a run.
        
        Args:
            run_id: Run identifier.
        """
        pass

