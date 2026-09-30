import { AiConfig, AiModelPreset } from '../types';

export type { AiModelPreset };

export const AI_MODEL_PRESETS: AiModelPreset[] = [
  {
    id: 'private_medllm',
    name: 'QFlow-MedLLM 32B (医疗私有化受控基座)',
    badge: '私有受控 · 推荐',
    desc: '本地私有化隔离部署，针对 IEC 62304 医疗器械与体外诊断规范专属微调，数据 100% 物理驻留。',
    contextWindow: '64K Tokens',
    defaultEndpoint: 'https://ai-gateway.internal.med/v1/models/qflow-medllm-32b',
    strengths: ['医疗合规条款严格对齐', '零外部网络泄露', 'ISO 14971 安全联锁增强']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek-R1 (复杂逻辑与状态机深度推理)',
    badge: '深度思考 · 强推理',
    desc: '擅长多层级嵌套协议、状态机跃迁边界及复杂的软硬件故障树反向溯源。',
    contextWindow: '128K Tokens',
    defaultEndpoint: 'https://ai-gateway.internal.med/v1/models/deepseek-r1',
    strengths: ['状态机与时序逻辑', '深层推导思考链', '复杂边界条件穷举']
  },
  {
    id: 'gemini',
    name: 'Gemini 2.5 Pro (超长上下文全景基座)',
    badge: '200万超大窗口',
    desc: '支持同时装载整机全套需求、通信协议和历史两万条缺陷数据进行跨模块全域分析。',
    contextWindow: '2000K Tokens',
    defaultEndpoint: 'https://ai-gateway.internal.med/v1/models/gemini-2.5-pro',
    strengths: ['跨全卷工程文档扫描', '超长上下文关联', '架构级全局影响分析']
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet (工程编码与严谨分析)',
    badge: '高精度工程架构',
    desc: '在自动化测试脚本生成、代码级单元测试与微服务接口规约比对上具备极高精度。',
    contextWindow: '200K Tokens',
    defaultEndpoint: 'https://ai-gateway.internal.med/v1/models/claude-3-5-sonnet',
    strengths: ['高精度四段论用例编写', '自动化脚本生成', '语法逻辑零歧义']
  },
  {
    id: 'gpt4o',
    name: 'GPT-4o (通用高精度多语言基座)',
    badge: '综合性能',
    desc: '综合语言理解力强，适合国际化多语言规范（FDA 510(k)、CE-IVDR）交叉对齐。',
    contextWindow: '128K Tokens',
    defaultEndpoint: 'https://ai-gateway.internal.med/v1/models/gpt-4o',
    strengths: ['跨国法规标准对齐', '自然语言多轮交互', '文档标准化润色']
  }
];

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'private_medllm',
  modelName: 'QFlow-MedLLM 32B (医疗私有化受控基座)',
  endpointUrl: 'https://ai-gateway.internal.med/v1/models/qflow-medllm-32b',
  temperature: 0.2,
  topK: 5,
  hybridSearchWeight: 0.75,
  systemPrompt:
    '你被部署为 QFlow 医疗与工业测试全流程管控平台的“受控知识推理引擎”。你必须严格基于系统已索引的项目受控规范（SRS、通信规约、风险报告等）进行严谨的事实推导。任何涉及机械动作、液体加注、断电断网的推论，必须强制输出 ISO 14971 安全约束警示，绝不产生虚构条款。',
  strictSafetyAudit: true,
  enableChainOfThought: true,
  tokenContextLimit: 64
};
