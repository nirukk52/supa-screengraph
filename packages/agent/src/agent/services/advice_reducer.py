"""
AdviceReducer: Advice Normalization and Deduplication

PURPOSE:
--------
Normalize and deduplicate advice from multiple sources (LLM, cache, engine hints).
Merge conflicting advice and select best candidates.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (Advice, ChosenAction)
- typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports or adapters

METHODS:
--------
- merge_advice(advice_list) -> Advice
- deduplicate_actions(actions) -> List[ActionCandidate]
- normalize_rationale(text) -> str

STRATEGIES:
-----------
- Prefer higher confidence advice
- Merge compatible plans
- Deduplicate similar actions (Jaccard similarity)
- Normalize rationale text (lowercase, trim)

TODO:
-----
- [ ] Implement advice merging
- [ ] Implement action deduplication
- [ ] Add conflict resolution logic
"""


class AdviceReducer:
    """
    Stateless service for advice normalization.
    
    USAGE:
    ------
    reducer = AdviceReducer()
    merged = reducer.merge_advice([advice1, advice2])
    """
    
    def merge_advice(self, advice_list: list) -> "Advice":
        """
        Merge multiple advice sources into one.
        
        TODO: Implement merging logic
        """
        pass
    
    def deduplicate_actions(self, actions: list) -> list:
        """
        Deduplicate similar actions.
        
        TODO: Implement similarity check and deduplication
        """
        pass
    
    def normalize_rationale(self, text: str) -> str:
        """
        Normalize rationale text.
        
        TODO: Implement normalization (lowercase, trim, etc.)
        """
        pass

