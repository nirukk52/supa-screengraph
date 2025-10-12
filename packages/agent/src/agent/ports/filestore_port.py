"""
FileStorePort: Asset Storage Interface

PURPOSE:
--------
Store and retrieve heavy assets (screenshots, page sources, rationales).
Enables PerceiveNode, ChooseActionNode to store refs instead of blobs.

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO S3/GCS/Azure SDK imports
- NO filesystem I/O (that's in adapters)
- NO encoding/compression logic

METHODS:
--------
- put(key: str, data: bytes, content_type: str) -> str
- get(key: str) -> bytes
- delete(key: str) -> bool
- exists(key: str) -> bool
- generate_key(prefix: str, extension: str) -> str

KEY STRUCTURE:
--------------
runs/{run_id}/screenshots/{screen_id}.png
runs/{run_id}/page_sources/{screen_id}.xml
runs/{run_id}/rationales/{node_type}_{screen_id}.json

IMMUTABILITY:
-------------
- Keys are content-addressed or UUID-based
- Once stored, assets are immutable (no updates)
- Deletion is rare (only for cleanup)

TODO:
-----
- [ ] Add streaming for large files
- [ ] Add compression support
- [ ] Add TTL/expiration
- [ ] Add batch operations
"""

from abc import ABC, abstractmethod
from typing import Optional


class FileStorePort(ABC):
    """
    Interface for asset storage.
    Implemented by adapters/repo (S3, GCS, local filesystem).
    """
    
    @abstractmethod
    async def put(
        self,
        key: str,
        data: bytes,
        content_type: str = "application/octet-stream",
    ) -> str:
        """
        Store data under a key.
        
        Args:
            key: Storage key (path-like).
            data: Binary data.
            content_type: MIME type (image/png, text/xml, etc.).
        
        Returns:
            Final key (may include prefix/bucket).
        
        Raises:
            StorageError: If upload failed.
        """
        pass
    
    @abstractmethod
    async def get(self, key: str) -> bytes:
        """
        Retrieve data by key.
        
        Args:
            key: Storage key.
        
        Returns:
            Binary data.
        
        Raises:
            KeyNotFoundError: If key doesn't exist.
            StorageError: If retrieval failed.
        """
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Delete data by key.
        
        Args:
            key: Storage key.
        
        Returns:
            True if deleted, False if key didn't exist.
        
        Raises:
            StorageError: If deletion failed.
        """
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """
        Check if key exists.
        
        Args:
            key: Storage key.
        
        Returns:
            True if key exists.
        """
        pass
    
    @abstractmethod
    def generate_key(
        self,
        run_id: str,
        category: str,
        screen_id: str,
        extension: str,
    ) -> str:
        """
        Generate a deterministic key.
        
        Args:
            run_id: Run identifier.
            category: Asset type (screenshots, page_sources, etc.).
            screen_id: Screen signature.
            extension: File extension (png, xml, json).
        
        Returns:
            Key path (e.g., runs/run-123/screenshots/screen-abc.png).
        """
        pass

