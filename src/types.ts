export type ViewType = 'home' | 'documents' | 'knowledge' | 'graph' | 'testing';

export type ThemeType = 'aurora' | 'spruce' | 'amber';
export type ModeType = 'dark' | 'light';
export type NavLayout = 'full' | 'compact';

export type DocCategory = string;

export interface DocCategoryConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  isDefault?: boolean;
}

export interface ProjectDocument {
  id: string;
  title: string;
  path: string;
  category: string;
  version: string;
  owner: string;
  updated: string;
  summary: string;
  relationsCount: number;
  testCoverageCount: number;
  riskCount: number;
  modulesCount: number;
  tags: string[];
  aiParsedStatus: 'completed' | 'parsing' | 'ready';
  sections: {
    heading: string;
    content: string;
    codeSnippet?: string;
    safetyLevel?: 'critical' | 'warning' | 'info';
  }[];
}

export interface GraphNode {
  id: string;
  name: string;
  category: 'core' | 'flow' | 'protocol' | 'risk' | 'test' | 'defect';
  level: number;
  x: number;
  y: number;
  z: number;
  relations: number;
  testCount: number;
  riskText: string;
  changeInfo: string;
  description: string;
}

export interface ChatCitation {
  id: string;
  title: string;
  section: string;
  relevance: number;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  structuredAnswer?: {
    summary: string;
    steps: string[];
    safetyConstraint?: string;
    citations: ChatCitation[];
    confidence: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
  category?: string;
}

export interface TestCaseItem {
  id: string;
  name: string;
  priority: 'P0' | 'P1' | 'P2';
  type: '功能测试' | '异常注入' | '通信容错' | '安全联锁' | '性能边界';
  precondition: string;
  steps: string[];
  expectedResult: string;
  traceability: string;
}

export interface TestDraft {
  title: string;
  version: string;
  status: string;
  scope: string;
  objective: string;
  scopeList: string[];
  testPoints: string[];
  cases: TestCaseItem[];
  citations: string[];
}

export type AiProviderType = string;

export interface AiModelPreset {
  id: string;
  name: string;
  badge: string;
  desc: string;
  contextWindow?: string;
  defaultEndpoint: string;
  strengths?: string[];
  isCustom?: boolean;
}

export interface AiConfig {
  provider: AiProviderType;
  modelName: string;
  endpointUrl: string;
  temperature: number;
  topK: number;
  hybridSearchWeight: number; // 0.0 ~ 1.0 (语义权重)
  systemPrompt: string;
  strictSafetyAudit: boolean;
  enableChainOfThought: boolean;
  tokenContextLimit: number;
}

export interface ProjectItem {
  id: string;
  name: string;
  code: string;
  version: string;
  description: string;
  category: string;
  standard: string;
  updatedAt: string;
  documents: ProjectDocument[];
  selectedDocId: string;
  sessions: ChatSession[];
  currentSessionId: string;
  graphNodes?: GraphNode[];
  graphEdges?: [number, number][];
  testDraft?: TestDraft;
}

