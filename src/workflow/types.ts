import { BaseAgent } from "../agents/index.js";

export interface WorkflowStep {
  id: string;
  name: string;
  agent: BaseAgent;
  condition?: (context: WorkflowContext) => boolean;
  next?: string[];
}

export interface WorkflowContext {
  input: string;
  output: string;
  variables: Map<string, any>;
  history: WorkflowStepResult[];
}

export interface WorkflowStepResult {
  stepId: string;
  stepName: string;
  input: string;
  output: string;
  timestamp: Date;
}

export interface WorkflowConfig {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  entryPoint: string;
}
