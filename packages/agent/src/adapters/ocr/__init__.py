"""
OCR Adapter: Text Extraction Implementation

PURPOSE:
--------
Implement OCRPort using an OCR engine (Tesseract, Google Vision, etc.).

DEPENDENCIES (ALLOWED):
-----------------------
- ports.ocr_port (OCRPort interface)
- domain types (OCRResult, TextRegion)
- OCR SDK (pytesseract, google-cloud-vision, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO other adapters

IMPLEMENTATION:
---------------
- OCRAdapter: Main adapter class
- text_normalizer: Normalize extracted text (lowercase, trim, stems)
- region_parser: Parse bounding boxes

OCR ENGINE OPTIONS:
-------------------
- Tesseract: Local, free, fast, lower accuracy
- Google Vision: Cloud, paid, slower, higher accuracy
- EasyOCR: Local, free, moderate speed/accuracy

TODO:
-----
- [ ] Implement OCRAdapter class
- [ ] Add text extraction (image → OCRResult)
- [ ] Add region extraction (image → List[TextRegion])
- [ ] Add text normalization
- [ ] Add caching (by image hash)
"""

