import { BaseAgent, AgentConfig } from "./base.js";

export interface MedicalCoordinatorConfig extends AgentConfig {
}

export class MedicalCoordinatorAgent extends BaseAgent {
  constructor(config: MedicalCoordinatorConfig) {
    super({
      ...config,
      systemPrompt: `你是医疗团队的协调者，负责整合各专科Agent的意见，形成完整的医疗建议。

你的职责：
1. 整合分诊、诊断、用药、健康管理各环节的意见
2. 生成综合医疗报告
3. 给出最终的综合建议
4. 标注需要特别注意的事项

注意：综合报告仅供参考，不能替代专业医生的诊断和治疗。`,
    });
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    const triageResult = context?.triageResult || "未进行分诊评估";
    const diagnosisResult = context?.diagnosisResult || "未进行诊断分析";
    const medicationResult = context?.medicationResult || "未进行用药评估";
    const lifestyleResult = context?.lifestyleResult || "未进行健康管理建议";

    const prompt = `患者主诉：${input}

各专科评估结果：

【分诊评估】
${triageResult}

【诊断分析】
${diagnosisResult}

【用药建议】
${medicationResult}

【健康管理】
${lifestyleResult}

请整合以上信息，生成一份完整的医疗咨询报告，包括：
1. 病情摘要
2. 综合评估
3. 治疗建议
4. 注意事项
5. 随访建议

请生成综合医疗报告：`;

    return await this.chat(prompt);
  }
}
