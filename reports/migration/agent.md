# Agent components (root)

- AgentSteps: steps `{ id, label, server, state }` → `{ key, label, source, state }`; `AgentStepsStep` / `AgentStepsStepState` → core `AgentStep`; recipe part `server` → `source`.
- ThinkingIndicator: `ThinkingIndicatorStep` → `AgentStep` (same renames); new `agentName`, `words`.
- ApprovalItem: `source="agent"` → `source="Agent" agent`; `source="jira" ticketKey="PROJ-217"` → `source="Jira" reference="PROJ-217"`; `biometric` → `verify`; `source` is a string (default "" draws no tag); recipe part `ticket` → `reference`.
- QuestionPanel: options `{ id, … }` → `{ key, … }`; `QuestionPanelOption` → `QuestionOption`, `QuestionPanelArg` → `ToolArg`; `confirmOptionId` → `confirmOption` (default ""); new `agentName`; `waitingLabel`, `regionLabel`, `placeholder` default "" (from strings).
- ProjectMoveCard: removed (AntFabric-specific; QuestionPanel covers a choice between options).
