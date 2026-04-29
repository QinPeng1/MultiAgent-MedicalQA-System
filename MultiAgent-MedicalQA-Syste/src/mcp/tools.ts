import { z } from "zod";

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  unregister(name: string) {
    this.tools.delete(name);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export const commonTools = {
  webSearch: {
    name: "web_search",
    description: "执行网络搜索获取最新信息",
    inputSchema: z.object({
      query: z.string().describe("搜索关键词"),
      numResults: z.number().optional().describe("返回结果数量"),
    }),
  },
  calculator: {
    name: "calculator",
    description: "执行数学计算",
    inputSchema: z.object({
      expression: z.string().describe("数学表达式"),
    }),
  },
  databaseQuery: {
    name: "database_query",
    description: "查询数据库",
    inputSchema: z.object({
      query: z.string().describe("SQL 查询语句"),
      params: z.array(z.any()).optional().describe("查询参数"),
    }),
  },
  fileRead: {
    name: "file_read",
    description: "读取文件内容",
    inputSchema: z.object({
      filePath: z.string().describe("文件路径"),
      encoding: z.string().optional().describe("文件编码"),
    }),
  },
};
