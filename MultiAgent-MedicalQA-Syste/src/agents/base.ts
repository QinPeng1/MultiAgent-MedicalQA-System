import { chatCompletion } from "../models/mimo.js";
import { RetrievalResult } from "../rag/retriever.js";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentConfig {
  name: string;
  role: string;
  systemPrompt: string;
  tools?: string[];
  temperature?: number;
}

export interface ToolCall {
  toolName: string;
  args: Record<string, any>;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected conversationHistory: Message[] = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.conversationHistory = [
      {
        role: "system",
        content: this.buildSystemPrompt(),
      },
    ];
  }

  protected buildSystemPrompt(): string {
    return `${this.config.systemPrompt}\n\n你的角色是：${this.config.role}`;
  }

  protected addMessage(message: Message): void {
    this.conversationHistory.push(message);
  }

  async chat(
    userInput: string,
    context?: string
  ): Promise<string> {
    const messages: Message[] = [...this.conversationHistory];

    if (context) {
      const enhancedMessage = `基于以下上下文回答问题：\n\n${context}\n\n用户问题：${userInput}`;
      messages.push({ role: "user", content: enhancedMessage });
    } else {
      messages.push({ role: "user", content: userInput });
    }

    const response = await chatCompletion(messages, {
      temperature: this.config.temperature,
    });

    this.addMessage({ role: "user", content: userInput });
    this.addMessage({ role: "assistant", content: response });

    return response;
  }

  abstract execute(input: string, context?: Record<string, any>): Promise<string>;

  getName(): string {
    return this.config.name;
  }

  getRole(): string {
    return this.config.role;
  }

  clearHistory(): void {
    this.conversationHistory = [
      {
        role: "system",
        content: this.buildSystemPrompt(),
      },
    ];
  }
}
