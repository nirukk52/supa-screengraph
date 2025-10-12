"""
BFF Dependencies: Composition Root and DI Container

PURPOSE:
--------
Instantiate adapters and bind them to ports.
Provide DI for usecases and routes.

DEPENDENCIES (ALLOWED):
-----------------------
- adapters (to instantiate)
- usecases (to inject with adapters)
- config (for adapter configuration)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO business logic
- NO src/ imports except through ports

WIRING NOTE:
------------
The BFF is responsible for:
1. Reading config (env vars, config files)
2. Instantiating adapters (AppiumAdapter, LLMAdapter, etc.)
3. Injecting adapters into usecases via ports
4. Providing usecases to routes via FastAPI Depends()

Example wiring:
    # 1. Read config
    config = RuntimeConfig.from_env()
    
    # 2. Instantiate adapters
    driver_adapter = AppiumAdapter(config.device)
    llm_adapter = LLMAdapter(config.llm)
    repo_adapter = RepoAdapter(config.storage)
    # ... (all adapters)
    
    # 3. Bind adapters to ports (via constructor injection)
    graph = build_graph(
        driver=driver_adapter,  # DriverPort
        llm=llm_adapter,        # LLMPort
        repo=repo_adapter,      # RepoPort
        # ... (all ports)
    )
    
    # 4. Inject graph into usecases
    iterate_usecase = IterateOnceUsecase(graph=graph)
    
    # 5. Provide usecase to routes via Depends()
    @router.post("/sessions/{id}/iterate")
    async def iterate(usecase: IterateOnceUsecase = Depends(get_iterate_usecase)):
        return await usecase.execute(...)

IMPORTANT: Adapters never talk to each other directly.
Orchestration/usecases coordinate across ports.

TODO:
-----
- [ ] Implement Dependencies class
- [ ] Add adapter instantiation
- [ ] Add port binding
- [ ] Add usecase factory methods
- [ ] Add FastAPI Depends() providers
"""


class Dependencies:
    """
    DI container for adapters and usecases.
    
    USAGE:
    ------
    deps = Dependencies()
    await deps.initialize()  # Create adapters
    iterate_usecase = deps.get_iterate_usecase()
    await deps.shutdown()  # Close connections
    """
    
    def __init__(self):
        """
        Initialize DI container.
        
        TODO:
        - [ ] Read config
        - [ ] Prepare adapter configs (no instantiation yet)
        """
        pass
    
    async def initialize(self):
        """
        Initialize adapters and establish connections.
        
        Called on FastAPI startup.
        
        TODO:
        - [ ] Instantiate all adapters
        - [ ] Establish DB/cache connections
        - [ ] Verify device connectivity
        - [ ] Build orchestrator graph
        """
        pass
    
    async def shutdown(self):
        """
        Cleanup adapters and close connections.
        
        Called on FastAPI shutdown.
        
        TODO:
        - [ ] Close DB/cache connections
        - [ ] Cleanup temp files
        - [ ] Log final stats
        """
        pass
    
    def get_start_session_usecase(self):
        """Factory for StartSessionUsecase."""
        pass
    
    def get_iterate_usecase(self):
        """Factory for IterateOnceUsecase."""
        pass
    
    def get_finalize_usecase(self):
        """Factory for FinalizeRunUsecase."""
        pass

