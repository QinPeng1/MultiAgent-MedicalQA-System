import { VectorStore } from "./vector-store.js";
import type { Document } from "@langchain/core/documents";

export interface RetrievalConfig {
  topK: number;
  scoreThreshold?: number;
}

export interface RetrievalResult {
  content: string;
  metadata: Record<string, any>;
  score: number;
}

export class Retriever {
  private vectorStore: VectorStore;
  private config: RetrievalConfig;

  constructor(vectorStore: VectorStore, config: RetrievalConfig) {
    this.vectorStore = vectorStore;
    this.config = config;
  }

  async retrieve(query: string): Promise<RetrievalResult[]> {
    const resultsWithScore = await this.vectorStore.similaritySearchWithScore(
      query,
      this.config.topK
    );

    return resultsWithScore
      .filter(([_, score]) => {
        if (this.config.scoreThreshold === undefined) return true;
        return score >= this.config.scoreThreshold;
      })
      .map(([doc, score]) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
        score,
      }));
  }

  async formatContext(query: string): Promise<string> {
    const results = await this.retrieve(query);
    
    if (results.length === 0) {
      return "";
    }

    return results.map((result, index) => {
      const source = result.metadata.source || "未知来源";
      return `[文档 ${index + 1}] (来源: ${source})\n${result.content}`;
    }).join("\n\n---\n\n");
  }
}
