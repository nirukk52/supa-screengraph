"""
LLMPort: AI Decision-Making Interface

PURPOSE:
--------
Single entry point for ALL LLM calls in the agent.
Routes requests to node-specific handlers for the 5 LLM decision nodes:
- ChooseAction
- Verify
- DetectProgress
- ShouldContinue
- SwitchPolicy

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)
- domain types (AgentState, ChosenAction, VerificationResult, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO LLM provider SDKs (OpenAI, Anthropic, etc.)
- NO prompt templates (those live in adapters)
- NO token counting logic (that's in adapters)

METHODS:
--------
- choose_action(state) -> ChosenAction
- verify_action(state) -> VerificationResult
- detect_progress(state) -> ProgressAssessment
- should_continue(state) -> RoutingDecision
- switch_policy(state) -> PolicySwitch

INPUT SHAPING:
--------------
- PromptDiet service prunes state to minimal context
- Delta-first: only changes since last screen
- Top-K elements only (not entire hierarchy)
- Asset refs, not blobs

OUTPUT VALIDATION:
------------------
- Structured outputs (JSON schemas)
- Guardrails reject unsafe/invalid outputs
- Fallback to heuristics on validation failure
- Confidence thresholds

CACHING:
--------
- Cache key: (node_type, model, signature, delta_hash, topK_hash, policy_capsule)
- TTL: 7 days
- Versioning: model version in key

BUDGETING:
----------
- BudgetPort enforces token caps
- Orchestrator can override LLM to Stop if caps exceeded

TODO:
-----
- [ ] Add streaming support
- [ ] Add model routing (fast vs. slow)
- [ ] Add prompt versioning
"""

from abc import ABC, abstractmethod
from typing import Optional
# from ..domain.state import AgentState
# from ..domain.advice import (
#     ChosenAction,
#     VerificationResult,
#     ProgressAssessment,
#     RoutingDecision,
#     PolicySwitch,
# )


class LLMPort(ABC):
    """
    Interface for LLM decision-making.
    Implemented by adapters/llm.
    
    This is the ONLY port that calls LLM providers.
    All 5 LLM nodes use this port.
    """
    
    @abstractmethod
    async def choose_action(self, state: "AgentState") -> "ChosenAction":
        """
        LLM Decision Node 1: ChooseAction
        
        Select the next action from enumerated candidates.
        
        Inputs (from state):
        - signature (current screen)
        - previous_signature (for delta)
        - enumerated_actions (top-K candidates)
        - advice.plan (current plan)
        - counters, budgets
        
        Outputs:
        - action_index (which action to take)
        - rationale (short explanation)
        - rationale_ref (FileStore key to full reasoning)
        - confidence [0.0, 1.0]
        - expected_postcondition
        
        Caching:
        - Key: (choose_action, model, signature, delta_hash, topK_hash, plan_cursor)
        - TTL: 7 days
        
        Guardrails:
        - action_index must be in range [0, len(enumerated_actions))
        - confidence must be in [0.0, 1.0]
        - Reject destructive actions without confirmation
        
        Fallback:
        - If validation fails, return heuristic action (safe exploration)
        
        TODO:
        - [ ] Implement full prompt template
        - [ ] Add guardrails
        - [ ] Add cache lookup
        """
        pass
    
    @abstractmethod
    async def verify_action(self, state: "AgentState") -> "VerificationResult":
        """
        LLM Decision Node 2: Verify
        
        Arbitrate whether expected change occurred after action.
        
        Inputs (from state):
        - previous_signature (before action)
        - signature (after action)
        - advice.expected_postcondition
        - counters.errors
        
        Outputs:
        - success (bool)
        - delta_type (NEW_SCREEN, OVERLAY, NO_CHANGE, etc.)
        - observed_change (short description)
        - rationale_ref (FileStore key)
        - confidence [0.0, 1.0]
        
        Caching:
        - Key: (verify, model, prev_sig, curr_sig, expected_postcondition)
        - TTL: 7 days
        
        Guardrails:
        - delta_type must be valid enum
        - confidence must be in [0.0, 1.0]
        
        TODO:
        - [ ] Implement delta classification
        - [ ] Add visual diff analysis
        """
        pass
    
    @abstractmethod
    async def detect_progress(self, state: "AgentState") -> "ProgressAssessment":
        """
        LLM Decision Node 3: DetectProgress
        
        Label whether the agent is making progress toward goals.
        
        Inputs (from state):
        - signature, previous_signature
        - persist_result (nodes/edges added)
        - counters (no_progress_cycles, screens_new)
        - advice.plan (expected progress)
        
        Outputs:
        - flag (MADE_PROGRESS, NO_PROGRESS, REGRESSED)
        - reasoning (short explanation)
        - rationale_ref (FileStore key)
        - confidence [0.0, 1.0]
        
        Caching:
        - Key: (detect_progress, model, signature, delta_hash, counters_hash)
        - TTL: 7 days
        
        TODO:
        - [ ] Integrate with goal specification
        - [ ] Add semantic similarity scoring
        """
        pass
    
    @abstractmethod
    async def should_continue(self, state: "AgentState") -> "RoutingDecision":
        """
        LLM Decision Node 4: ShouldContinue
        
        Propose next route in the orchestrator graph.
        
        Inputs (from state):
        - counters (steps_total, no_progress_cycles, errors)
        - budgets (max_steps, max_time_ms)
        - progress_flag (from DetectProgress)
        - advice.plan (plan progress)
        
        Outputs:
        - next_route (CONTINUE, SWITCH_POLICY, RESTART_APP, STOP)
        - reasoning (short explanation)
        - confidence [0.0, 1.0]
        
        Caching:
        - Key: (should_continue, model, counters_hash, budgets_hash, progress_flag)
        - TTL: 1 hour (shorter for routing decisions)
        
        Guardrails:
        - Orchestrator enforces budget caps (can override LLM to STOP)
        
        TODO:
        - [ ] Add escalation logic
        - [ ] Add goal completion detection
        """
        pass
    
    @abstractmethod
    async def switch_policy(self, state: "AgentState") -> "PolicySwitch":
        """
        LLM Decision Node 5: SwitchPolicy
        
        Deterministically change exploration policy.
        
        Inputs (from state):
        - counters (no_progress_cycles, screens_new)
        - advice.plan (current policy)
        - persist_result (coverage stats)
        
        Outputs:
        - new_policy (breadth, depth, random, targeted)
        - reasoning (short explanation)
        - cooldown_steps (avoid thrashing)
        - confidence [0.0, 1.0]
        
        Caching:
        - Key: (switch_policy, model, counters_hash, current_policy)
        - TTL: 1 hour
        
        Guardrails:
        - cooldown_steps must be >= 0
        - new_policy must be valid enum
        
        TODO:
        - [ ] Add policy recommendation logic
        - [ ] Add policy effectiveness tracking
        """
        pass

