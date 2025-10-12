"""
CachePort: Prompt and Advice Caching Interface

PURPOSE:
--------
Cache LLM outputs to reduce latency and costs.
Two cache types:
1. Prompt Cache: Raw LLM outputs keyed by (node, model, inputs)
2. Advice Store: Normalized advice keyed by signature

DEPENDENCIES (ALLOWED):
-----------------------
- abc, typing (stdlib)
- domain types (Advice, CacheEntry)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO Redis/Memcached SDK imports
- NO serialization logic (that's in adapters)

METHODS:
--------
- get_prompt_cache(key: str) -> Optional[dict]
- set_prompt_cache(key: str, value: dict, ttl: int)
- get_advice(signature: str) -> Optional[Advice]
- set_advice(signature: str, advice: Advice, ttl: int)
- invalidate(pattern: str)

CACHE KEYS:
-----------
Prompt Cache: {node_type}:{model}:{signature}:{delta_hash}:{topK_hash}:{policy}
Advice Store: advice:{signature}

TTL:
----
- Prompt Cache: 7 days (long-lived, signature-based)
- Advice Store: 7 days (can be versioned)
- Routing decisions: 1 hour (shorter for dynamic decisions)

EVICTION:
---------
- LRU eviction for memory-based caches
- TTL expiration for all caches
- Manual invalidation on schema changes

TODO:
-----
- [ ] Add cache hit/miss metrics
- [ ] Add cache warming strategies
- [ ] Add distributed cache support
"""

from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class CachePort(ABC):
    """
    Interface for caching LLM outputs and advice.
    Implemented by adapters/cache.
    """
    
    @abstractmethod
    async def get_prompt_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached LLM output.
        
        Args:
            key: Cache key (node_type:model:signature:...).
        
        Returns:
            Cached value (dict) or None if miss.
        """
        pass
    
    @abstractmethod
    async def set_prompt_cache(
        self,
        key: str,
        value: Dict[str, Any],
        ttl: int = 604800,  # 7 days
    ) -> None:
        """
        Store LLM output in cache.
        
        Args:
            key: Cache key.
            value: LLM output (structured dict).
            ttl: Time-to-live in seconds.
        """
        pass
    
    @abstractmethod
    async def get_advice(self, signature: str) -> Optional["Advice"]:
        """
        Retrieve cached advice for a screen.
        
        Args:
            signature: ScreenSignature.hash.
        
        Returns:
            Advice or None if miss.
        """
        pass
    
    @abstractmethod
    async def set_advice(
        self,
        signature: str,
        advice: "Advice",
        ttl: int = 604800,  # 7 days
    ) -> None:
        """
        Store advice for a screen.
        
        Args:
            signature: ScreenSignature.hash.
            advice: Advice object.
            ttl: Time-to-live in seconds.
        """
        pass
    
    @abstractmethod
    async def invalidate(self, pattern: str) -> int:
        """
        Invalidate cache entries matching a pattern.
        
        Args:
            pattern: Key pattern (e.g., "choose_action:*").
        
        Returns:
            Number of keys invalidated.
        """
        pass
    
    @abstractmethod
    async def get_stats(self) -> Dict[str, int]:
        """
        Get cache statistics.
        
        Returns:
            Dict with hits, misses, size, evictions, etc.
        """
        pass

