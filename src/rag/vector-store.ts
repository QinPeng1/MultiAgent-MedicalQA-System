import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import type { Document } from "@langchain/core/documents";
import { config } from "../config.js";

export interface VectorStoreConfig {
  collectionName: string;
  chromaUrl?: string;
  embeddingModel?: string;
}

export class VectorStore {
  private vectorStore: Chroma;

  constructor(cfg: VectorStoreConfig) {
    const embeddings = new OpenAIEmbeddings({
      model: cfg.embeddingModel || "text-embedding-3-small",
      configuration: {
        baseURL: config.mimoApiBaseUrl,
      },
    });

    this.vectorStore = new Chroma(embeddings, {
      collectionName: cfg.collectionName,
      url: cfg.chromaUrl || "http://localhost:8000",
    });
  }

  async addDocuments(documents: Document[]): Promise<void> {
    await this.vectorStore.addDocuments(documents);
  }

  async similaritySearch(query: string, k: number = 4): Promise<Document[]> {
    return await this.vectorStore.similaritySearch(query, k);
  }

  async similaritySearchWithScore(
    query: string,
    k: number = 4
  ): Promise<[Document, number][]> {
    return await this.vectorStore.similaritySearchWithScore(query, k);
  }

  async deleteCollection(): Promise<void> {
    await this.vectorStore.delete({ deleteAll: true });
  }
}
