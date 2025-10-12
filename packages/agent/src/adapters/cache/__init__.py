"""
Cache Adapter: Caching Implementation

PURPOSE:
--------
Implement CachePort using in-memory cache or Redis.

DEPENDENCIES (ALLOWED):
-----------------------
- ports.cache_port (CachePort interface)
- domain types (Advice, CacheEntry)
- Cache library (redis, diskcache, cachetools, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO other adapters

IMPLEMENTATION:
---------------
- CacheAdapter: Main adapter class
- key_builder: Build cache keys from state
- serializer: Serialize/deserialize domain types

CACHE OPTIONS:
--------------
- In-memory: Fast, ephemeral (cachetools, lru_cache)
- Redis: Fast, distributed, persistent
- DiskCache: Moderate speed, persistent, local

CACHE KEYS:
-----------
- Prompt cache: {node_type}:{model}:{signature}:{delta_hash}:{topK_hash}
- Advice store: advice:{signature}

TODO:
-----
- [ ] Implement CacheAdapter class (in-memory + Redis)
- [ ] Add key building logic
- [ ] Add serialization (domain types ↔ JSON)
- [ ] Add TTL support
- [ ] Add stats tracking (hits, misses, evictions)
"""

