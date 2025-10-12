"""
LLM Adapter: AI Decision-Making Implementation

PURPOSE:
--------
Implement LLMPort using LLM provider (OpenAI, Anthropic, etc.).

DEPENDENCIES (ALLOWED):
-----------------------
- ports.llm_port (LLMPort interface)
- domain types (ChosenAction, VerificationResult, etc.)
- LLM SDK (openai, anthropic, langchain, etc.)

DEPENDENCIES (FORBIDDEN):
-------------------------
- NO other adapters

IMPLEMENTATION:
---------------
- LLMAdapter: Main adapter class
- prompt_templates: Templates for each node type
- output_parsers: Parse LLM outputs to structured types
- guardrails: Validate LLM outputs

PROMPT TEMPLATES:
-----------------
- choose_action_prompt(state) -> str
- verify_prompt(state) -> str
- detect_progress_prompt(state) -> str
- should_continue_prompt(state) -> str
- switch_policy_prompt(state) -> str

OUTPUT PARSERS:
---------------
- parse_chosen_action(response) -> ChosenAction
- parse_verification(response) -> VerificationResult
- parse_progress(response) -> ProgressAssessment
- parse_routing(response) -> RoutingDecision
- parse_policy_switch(response) -> PolicySwitch

GUARDRAILS:
-----------
- Validate action indices
- Validate confidence scores
- Reject unsafe actions
- Fallback to heuristics on validation failure

TODO:
-----
- [ ] Implement LLMAdapter class
- [ ] Add prompt templates for each node
- [ ] Add output parsers
- [ ] Add guardrails
- [ ] Add token counting and cost estimation
"""

