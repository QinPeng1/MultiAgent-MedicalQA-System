import { BaseAgent, AgentConfig, Message } from "./base.js";
import { Retriever } from "../rag/index.js";

export interface RAGAgentConfig extends AgentConfig {
  retriever: Retriever;
}

export class RAGAgent extends BaseAgent {
  private retriever: Retriever;

  constructor(config: RAGAgentConfig) {
    super(config);
    this.retriever = config.retriever;
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    const contextContent = await this.retriever.formatContext(input);
    
    if (contextContent) {
      const prompt = `请基于以下参考资料回答用户的问题：\n\n${contextContent}\n\n用户问题：${input}\n\n请提供准确、详细的回答。如果参考资料中没有相关信息，请说明。`;
      return await this.chat(input, contextContent);
    } else {
      return await this.chat(input);
    }
  }

  async search(query: string): Promise<any[]> {
    return await this.retriever.retrieve(query);
  }
}
