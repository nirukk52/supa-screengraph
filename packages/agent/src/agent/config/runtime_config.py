"""
RuntimeConfig: Typed Configuration Objects

PURPOSE:
--------
Define typed configuration for agent runtime.
Injected by BFF from env vars, CLI args, or config files.

DEPENDENCIES (ALLOWED):
-----------------------
- dataclasses (stdlib)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO os.environ reads
- NO file I/O

CONFIG STRUCTURE:
-----------------
- DeviceConfig: Appium server URL, timeouts
- LLMConfig: Provider, model, API key (ref), timeouts
- StorageConfig: DB URL, S3 bucket, credentials (ref)
- CacheConfig: Redis URL, TTL
- BudgetConfig: Default budgets

TODO:
-----
- [ ] Implement config dataclasses
- [ ] Add validation methods
- [ ] Add config serialization
"""

from dataclasses import dataclass


@dataclass
class DeviceConfig:
    """Device automation configuration."""
    appium_url: str = "http://localhost:4723"
    platform: str = "android"  # android | ios
    device_id: str = ""
    timeout_ms: int = 30000


@dataclass
class LLMConfig:
    """LLM provider configuration."""
    provider: str = "openai"  # openai | anthropic | local
    model: str = "gpt-4"
    api_key_ref: str = ""  # Reference to secret store
    timeout_ms: int = 30000
    max_tokens: int = 10000


@dataclass
class StorageConfig:
    """Storage configuration."""
    db_url: str = "postgresql://localhost/screengraph"
    storage_type: str = "s3"  # s3 | gcs | local
    bucket: str = "screengraph-assets"
    credentials_ref: str = ""


@dataclass
class CacheConfig:
    """Cache configuration."""
    cache_type: str = "memory"  # memory | redis
    redis_url: str = "redis://localhost:6379"
    ttl_seconds: int = 604800  # 7 days


@dataclass
class RuntimeConfig:
    """Complete runtime configuration."""
    device: DeviceConfig
    llm: LLMConfig
    storage: StorageConfig
    cache: CacheConfig
    
    # Placeholder implementation
    # TODO: Add validation, serialization

