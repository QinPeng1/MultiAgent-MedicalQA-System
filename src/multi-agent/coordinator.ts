import { BaseAgent } from "../agents/index.js";
import { RouterAgent } from "../agents/router-agent.js";

export interface AgentRegistry {
  [key: string]: BaseAgent;
}

export interface MultiAgentConfig {
  agents: AgentRegistry;
  router?: RouterAgent;
  fallbackAgent?: BaseAgent;
}

export class MultiAgentCoordinator {
  private agents: AgentRegistry;
  private router?: RouterAgent;
  private fallbackAgent?: BaseAgent;

  constructor(config: MultiAgentConfig) {
    this.agents = config.agents;
    this.router = config.router;
    this.fallbackAgent = config.fallbackAgent;
  }

  registerAgent(name: string, agent: BaseAgent): void {
    this.agents[name] = agent;
  }

  unregisterAgent(name: string): void {
    delete this.agents[name];
  }

  getAgent(name: string): BaseAgent | undefined {
    return this.agents[name];
  }

  getAvailableAgents(): string[] {
    return Object.keys(this.agents);
  }

  async execute(input: string, targetAgent?: string): Promise<string> {
    let agentName = targetAgent;

    if (!agentName && this.router) {
      const routingResult = await this.router.execute(input);
      agentName = routingResult.trim();
      console.log(`[路由] 选择 Agent: ${agentName}`);
    }

    if (agentName && this.agents[agentName]) {
      return await this.agents[agentName].execute(input);
    }

    if (this.fallbackAgent) {
      console.log(`[回退] 使用默认 Agent`);
      return await this.fallbackAgent.execute(input);
    }

    throw new Error(`找不到合适的 Agent 处理请求: ${agentName}`);
  }

  async broadcast(input: string): Promise<Record<string, string>> {
    const results: Record<string, string> = {};

    for (const [name, agent] of Object.entries(this.agents)) {
      try {
        results[name] = await agent.execute(input);
      } catch (error) {
        results[name] = `执行失败: ${error}`;
      }
    }

    return results;
  }
}
