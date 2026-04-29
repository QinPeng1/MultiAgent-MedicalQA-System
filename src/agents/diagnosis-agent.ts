import { BaseAgent, AgentConfig } from "./base.js";
import { Retriever } from "../rag/index.js";

export interface DiagnosisAgentConfig extends AgentConfig {
  retriever?: Retriever;
}

export class DiagnosisAgent extends BaseAgent {
  private retriever?: Retriever;

  constructor(config: DiagnosisAgentConfig) {
    super({
      ...config,
      systemPrompt: `你是一个经验丰富的诊断专家。

你的职责：
1. 根据患者症状和病史，分析可能的疾病
2. 提供鉴别诊断思路
3. 建议需要进行的检查项目

诊断原则：
- 常见病优先考虑
- 结合患者年龄、性别、病史
- 注意排除危及生命的疾病

注意：你提供的诊断建议仅供参考，不能替代专业医生的诊断。`,
    });
    this.retriever = config.retriever;
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    let contextContent = "";
    
    if (this.retriever && context?.medicalHistory) {
      contextContent = await this.retriever.formatContext(input);
    }

    const prompt = `患者信息：${input}
${context?.triageResult ? `\n分诊结果：${context.triageResult}` : ""}
${context?.medicalHistory ? `\n病史信息：${context.medicalHistory}` : ""}

请进行诊断分析，包括：
1. 可能的疾病列表
2. 鉴别诊断
3. 建议的检查项目

请给出你的诊断分析：`;

    if (contextContent) {
      return await this.chat(prompt, contextContent);
    }
    return await this.chat(prompt);
  }
}
