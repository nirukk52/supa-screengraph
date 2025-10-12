"""
OCRPort: Text Extraction Interface

PURPOSE:
--------
Extract text from screenshots using OCR engines.
Enables PerceiveNode to augment UI hierarchy with visible text.

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO OCR SDK imports (Tesseract, Google Vision, etc.)
- NO image processing libraries (PIL, OpenCV)
- NO adapters

METHODS:
--------
- extract_text(image_bytes: bytes) -> OCRResult
- extract_text_regions(image_bytes: bytes) -> List[TextRegion]

DATA STRUCTURES:
----------------
- OCRResult: Full OCR output with confidence
- TextRegion: Bounding box + text + confidence

PERFORMANCE:
------------
- OCR is expensive; cache results by image hash
- Consider lightweight alternatives (screen-to-text models)
- Use bounding boxes to correlate with UI elements

TODO:
-----
- [ ] Add language detection/specification
- [ ] Add confidence thresholds
- [ ] Add text region clustering
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from dataclasses import dataclass


@dataclass
class TextRegion:
    """A single text region detected by OCR."""
    text: str
    confidence: float  # [0.0, 1.0]
    bounds: tuple[float, float, float, float]  # (x, y, w, h) normalized


@dataclass
class OCRResult:
    """Full OCR extraction result."""
    full_text: str
    regions: List[TextRegion]
    confidence: float  # average confidence
    language: Optional[str] = None


class OCRPort(ABC):
    """
    Interface for text extraction from images.
    Implemented by adapters/ocr.
    """
    
    @abstractmethod
    async def extract_text(self, image_bytes: bytes) -> OCRResult:
        """
        Extract all text from an image.
        
        Args:
            image_bytes: PNG/JPEG image bytes.
        
        Returns:
            OCRResult with full text and regions.
        
        Raises:
            OCRError: If extraction failed.
        """
        pass
    
    @abstractmethod
    async def extract_text_regions(self, image_bytes: bytes) -> List[TextRegion]:
        """
        Extract text with bounding boxes.
        
        Args:
            image_bytes: PNG/JPEG image bytes.
        
        Returns:
            List of text regions with coordinates.
        
        Raises:
            OCRError: If extraction failed.
        """
        pass

