"""
Bundles: Asset References (No Blobs Inline)

PURPOSE:
--------
Store REFERENCES to heavy assets (screenshots, page source, OCR output)
instead of embedding them directly in AgentState.

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses, typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO binary data or large strings inline
- NO file I/O (that's in adapters)
- NO base64 encoding

RATIONALE:
----------
- AgentState must remain lightweight and serializable
- Large blobs bloat state and memory
- FileStorePort handles storage/retrieval
- Refs are stable (content-addressed or UUID-based)

FIELDS:
-------
- screenshot_ref: FileStore key for PNG/JPEG
- page_source_ref: FileStore key for XML/JSON
- ocr_ref: FileStore key for OCR text output
- video_ref: (future) key for screen recording

TODO:
-----
- [ ] Add validation (refs must be valid keys)
- [ ] Add retrieval helpers (fetch_screenshot, fetch_page_source)
- [ ] Add compression hints (gzip, brotli)
"""

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class Bundle:
    """
    References to heavy assets stored externally via FileStorePort.
    
    USAGE:
    ------
    # After capture (in PerceiveNode)
    bundle = Bundle(
        screenshot_ref="runs/run-123/screenshots/screen-456.png",
        page_source_ref="runs/run-123/page-sources/screen-456.xml",
        ocr_ref="runs/run-123/ocr/screen-456.json"
    )
    
    # Later retrieval (via FileStorePort)
    screenshot_bytes = filestore.get(bundle.screenshot_ref)
    page_source_xml = filestore.get(bundle.page_source_ref)
    """
    screenshot_ref: Optional[str] = None
    page_source_ref: Optional[str] = None
    ocr_ref: Optional[str] = None
    video_ref: Optional[str] = None  # future: screen recording
    
    def has_screenshot(self) -> bool:
        """Check if screenshot reference exists."""
        return self.screenshot_ref is not None
    
    def has_page_source(self) -> bool:
        """Check if page source reference exists."""
        return self.page_source_ref is not None
    
    def has_ocr(self) -> bool:
        """Check if OCR reference exists."""
        return self.ocr_ref is not None

