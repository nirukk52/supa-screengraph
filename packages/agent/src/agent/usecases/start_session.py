"""
StartSession Usecase: Initialize Agent Run

PURPOSE:
--------
Create initial AgentState, persist run record, validate setup.

DEPENDENCIES (ALLOWED):
-----------------------
- domain types (AgentState, Budgets)
- ports (RepoPort, TelemetryPort)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO adapters

INPUTS:
-------
- run_id: Unique run identifier
- app_id: Target app package name
- budgets: Resource limits (optional, uses defaults)

OUTPUTS:
--------
- Initial AgentState with run_id, app_id, budgets, timestamps

SIDE EFFECTS:
-------------
- Persists run record via RepoPort
- Logs session start via TelemetryPort

TODO:
-----
- [ ] Implement state initialization
- [ ] Persist run record
- [ ] Validate inputs (app_id, budgets)
"""


class StartSessionUsecase:
    """
    Initialize a new agent run.
    
    USAGE:
    ------
    usecase = StartSessionUsecase(repo=repo_port, telemetry=telemetry_port)
    state = await usecase.execute(run_id="run-123", app_id="com.example.app")
    """
    
    def __init__(self, repo: "RepoPort", telemetry: "TelemetryPort"):
        self.repo = repo
        self.telemetry = telemetry
    
    async def execute(
        self,
        run_id: str,
        app_id: str,
        budgets: "Budgets" = None,
    ) -> "AgentState":
        """
        Initialize agent run.
        
        TODO:
        - [ ] Create initial AgentState
        - [ ] Persist run record
        - [ ] Log session start
        - [ ] Return initial state
        """
        pass

