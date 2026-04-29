import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs/promises";
import * as path from "path";

export interface DocumentProcessorConfig {
  chunkSize: number;
  chunkOverlap: number;
  supportedExtensions: string[];
}

export class DocumentProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;
  private supportedExtensions: string[];

  constructor(config: DocumentProcessorConfig) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
    });
    this.supportedExtensions = config.supportedExtensions;
  }

  async loadFile(filePath: string): Promise<Document[]> {
    const ext = path.extname(filePath).toLowerCase();
    
    if (!this.supportedExtensions.includes(ext)) {
      throw new Error(`不支持的文件类型：${ext}`);
    }

    const content = await fs.readFile(filePath, "utf-8");
    const metadata = {
      source: filePath,
      filename: path.basename(filePath),
    };

    const doc = new Document({
      pageContent: content,
      metadata,
    });

    return await this.textSplitter.splitDocuments([doc]);
  }

  async loadDirectory(dirPath: string): Promise<Document[]> {
    const files = await fs.readdir(dirPath);
    const allDocuments: Document[] = [];

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        try {
          const docs = await this.loadFile(filePath);
          allDocuments.push(...docs);
        } catch (error) {
          console.warn(`跳过文件 ${file}:`, error);
        }
      }
    }

    return allDocuments;
  }

  async processText(text: string, metadata?: Record<string, any>): Promise<Document[]> {
    const doc = new Document({
      pageContent: text,
      metadata: metadata || {},
    });

    return await this.textSplitter.splitDocuments([doc]);
  }
}
