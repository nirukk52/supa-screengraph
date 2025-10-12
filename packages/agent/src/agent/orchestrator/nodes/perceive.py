"""
PerceiveNode: Screen Capture and Signature Computation

NODE TYPE: Non-LLM
PURPOSE: Capture current screen state and compute deterministic signature.

INPUTS (from AgentState):
-------------------------
- run_id, app_id (for asset keys)
- previous_signature (for delta computation)

PORTS USED:
-----------
- DriverPort: get_screenshot(), get_page_source()
- OCRPort: extract_text_regions()
- FileStorePort: put() (for screenshot/page source refs)
- TelemetryPort: log()

SERVICES USED:
--------------
- SignatureService: compute_signature(), compute_delta()
- SalienceRanker: rank_elements() (top-K)

OUTPUTS/EFFECTS:
----------------
- Updates signature, previous_signature
- Updates bundle (screenshot_ref, page_source_ref, ocr_ref)
- Stores assets via FileStorePort

INVARIANTS:
-----------
- signature is deterministic (same screen → same hash)
- bundle contains REFS only, no blobs
- Assets are stored before signature is set

TRANSITIONS:
------------
- Success → EnumerateActionsNode
- Error → RecoverFromErrorNode

LLM: No

CACHING: No (signature computation is fast)

VALIDATION/GUARDRAILS:
- Screenshot must be valid PNG
- Page source must be valid XML/JSON
- Signature must be non-empty

TELEMETRY:
----------
- Log: perception started/completed
- Metric: perception_latency_ms, asset_size_bytes
- Trace: span per perception

TODO:
-----
- [ ] Implement screenshot capture and storage
- [ ] Implement page source capture and storage
- [ ] Implement OCR extraction and storage
- [ ] Compute signature via SignatureService
- [ ] Compute delta from previous_signature
- [ ] Rank top-K elements via SalienceRanker
"""

from .base_node import BaseNode


class PerceiveNode(BaseNode):
    """
    Capture screen state and compute signature.
    
    USAGE:
    ------
    node = PerceiveNode(
        driver=driver_adapter,
        ocr=ocr_adapter,
        filestore=filestore_adapter,
        signature_service=signature_service,
        salience_ranker=salience_ranker,
        telemetry=telemetry_adapter,
    )
    new_state = node.run(state)
    """
    
    def __init__(
        self,
        driver: "DriverPort",
        ocr: "OCRPort",
        filestore: "FileStorePort",
        signature_service: "SignatureService",
        salience_ranker: "SalienceRanker",
        telemetry: "TelemetryPort",
    ):
        super().__init__(telemetry)
        self.driver = driver
        self.ocr = ocr
        self.filestore = filestore
        self.signature_service = signature_service
        self.salience_ranker = salience_ranker
    
    def run(self, state: "AgentState") -> "AgentState":
        """
        Capture screen and compute signature.
        
        TODO:
        - [ ] Capture screenshot, page source, OCR
        - [ ] Store assets via FileStorePort
        - [ ] Compute signature via SignatureService
        - [ ] Rank top-K elements via SalienceRanker
        - [ ] Update state with signature, bundle, ranked_elements
        """
        return state

