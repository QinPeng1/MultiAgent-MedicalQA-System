import { BaseAgent, AgentConfig } from "./base.js";

export interface AssistantAgentConfig extends AgentConfig {
  expertise?: string[];
}

export class AssistantAgent extends BaseAgent {
  private expertise: string[];

  constructor(config: AssistantAgentConfig) {
    super({
      ...config,
      systemPrompt: config.systemPrompt || "你是一个有帮助的AI助手。",
    });
    this.expertise = config.expertise || [];
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    return await this.chat(input);
  }
}
