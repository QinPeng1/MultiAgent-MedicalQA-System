import { config } from "./config.js";
import { VectorStore, DocumentProcessor, Retriever } from "./rag/index.js";
import {
  TriageAgent,
  DiagnosisAgent,
  MedicationAgent,
  LifestyleAgent,
  MedicalCoordinatorAgent,
} from "./agents/index.js";
import { MedicalWorkflow, type MedicalWorkflowContext } from "./workflow/index.js";
import { MCPServer } from "./mcp/index.js";

async function initializeMedicalRAG(): Promise<Retriever | undefined> {
  try {
    const vectorStore = new VectorStore({
      collectionName: "medical_knowledge",
      chromaUrl: config.chromaDbPath,
    });

    const retriever = new Retriever(vectorStore, {
      topK: 5,
      scoreThreshold: 0.7,
    });

    return retriever;
  } catch (error) {
    console.log("RAG 模块未启用（需要 ChromaDB 服务）");
    return undefined;
  }
}

function formatWorkflowResult(context: MedicalWorkflowContext): string {
  let output = "\n" + "=".repeat(60) + "\n";
  output += "           多智能体医疗系统 - 综合报告\n";
  output += "=".repeat(60) + "\n\n";

  output += "【患者主诉】\n";
  output += `${context.patientInput}\n\n`;

  output += "---\n\n";

  output += "【分诊评估】\n";
  output += `${context.triageResult}\n\n`;

  output += "---\n\n";

  output += "【诊断分析】\n";
  output += `${context.diagnosisResult}\n\n`;

  output += "---\n\n";

  output += "【用药建议】\n";
  output += `${context.medicationResult}\n\n`;

  output += "---\n\n";

  output += "【健康管理】\n";
  output += `${context.lifestyleResult}\n\n`;

  output += "=".repeat(60) + "\n";
  output += "【综合报告】\n";
  output += "=".repeat(60) + "\n\n";
  output += `${context.finalReport}\n\n`;

  output += "=".repeat(60) + "\n";
  output += "免责声明：本报告仅供参考，不能替代专业医生的诊断和治疗。\n";
  output += "如有不适，请及时就医。\n";
  output += "=".repeat(60) + "\n";

  return output;
}

async function runMedicalExample() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          多智能体医疗问答系统 (Multi-Agent)            ║");
  console.log("║                  Powered by MiMo Model                  ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const retriever = await initializeMedicalRAG();

  const workflow = new MedicalWorkflow({
    retriever: retriever || undefined,
    enableParallelExecution: true,
  });

  console.log("已加载智能体:", Object.keys(workflow.getAgents()).join(", "));

  const patientInput = "我最近一周经常头痛，主要集中在后脑勺，伴有轻微的恶心感，睡眠不太好，工作压力比较大。";
  console.log(`\n【患者咨询】\n${patientInput}`);

  try {
    const result = await workflow.execute(patientInput);
    console.log(formatWorkflowResult(result));
  } catch (error: any) {
    console.error("执行失败:", error.message);
  }
}

async function runInteractiveMode() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          多智能体医疗问答系统 - 交互模式               ║");
  console.log("║          输入 'quit' 退出系统                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  const retriever = await initializeMedicalRAG();
  const workflow = new MedicalWorkflow({
    retriever: retriever || undefined,
    enableParallelExecution: true,
  });

  const readline = await import("readline");
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = (): void => {
    rl.question("\n请描述您的症状（输入 'quit' 退出）：\n> ", async (input) => {
      if (input.toLowerCase() === "quit") {
        console.log("感谢您的使用，祝您健康！");
        rl.close();
        return;
      }

      if (!input.trim()) {
        askQuestion();
        return;
      }

      try {
        const result = await workflow.execute(input);
        console.log(formatWorkflowResult(result));
      } catch (error: any) {
        console.error("执行失败:", error.message);
      }

      askQuestion();
    });
  };

  askQuestion();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes("--interactive") || args.includes("-i")) {
    runInteractiveMode().catch(console.error);
  } else {
    runMedicalExample().catch(console.error);
  }
}

export {
  config,
  VectorStore,
  DocumentProcessor,
  Retriever,
  TriageAgent,
  DiagnosisAgent,
  MedicationAgent,
  LifestyleAgent,
  MedicalCoordinatorAgent,
  MedicalWorkflow,
  MCPServer,
};
