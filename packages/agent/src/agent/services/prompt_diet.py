"""
PromptDiet: State Pruning for LLM Inputs

PURPOSE:
--------
Reduce AgentState to minimal context for LLM prompts.
Focus on delta-first, top-K elements, last N events.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState)
- typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports or adapters
- NO LLM SDKs

METHODS:
--------
- diet_for_choose_action(state) -> dict
- diet_for_verify(state) -> dict
- diet_for_detect_progress(state) -> dict
- diet_for_should_continue(state) -> dict
- diet_for_switch_policy(state) -> dict

PRUNING STRATEGIES:
-------------------
- Delta-first: Only changes since previous screen
- Top-K: Only most salient elements (not entire hierarchy)
- Last N: Only recent events (last 3 actions)
- Refs only: Asset references, not blobs
- Stems only: OCR stems, not full text

TODO:
-----
- [ ] Implement delta extraction
- [ ] Implement top-K filtering
- [ ] Implement event windowing
- [ ] Add token estimation
"""


class PromptDiet:
    """
    Stateless service for prompt pruning.
    
    USAGE:
    ------
    diet = PromptDiet()
    pruned = diet.diet_for_choose_action(state)
    """
    
    def diet_for_choose_action(self, state: "AgentState") -> dict:
        """
        Prune state for ChooseAction LLM call.
        
        Includes:
        - signature delta (prev → curr)
        - top-K enumerated actions
        - current plan and cursor
        - budgets remaining
        
        TODO: Implement pruning
        """
        pass
    
    def diet_for_verify(self, state: "AgentState") -> dict:
        """
        Prune state for Verify LLM call.
        
        Includes:
        - signature delta only
        - expected postcondition
        - verification anchors (key elements)
        
        TODO: Implement pruning
        """
        pass
    
    def diet_for_detect_progress(self, state: "AgentState") -> dict:
        """
        Prune state for DetectProgress LLM call.
        
        TODO: Implement pruning
        """
        pass
    
    def diet_for_should_continue(self, state: "AgentState") -> dict:
        """
        Prune state for ShouldContinue LLM call.
        
        TODO: Implement pruning
        """
        pass
    
    def diet_for_switch_policy(self, state: "AgentState") -> dict:
        """
        Prune state for SwitchPolicy LLM call.
        
        TODO: Implement pruning
        """
        pass

