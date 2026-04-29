import OpenAI from "openai";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "../config.js";

export function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: config.mimoApiKey,
    baseURL: config.mimoApiBaseUrl,
  });
}

export function createChatModel(): ChatOpenAI {
  return new ChatOpenAI({
    model: config.mimoModel,
    openAIApiKey: config.mimoApiKey,
    configuration: {
      baseURL: config.mimoApiBaseUrl,
    },
    temperature: 0.7,
  });
}

export async function chatCompletion(
  messages: Array<{ role: string; content: string }>,
  options?: {
    model?: string;
    temperature?: number;
    stream?: boolean;
  }
): Promise<string> {
  const client = createOpenAIClient();
  
  const response = await client.chat.completions.create({
    model: options?.model || config.mimoModel,
    messages: messages as any,
    temperature: options?.temperature ?? 0.7,
    stream: options?.stream ?? false,
  });

  return response.choices[0]?.message?.content || "";
}

export async function chatCompletionStream(
  messages: Array<{ role: string; content: string }>,
  onChunk: (chunk: string) => void,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<void> {
  const client = createOpenAIClient();
  
  const stream = await client.chat.completions.create({
    model: options?.model || config.mimoModel,
    messages: messages as any,
    temperature: options?.temperature ?? 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    if (content) {
      onChunk(content);
    }
  }
}
