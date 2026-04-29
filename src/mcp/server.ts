import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { Retriever } from "../rag/index.js";

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  handler: (args: any) => Promise<any>;
}

export class MCPServer {
  private server: Server;
  private tools: Map<string, MCPTool> = new Map();
  private retriever?: Retriever;

  constructor(name: string, version: string) {
    this.server = new Server(
      { name, version },
      { capabilities: { tools: {} } }
    );

    this.setupHandlers();
  }

  setRetriever(retriever: Retriever) {
    this.retriever = retriever;
    
    this.registerTool({
      name: "retrieve_documents",
      description: "从向量数据库中检索相关文档",
      inputSchema: z.object({
        query: z.string().describe("搜索查询"),
        topK: z.number().optional().describe("返回结果数量"),
      }),
      handler: async (args: { query: string; topK?: number }) => {
        const results = await this.retriever!.retrieve(args.query);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      },
    });
  }

  registerTool(tool: MCPTool) {
    this.tools.set(tool.name, tool);
  }

  unregisterTool(toolName: string) {
    this.tools.delete(toolName);
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.tools.values()).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      }));
      return { tools };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);

      if (!tool) {
        throw new Error(`工具 ${name} 不存在`);
      }

      try {
        const parsedArgs = tool.inputSchema.parse(args);
        const result = await tool.handler(parsedArgs);
        return result;
      } catch (error: any) {
        return {
          content: [
            {
              type: "text",
              text: `工具调用失败：${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async connect() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Server 已启动");
  }

  async close() {
    await this.server.close();
  }
}
