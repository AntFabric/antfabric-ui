// Recipes for the human-in-the-loop components: one file per component, listed here.
import { agentSteps } from "./agent-steps";
import { approvalItem } from "./approval-item";
import { questionPanel } from "./question-panel";
import { thinkingIndicator } from "./thinking-indicator";

export const agent = {
  "agent-steps": agentSteps,
  "approval-item": approvalItem,
  "question-panel": questionPanel,
  "thinking-indicator": thinkingIndicator,
} as const;
