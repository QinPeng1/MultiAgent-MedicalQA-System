import { VectorStore, DocumentProcessor, Retriever } from "./src/rag/index.js";
import {
  TriageAgent,
  DiagnosisAgent,
  MedicationAgent,
  LifestyleAgent,
  MedicalCoordinatorAgent,
} from "./src/agents/index.js";
import { MedicalWorkflow } from "./src/workflow/index.js";

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║         多智能体医疗问答系统 - 示例演示                  ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // 尝试初始化医疗知识库
  let medicalRetriever: Retriever | undefined;
  try {
    const vectorStore = new VectorStore({
      collectionName: "medical_examples",
      chromaUrl: "./chroma_db",
    });

    medicalRetriever = new Retriever(vectorStore, {
      topK: 5,
      scoreThreshold: 0.7,
    });

    console.log("✓ 医疗知识库已加载");
  } catch (error) {
    console.log("⚠ 医疗知识库未加载（ChromaDB 未运行）");
  }

  const workflow = new MedicalWorkflow({
    retriever: medicalRetriever,
    enableParallelExecution: true,
  });

  console.log("✓ 已初始化医疗工作流");
  console.log("✓ 加载的智能体:", Object.keys(workflow.getAgents()).join(", "));

  // 测试案例 1
  console.log("\n" + "=".repeat(60));
  console.log("测试案例 1：头痛症状分析");
  console.log("=".repeat(60));

  const patientInput1 = "我最近一周经常头痛，主要集中在后脑勺，伴有轻微的恶心感，睡眠不太好，工作压力比较大。";
  console.log(`\n【患者主诉】\n${patientInput1}`);

  try {
    const result1 = await workflow.execute(patientInput1);
    console.log(`\n【分诊结果】\n${result1.triageResult}`);
    console.log(`\n【诊断分析】\n${result1.diagnosisResult}`);
    console.log(`\n【用药建议】\n${result1.medicationResult}`);
    console.log(`\n【健康管理】\n${result1.lifestyleResult}`);
    console.log(`\n【综合报告】\n${result1.finalReport}`);
  } catch (error) {
    console.error("执行失败:", error);
  }

  // 测试案例 2
  console.log("\n" + "=".repeat(60));
  console.log("测试案例 2：胸痛症状分析");
  console.log("=".repeat(60));

  const patientInput2 = "我今天早上突然感到胸口疼痛，像压了一块石头，伴有气短和出汗，持续了大约10分钟。";
  console.log(`\n【患者主诉】\n${patientInput2}`);

  try {
    const result2 = await workflow.execute(patientInput2);
    console.log(`\n【分诊结果】\n${result2.triageResult}`);
    console.log(`\n【诊断分析】\n${result2.diagnosisResult}`);
    console.log(`\n【用药建议】\n${result2.medicationResult}`);
    console.log(`\n【健康管理】\n${result2.lifestyleResult}`);
    console.log(`\n【综合报告】\n${result2.finalReport}`);
  } catch (error) {
    console.error("执行失败:", error);
  }

  console.log("\n" + "=".repeat(60));
  console.log("医疗咨询系统演示完成");
  console.log("=".repeat(60));
  console.log("\n⚠️  注意：以上建议仅供参考，不能替代专业医生的诊断和治疗。");
  console.log("如有不适，请及时就医。");
}

main().catch(console.error);
