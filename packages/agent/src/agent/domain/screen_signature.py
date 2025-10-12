"""
ScreenSignature: Deterministic Identity for UI States

PURPOSE:
--------
Compute a stable, reproducible hash for any screen state that enables:
- Deduplication of equivalent screens
- Delta computation between screen transitions
- Efficient caching of LLM advice per signature
- Graph node identity (signature = node ID)

DEPENDENCIES (ALLOWED):
-----------------------
- hashlib, json (stdlib)
- typing (stdlib)
- UIElement domain types (same package)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO SDKs or adapters
- NO I/O or network calls
- NO non-deterministic operations (random, time-based salts)

ALGORITHM:
----------
1. Layout Hash: Combine element roles, bounds (quantized), hierarchy
2. OCR Stems Hash: Normalize visible text → stems → sorted → hash
3. Composite Hash: SHA256(layout_hash + ocr_stems_hash)

INVARIANTS:
-----------
- Same UI state → same signature (deterministic)
- Small visual changes → small signature distance (Hamming distance)
- Ignores transient elements (timestamps, animations)
- Quantize floats to 2 decimals to avoid float noise

TODO:
-----
- [ ] Implement hash_layout(elements: List[UIElement]) -> str
- [ ] Implement hash_ocr_stems(ocr_text: str) -> str
- [ ] Implement compute_delta(sig1: ScreenSignature, sig2: ScreenSignature) -> float
- [ ] Add perceptual hashing for visual similarity (pHash)
- [ ] Add semantic hashing for text similarity (embeddings)
"""

from dataclasses import dataclass
from typing import List, Optional, Any
import hashlib
import json


@dataclass(frozen=True)
class ScreenSignature:
    """
    A deterministic signature for a screen state.
    
    FIELDS:
    -------
    - hash: Composite SHA256 of layout + OCR
    - layout_hash: Hash of UI element hierarchy and bounds
    - ocr_stems_hash: Hash of normalized visible text
    
    USAGE:
    ------
    sig = compute_signature(elements, ocr_text)
    delta = compute_delta(prev_sig, sig)
    """
    hash: str = "unset"
    layout_hash: str = "unset"
    ocr_stems_hash: str = "unset"
    
    def __eq__(self, other: object) -> bool:
        """Two signatures are equal if their composite hashes match."""
        if not isinstance(other, ScreenSignature):
            return False
        return self.hash == other.hash
    
    def __hash__(self) -> int:
        """Enable use as dict key or in sets."""
        return hash(self.hash)


def compute_signature(elements: List[Any], ocr_text: str) -> ScreenSignature:
    """
    Compute a deterministic signature from UI elements and OCR text.
    
    TODO: Implement full hashing logic
    - Quantize bounds to 2 decimals
    - Sort elements by z-order or hierarchy
    - Normalize OCR text (lowercase, stem, remove stopwords)
    - Combine hashes with SHA256
    """
    layout_hash = "layout_placeholder"
    ocr_stems_hash = "ocr_placeholder"
    composite_hash = hashlib.sha256(
        f"{layout_hash}{ocr_stems_hash}".encode()
    ).hexdigest()
    
    return ScreenSignature(
        hash=composite_hash,
        layout_hash=layout_hash,
        ocr_stems_hash=ocr_stems_hash,
    )


def compute_delta(sig1: ScreenSignature, sig2: ScreenSignature) -> float:
    """
    Compute similarity distance between two signatures.
    Returns [0.0, 1.0] where 0 = identical, 1 = completely different.
    
    TODO: Implement Hamming distance or Jaccard similarity
    """
    if sig1.hash == sig2.hash:
        return 0.0
    return 1.0  # Placeholder

