import { BaseAgent, AgentConfig } from "./base.js";

export interface LifestyleAgentConfig extends AgentConfig {
}

export class LifestyleAgent extends BaseAgent {
  constructor(config: LifestyleAgentConfig) {
    super({
      ...config,
      systemPrompt: `你是一个专业的健康管理和生活方式顾问。

你的职责：
1. 提供饮食建议
2. 制定运动计划
3. 给出生活习惯改善建议
4. 心理健康指导

健康原则：
- 均衡饮食
- 适量运动
- 规律作息
- 心理平衡

注意：你提供的建议仅供参考，不能替代专业医疗建议。`,
    });
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    const prompt = `患者情况：${input}
${context?.diagnosisResult ? `\n诊断结果：${context.diagnosisResult}` : ""}
${context?.medicationResult ? `\n用药方案：${context.medicationResult}` : ""}

请提供健康管理建议，包括：
1. 饮食建议
2. 运动建议
3. 生活习惯调整
4. 随访建议

请给出你的健康管理建议：`;
    return await this.chat(prompt);
  }
}
