"""
ProgressDetector: Heuristic Progress Signals

PURPOSE:
--------
Compute heuristic progress signals to assist LLM DetectProgressNode.
Combines signature comparison, repo deltas, and counters.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState, ScreenSignature)
- typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports or adapters

METHODS:
--------
- detect_heuristic_signals(state) -> dict
- is_signature_new(signature, seen_signatures) -> bool
- compute_coverage_pct(nodes_total, expected_total) -> float

SIGNALS:
--------
- New signature: Current signature not seen before
- Repo delta: New nodes/edges added
- Consecutive no-progress: no_progress_cycles threshold
- Outside app: Too many steps outside target app
- Error rate: Errors per step

TODO:
-----
- [ ] Implement heuristic signal computation
- [ ] Add signature deduplication check
- [ ] Add coverage estimation
"""


class ProgressDetector:
    """
    Stateless service for heuristic progress signals.
    
    USAGE:
    ------
    detector = ProgressDetector()
    signals = detector.detect_heuristic_signals(state)
    """
    
    def detect_heuristic_signals(self, state: "AgentState") -> dict:
        """
        Compute heuristic progress signals.
        
        Returns:
            Dict with keys:
            - is_signature_new: bool
            - nodes_added: int
            - edges_added: int
            - no_progress_cycles: int
            - outside_app_steps: int
            - error_rate: float
        
        TODO: Implement signal computation
        """
        pass
    
    def is_signature_new(self, signature: "ScreenSignature", seen_signatures: set) -> bool:
        """
        Check if signature is new.
        
        TODO: Implement signature lookup
        """
        pass
    
    def compute_coverage_pct(self, nodes_total: int, expected_total: int) -> float:
        """
        Compute coverage percentage.
        
        TODO: Implement coverage calculation
        """
        pass

