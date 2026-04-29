import { BaseAgent, AgentConfig } from "./base.js";

export interface TriageAgentConfig extends AgentConfig {
  urgencyLevels?: string[];
}

export class TriageAgent extends BaseAgent {
  private urgencyLevels: string[];

  constructor(config: TriageAgentConfig) {
    super({
      ...config,
      systemPrompt: `你是一个专业的医疗分诊助手。

你的职责：
1. 根据患者的症状描述，判断紧急程度
2. 推荐合适的科室（如内科、外科、急诊、儿科等）
3. 给出初步的就医建议

紧急程度分级：
${config.urgencyLevels?.join(", ") || "危急、紧急、一般、预防保健"}

注意：你提供的信息仅供参考，不能替代专业医疗诊断。`,
    });
    this.urgencyLevels = config.urgencyLevels || ["危急", "紧急", "一般", "预防保健"];
  }

  async execute(input: string, context?: Record<string, any>): Promise<string> {
    const prompt = `患者描述：${input}\n\n请进行分诊评估，包括：
1. 紧急程度评估
2. 推荐科室
3. 初步建议

请给出你的评估结果：`;
    return await this.chat(prompt);
  }

  assessUrgency(symptoms: string): string {
    const urgentKeywords = ["胸痛", "呼吸困难", "大出血", "昏迷", "剧烈头痛", "意识丧失"];
    const emergencyKeywords = ["发热", "咳嗽", "呕吐", "腹泻", "轻微出血"];
    
    for (const keyword of urgentKeywords) {
      if (symptoms.includes(keyword)) return "危急";
    }
    for (const keyword of emergencyKeywords) {
      if (symptoms.includes(keyword)) return "紧急";
    }
    return "一般";
  }
}
