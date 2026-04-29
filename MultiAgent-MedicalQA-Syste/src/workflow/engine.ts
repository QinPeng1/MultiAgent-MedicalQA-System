import { BaseAgent } from "../agents/index.js";
import {
  WorkflowConfig,
  WorkflowStep,
  WorkflowContext,
  WorkflowStepResult,
} from "./types.js";

export class WorkflowEngine {
  private config: WorkflowConfig;
  private steps: Map<string, WorkflowStep> = new Map();

  constructor(config: WorkflowConfig) {
    this.config = config;
    
    for (const step of config.steps) {
      this.steps.set(step.id, step);
    }
  }

  async execute(input: string): Promise<WorkflowContext> {
    const context: WorkflowContext = {
      input,
      output: "",
      variables: new Map(),
      history: [],
    };

    let currentStepId = this.config.entryPoint;
    let stepCount = 0;
    const maxSteps = 50;

    while (currentStepId && stepCount < maxSteps) {
      const step = this.steps.get(currentStepId);
      
      if (!step) {
        throw new Error(`步骤 ${currentStepId} 不存在`);
      }

      if (step.condition && !step.condition(context)) {
        currentStepId = step.next?.[0] || "";
        continue;
      }

      console.log(`[工作流] 执行步骤: ${step.name}`);
      
      const result = await this.executeStep(step, context);
      context.history.push(result);
      context.output = result.output;

      if (step.next && step.next.length > 0) {
        currentStepId = step.next[0];
      } else {
        currentStepId = "";
      }

      stepCount++;
    }

    return context;
  }

  private async executeStep(
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<WorkflowStepResult> {
    const input = context.output || context.input;
    
    const output = await step.agent.execute(input, {
      variables: context.variables,
      history: context.history,
    });

    return {
      stepId: step.id,
      stepName: step.name,
      input,
      output,
      timestamp: new Date(),
    };
  }

  addStep(step: WorkflowStep): void {
    this.steps.set(step.id, step);
  }

  removeStep(stepId: string): void {
    this.steps.delete(stepId);
  }

  getStep(stepId: string): WorkflowStep | undefined {
    return this.steps.get(stepId);
  }

  getSteps(): WorkflowStep[] {
    return Array.from(this.steps.values());
  }
}
