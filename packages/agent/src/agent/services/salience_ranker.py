"""
SalienceRanker: Element Importance Ranking

PURPOSE:
--------
Rank UI elements by importance (visibility, interactivity, semantic weight).
Used by PerceiveNode to select top-K elements for LLM context.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (UIElement)
- typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports or adapters
- NO machine learning models (initially)

METHODS:
--------
- rank_elements(elements) -> List[UIElement]
- compute_salience_score(element) -> float

RANKING FACTORS:
----------------
- Visibility: Element is visible and on-screen
- Interactivity: Clickable, focusable, scrollable
- Size: Larger elements are more salient
- Position: Center-weighted, top-weighted
- Text presence: Elements with text are more salient
- Semantic role: Buttons > text > images

TODO:
-----
- [ ] Implement salience scoring
- [ ] Add semantic weighting (role-based)
- [ ] Add ML-based ranking (later)
"""


class SalienceRanker:
    """
    Stateless service for element ranking.
    
    USAGE:
    ------
    ranker = SalienceRanker(top_k=50)
    ranked = ranker.rank_elements(elements)
    """
    
    def __init__(self, top_k: int = 50):
        self.top_k = top_k
    
    def rank_elements(self, elements: list) -> list:
        """
        Rank elements by salience and return top-K.
        
        TODO: Implement scoring and sorting
        """
        pass
    
    def compute_salience_score(self, element: "UIElement") -> float:
        """
        Compute salience score [0.0, 1.0].
        
        TODO: Combine visibility, interactivity, size, position
        """
        pass

