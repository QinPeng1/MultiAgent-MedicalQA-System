# 多智能体医疗问答系统

基于 MiMo 模型的多智能体医疗问答系统，支持 RAG 和 MCP 协议。

## 系统架构

```
患者咨询
    ↓
┌─────────────────────────────────────────┐
│         Medical Workflow Engine         │
├─────────────────────────────────────────┤
│  ┌───────────┐  ┌──────────────┐       │
│  │ Triage    │→ │ Diagnosis    │       │
│  │ Agent     │  │ Agent        │       │
│  └───────────┘  └──────────────┘       │
│                        ↓                │
│              ┌─────────┴─────────┐      │
│              ↓                   ↓      │
│      ┌──────────────┐  ┌───────────┐   │
│      │ Medication   │  │ Lifestyle │   │
│      │ Agent        │  │ Agent     │   │
│      └──────────────┘  └───────────┘   │
│              ↓                   ↓      │
│              └─────────┬─────────┘      │
│                        ↓                │
│              ┌──────────────┐           │
│              │ Coordinator  │           │
│              │ Agent        │           │
│              └──────────────┘           │
└─────────────────────────────────────────┘
    ↓
综合医疗报告
```

## 智能体角色

| 智能体 | 职责 |
|--------|------|
| **TriageAgent** | 分诊评估，判断紧急程度，推荐科室 |
| **DiagnosisAgent** | 根据症状进行诊断分析，提供鉴别诊断 |
| **MedicationAgent** | 用药建议，包括剂量、副作用、相互作用 |
| **LifestyleAgent** | 健康管理，饮食、运动、生活习惯建议 |
| **CoordinatorAgent** | 综合各智能体意见，生成完整报告 |

## 工作流程

1. **患者描述症状**
2. **分诊评估** - 判断紧急程度，推荐就诊科室
3. **诊断分析** - 分析可能疾病，建议检查项目
4. **用药建议** - 推荐药物，说明用法用量和注意事项
5. **健康管理** - 饮食、运动、生活方式建议
6. **综合报告** - 整合所有信息生成完整报告

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入 MIMO_API_KEY
```

### 3. 运行示例

```bash
# 运行预设示例
npm run dev

# 运行 example.ts
npm run example
```

### 4. 交互模式

```bash
npm run dev -- --interactive
```

## 项目结构

```
agent-/
├── src/
│   ├── config.ts                 # 全局配置
│   ├── index.ts                  # 主入口
│   ├── models/
│   │   └── mimo.ts               # MiMo 模型封装
│   ├── rag/                      # RAG 模块
│   │   ├── vector-store.ts       # 向量数据库
│   │   ├── document-processor.ts # 文档处理
│   │   └── retriever.ts          # 检索器
│   ├── mcp/                      # MCP 模块
│   │   ├── server.ts             # MCP 服务器
│   │   └── tools.ts              # 工具注册
│   ├── agents/                   # 智能体模块
│   │   ├── base.ts               # 基础智能体
│   │   ├── triage-agent.ts       # 分诊智能体
│   │   ├── diagnosis-agent.ts    # 诊断智能体
│   │   ├── medication-agent.ts   # 用药智能体
│   │   ├── lifestyle-agent.ts    # 健康管理智能体
│   │   └── coordinator-agent.ts  # 协调智能体
│   └── workflow/                 # 工作流模块
│       ├── medical-workflow.ts   # 医疗工作流
│       └── engine.ts             # 通用工作流引擎
├── example.ts                    # 示例脚本
├── package.json
└── .env.example                  # 环境变量模板
```

## 可选：启动 ChromaDB

如果需要启用 RAG 知识库功能：

```bash
# 安装 Chroma
pip install chromadb

# 启动 ChromaDB
chroma run --path ./chroma_db
```

## 技术栈

- **MiMo Model** - 大语言模型
- **LangChain** - LLM 应用框架
- **ChromaDB** - 向量数据库
- **MCP** - Model Context Protocol

## 免责声明

本系统仅供学习和参考使用，不能替代专业医生的诊断和治疗。如有健康问题，请咨询专业医疗机构。
