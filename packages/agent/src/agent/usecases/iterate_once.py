"""
IterateOnce Usecase: Single Agent Loop Iteration

PURPOSE:
--------
Execute one complete iteration of the agent loop (all nodes).
The five LLM nodes are ALWAYS invoked in every iteration.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState)
- orchestrator (graph)
- ports (all, via graph)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters

INPUTS:
-------
- state: Current AgentState

OUTPUTS:
--------
- Updated AgentState after one iteration

NODE ORDER (reference graph.py):
---------------------------------
1. Perceive → EnumerateActions
2. ChooseAction [LLM] → Act
3. Verify [LLM] → Persist
4. DetectProgress [LLM] → ShouldContinue [LLM]
5. Route based on ShouldContinue output

LLM NODES (always-on):
----------------------
- ChooseAction: Select action
- Verify: Validate outcome
- DetectProgress: Label progress
- ShouldContinue: Propose route
- (SwitchPolicy: Only if routed)

TODO:
-----
- [ ] Get graph from build_graph()
- [ ] Execute graph with current state
- [ ] Handle errors and recovery
- [ ] Return updated state
"""


class IterateOnceUsecase:
    """
    Execute one agent loop iteration.
    
    USAGE:
    ------
    usecase = IterateOnceUsecase(graph=graph)
    new_state = await usecase.execute(state)
    """
    
    def __init__(self, graph: "Graph"):
        self.graph = graph
    
    async def execute(self, state: "AgentState") -> "AgentState":
        """
        Execute one iteration.
        
        TODO:
        - [ ] Run graph with state
        - [ ] Handle routing (continue/switch/restart/stop)
        - [ ] Return updated state
        """
        pass

