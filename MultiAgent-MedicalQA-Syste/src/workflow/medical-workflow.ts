import { BaseAgent, TriageAgent, DiagnosisAgent, MedicationAgent, LifestyleAgent, MedicalCoordinatorAgent } from "../agents/index.js";
import { Retriever } from "../rag/index.js";

export interface MedicalWorkflowConfig {
  retriever?: Retriever;
  enableParallelExecution?: boolean;
  maxConcurrency?: number;
}

export interface MedicalWorkflowContext {
  patientInput: string;
  triageResult?: string;
  diagnosisResult?: string;
  medicationResult?: string;
  lifestyleResult?: string;
  finalReport?: string;
  urgencyLevel?: string;
  variables: Map<string, any>;
  history: string[];
}

export class MedicalWorkflow {
  private triageAgent: TriageAgent;
  private diagnosisAgent: DiagnosisAgent;
  private medicationAgent: MedicationAgent;
  private lifestyleAgent: LifestyleAgent;
  private coordinatorAgent: MedicalCoordinatorAgent;
  private retriever?: Retriever;
  private enableParallelExecution: boolean;

  constructor(config?: MedicalWorkflowConfig) {
    this.retriever = config?.retriever;
    this.enableParallelExecution = config?.enableParallelExecution ?? false;

    this.triageAgent = new TriageAgent({
      name: "triage_agent",
      role: "分诊专家",
      systemPrompt: "",
      temperature: 0.3,
    });

    this.diagnosisAgent = new DiagnosisAgent({
      name: "diagnosis_agent",
      role: "诊断专家",
      systemPrompt: "",
      retriever: config?.retriever,
      temperature: 0.3,
    });

    this.medicationAgent = new MedicationAgent({
      name: "medication_agent",
      role: "用药专家",
      systemPrompt: "",
      retriever: config?.retriever,
      temperature: 0.3,
    });

    this.lifestyleAgent = new LifestyleAgent({
      name: "lifestyle_agent",
      role: "健康管理专家",
      systemPrompt: "",
      temperature: 0.5,
    });

    this.coordinatorAgent = new MedicalCoordinatorAgent({
      name: "coordinator_agent",
      role: "医疗协调者",
      systemPrompt: "",
      temperature: 0.5,
    });
  }

  async execute(patientInput: string): Promise<MedicalWorkflowContext> {
    const context: MedicalWorkflowContext = {
      patientInput,
      variables: new Map(),
      history: [],
    };

    console.log("\n=== 多智能体医疗系统启动 ===");

    console.log("\n[步骤 1] 分诊评估...");
    context.triageResult = await this.triageAgent.execute(patientInput);
    context.history.push(`分诊: ${context.triageResult}`);

    console.log("[步骤 2] 诊断分析...");
    context.diagnosisResult = await this.diagnosisAgent.execute(patientInput, {
      triageResult: context.triageResult,
    });
    context.history.push(`诊断: ${context.diagnosisResult}`);

    if (this.enableParallelExecution) {
      console.log("[步骤 3] 并行执行：用药建议 + 健康管理...");
      const [medicationResult, lifestyleResult] = await Promise.all([
        this.medicationAgent.execute(patientInput, {
          diagnosisResult: context.diagnosisResult,
        }),
        this.lifestyleAgent.execute(patientInput, {
          diagnosisResult: context.diagnosisResult,
        }),
      ]);
      context.medicationResult = medicationResult;
      context.lifestyleResult = lifestyleResult;
    } else {
      console.log("[步骤 3] 用药建议...");
      context.medicationResult = await this.medicationAgent.execute(patientInput, {
        diagnosisResult: context.diagnosisResult,
      });
      context.history.push(`用药: ${context.medicationResult}`);

      console.log("[步骤 4] 健康管理建议...");
      context.lifestyleResult = await this.lifestyleAgent.execute(patientInput, {
        diagnosisResult: context.diagnosisResult,
        medicationResult: context.medicationResult,
      });
    }
    context.history.push(`用药: ${context.medicationResult}`);
    context.history.push(`健康管理: ${context.lifestyleResult}`);

    console.log("[步骤 5] 生成综合报告...");
    context.finalReport = await this.coordinatorAgent.execute(patientInput, {
      triageResult: context.triageResult,
      diagnosisResult: context.diagnosisResult,
      medicationResult: context.medicationResult,
      lifestyleResult: context.lifestyleResult,
    });

    console.log("\n=== 多智能体医疗系统完成 ===\n");

    return context;
  }

  getAgents(): Record<string, BaseAgent> {
    return {
      triage_agent: this.triageAgent,
      diagnosis_agent: this.diagnosisAgent,
      medication_agent: this.medicationAgent,
      lifestyle_agent: this.lifestyleAgent,
      coordinator_agent: this.coordinatorAgent,
    };
  }
}
