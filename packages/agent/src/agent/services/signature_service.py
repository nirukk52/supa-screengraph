"""
SignatureService: Deterministic Screen Signature Computation

PURPOSE:
--------
Compute stable, reproducible signatures for screen states.
Enable deduplication, delta computation, and caching.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (ScreenSignature, UIElement)
- hashlib, json (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO ports or adapters
- NO I/O operations

METHODS:
--------
- compute_signature(elements, ocr_text) -> ScreenSignature
- compute_delta(sig1, sig2) -> float
- normalize_elements(elements) -> List[UIElement]

ALGORITHM:
----------
1. Normalize elements (quantize bounds, sort by hierarchy)
2. Hash layout (role + bounds)
3. Hash OCR stems (normalize text → stems → sort → hash)
4. Combine: SHA256(layout_hash + ocr_stems_hash)

TODO:
-----
- [ ] Implement hash_layout()
- [ ] Implement hash_ocr_stems()
- [ ] Implement compute_delta() (Hamming/Jaccard)
- [ ] Add perceptual hashing (pHash)
"""


class SignatureService:
    """
    Stateless service for signature computation.
    
    USAGE:
    ------
    service = SignatureService()
    signature = service.compute_signature(elements, ocr_text)
    delta = service.compute_delta(prev_sig, curr_sig)
    """
    
    def compute_signature(self, elements: list, ocr_text: str) -> "ScreenSignature":
        """
        Compute deterministic signature.
        
        TODO: Implement full algorithm
        """
        pass
    
    def compute_delta(self, sig1: "ScreenSignature", sig2: "ScreenSignature") -> float:
        """
        Compute similarity distance [0.0, 1.0].
        
        TODO: Implement Hamming or Jaccard distance
        """
        pass
    
    def normalize_elements(self, elements: list) -> list:
        """
        Normalize elements for stable hashing.
        
        TODO: Quantize bounds, sort, deduplicate
        """
        pass

