import { BaseAgent, AgentConfig } from "./base.js";

export interface RouterAgentConfig extends AgentConfig {
  availableAgents: string[];
}

export class RouterAgent extends BaseAgent {
  private availableAgents: string[];

  constructor(config: RouterAgentConfig) {
    super({
      ...config,
      systemPrompt: `你是一个智能路由Agent，负责分析用户问题并决定将问题路由给哪个专业Agent。

可用的Agent有：${config.availableAgents.join(", ")}

请根据问题的类型和内容，选择最合适的Agent。只返回Agent名称，不要其他内容。`,
    });
    this.availableAgents = config.availableAgents;
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    const prompt = `用户问题：${input}\n\n请将这个问题路由给最合适的Agent。只返回Agent名称：`;
    return await this.chat(prompt);
  }
}
