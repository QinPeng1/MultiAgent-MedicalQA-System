import { BaseAgent, AgentConfig } from "./base.js";
import { Retriever } from "../rag/index.js";

export interface MedicationAgentConfig extends AgentConfig {
  retriever?: Retriever;
}

export class MedicationAgent extends BaseAgent {
  private retriever?: Retriever;

  constructor(config: MedicationAgentConfig) {
    super({
      ...config,
      systemPrompt: `你是一个专业的药物咨询专家。

你的职责：
1. 根据诊断结果推荐合适的药物
2. 提供用药建议（剂量、频次、疗程）
3. 提醒药物相互作用和禁忌
4. 告知可能的副作用

用药原则：
- 对症下药
- 注意药物相互作用
- 考虑患者过敏史
- 特殊人群（孕妇、儿童、老人）用药需谨慎

注意：你提供的用药建议仅供参考，具体用药请遵医嘱。`,
    });
    this.retriever = config.retriever;
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    let contextContent = "";
    
    if (this.retriever) {
      contextContent = await this.retriever.formatContext(input);
    }

    const prompt = `诊断信息：${input}
${context?.allergies ? `\n过敏史：${context.allergies}` : ""}
${context?.currentMedications ? `\n当前用药：${context.currentMedications}` : ""}
${context?.diagnosisResult ? `\n诊断结果：${context.diagnosisResult}` : ""}

请提供用药建议，包括：
1. 推荐药物
2. 用法用量
3. 注意事项
4. 可能的副作用

请给出你的用药建议：`;

    if (contextContent) {
      return await this.chat(prompt, contextContent);
    }
    return await this.chat(prompt);
  }
}
