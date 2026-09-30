import React, { useState, useEffect } from 'react';
import { ViewType, ThemeType, ModeType, NavLayout, ProjectDocument, AiConfig, ChatSession, AiModelPreset, ProjectItem, DocCategoryConfig } from './types';
import { INITIAL_PROJECTS } from './data/mockProjects';
import { DEFAULT_AI_CONFIG, AI_MODEL_PRESETS } from './data/aiPresets';
import { INITIAL_CHAT_SESSIONS } from './data/mockSessions';
import { INITIAL_DOCUMENTS, INITIAL_GRAPH_NODES, INITIAL_TEST_DRAFT } from './data/mockData';
import { DEFAULT_DOC_CATEGORIES } from './data/mockCategories';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { DocumentsView } from './components/DocumentsView';
import { KnowledgeView } from './components/KnowledgeView';
import { GraphView } from './components/GraphView';
import { TestingView } from './components/TestingView';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ImportModal } from './components/ImportModal';
import { SettingsModal, SettingsTab } from './components/SettingsModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [theme, setTheme] = useState<ThemeType>('aurora');
  const [mode, setMode] = useState<ModeType>('dark');
  const [navLayout, setNavLayout] = useState<NavLayout>('compact');

  // Multi-Project Isolation State
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);

  // Dynamic Controlled Document Categories
  const [docCategories, setDocCategories] = useState<DocCategoryConfig[]>(DEFAULT_DOC_CATEGORIES);

  // Active Project Reference
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECTS[0];

  // Scoped project state derived from activeProject
  const documents = activeProject.documents || [];
  const selectedDocId = activeProject.selectedDocId || (documents[0]?.id ?? '');
  const sessions = activeProject.sessions || [];
  const currentSessionId = activeProject.currentSessionId || (sessions[0]?.id ?? '');
  const graphNodes = activeProject.graphNodes || INITIAL_GRAPH_NODES;
  const graphEdges = activeProject.graphEdges;
  const testDraft = activeProject.testDraft || INITIAL_TEST_DRAFT;

  const [knowledgeInitialPrompt, setKnowledgeInitialPrompt] = useState<string>('');
  const [testingInitialScope, setTestingInitialScope] = useState<string>('');
  const [graphHighlightNode, setGraphHighlightNode] = useState<string>('');

  // Manageable AI Model Base List
  const [models, setModels] = useState<AiModelPreset[]>(AI_MODEL_PRESETS);
  const [aiConfig, setAiConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<SettingsTab>('projects');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isImportOpen, setIsImportOpen] = useState<boolean>(false);

  // Project Mutation Handlers
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
  };

  const handleCreateProject = (newProjData: Omit<ProjectItem, 'id'> & { id?: string }) => {
    const newId = newProjData.id || `proj-${Date.now()}`;
    const code = newProjData.code || 'CUSTOM-01';

    // Create a new isolated project
    const newProject: ProjectItem = {
      ...newProjData,
      id: newId,
      updatedAt: '刚刚创建',
      documents: newProjData.documents && newProjData.documents.length > 0 ? newProjData.documents : [
        {
          id: `doc-${newId}-srs`,
          title: `${newProjData.name} 软件需求规格说明书`,
          path: `01 受控规范 / ${newProjData.name} SRS`,
          category: '需求',
          version: newProjData.version || 'V1.0',
          owner: '系统责任工程师',
          updated: '刚刚',
          summary: `规范并定义 ${newProjData.name} (${code}) 的软硬件接口、状态机机联锁与临床安全防护边界。`,
          relationsCount: 18,
          testCoverageCount: 45,
          riskCount: 4,
          modulesCount: 3,
          tags: ['受控工程', newProjData.standard || 'IEC 62304', '已就绪'],
          aiParsedStatus: 'completed',
          sections: [
            {
              heading: '1. 仪器定义与安全设计原则',
              content: `${newProjData.name} 作为受控体外诊断/医疗软件系统，遵循 ${newProjData.standard || 'IEC 62304'} 合规标准。任何异常断电、仓门联锁失效或采样超时均需在30ms内触发降级自保护状态。`
            },
            {
              heading: '2. 业务功能与状态机定义',
              content: `状态机分为：INIT(自检)、STANDBY(待机就绪)、MEASURING(分析中)、MAINTAIN(维护清洗)与ERROR(安全闭锁)。各状态转换必须有完备事件日志记录。`
            }
          ]
        }
      ],
      selectedDocId: `doc-${newId}-srs`,
      sessions: newProjData.sessions && newProjData.sessions.length > 0 ? newProjData.sessions : [
        {
          id: `session-${newId}-1`,
          title: `${newProjData.name} 初始受控问答`,
          category: '系统初始化',
          updatedAt: '刚刚',
          messages: [
            {
              id: `msg-welcome-${Date.now()}`,
              sender: 'assistant',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              text: `您好！受控工程项目「${newProjData.name} (${code})」已独立就绪。已为您加载独立的知识资产空间与测试用例集，请随时提出针对该工程的法规分析与测试设计需求。`
            }
          ]
        }
      ],
      currentSessionId: `session-${newId}-1`,
      graphNodes: newProjData.graphNodes || [
        {
          id: `${newId}-core`,
          name: `${newProjData.name} 控制中枢`,
          category: 'core',
          level: 0,
          x: 0,
          y: 0,
          z: 0,
          relations: 16,
          testCount: 28,
          riskText: '核心业务',
          changeInfo: '新建项目基线',
          description: `${newProjData.name} 核心调度与联锁状态机管理中枢。`
        },
        {
          id: `${newId}-safeguard`,
          name: '安全光栅与应急降级',
          category: 'risk',
          level: 1,
          x: 90,
          y: 60,
          z: 40,
          relations: 8,
          testCount: 20,
          riskText: '高危互锁',
          changeInfo: 'IEC 62304 Class B 强制',
          description: '物理开门断电、气压跌落瞬时安全降级保护。'
        },
        {
          id: `${newId}-comm`,
          name: '上位机双工数据通信',
          category: 'protocol',
          level: 1,
          x: -80,
          y: 50,
          z: -30,
          relations: 10,
          testCount: 15,
          riskText: '通信可靠性',
          changeInfo: 'CRC校验机制',
          description: '与仪器下位机及LIS系统进行实时受控通信。'
        }
      ],
      graphEdges: newProjData.graphEdges || [[0, 1], [0, 2]],
      testDraft: newProjData.testDraft || {
        title: `${newProjData.name} 全流程综合验证集`,
        version: 'AI-Draft V1.0',
        status: '草稿 (待设计)',
        scope: `${newProjData.name} (${code}) 核心链路与合规验证`,
        objective: `依据 ${newProjData.standard}，对系统开机自检、应急中断与结果上报进行全覆盖验证。`,
        scopeList: [
          '开机自检与双工通信链路验证',
          '异常状态机跳变与应急降级响应',
          '检验报告结果精度与合规审计日志'
        ],
        testPoints: [
          '【TP-01】系统正常初始化自检流程',
          '【TP-02】硬件联锁失效自保护响应',
          '【TP-03】通信中断重连后的状态机恢复'
        ],
        cases: [
          {
            id: `TC-${code}-01`,
            name: `${newProjData.name} 开机双通道自检与安全互锁就绪`,
            priority: 'P0',
            type: '功能测试',
            precondition: '设备供电稳定，上位机与下位机处于初次握手态。',
            steps: [
              '1. 上位机下发系统初始化指令 INIT_BOOT；',
              '2. 检查传感器自检报告与光栅电压状态；',
              '3. 确认系统在800ms内迁入 STANDBY 待命态。'
            ],
            expectedResult: '自检结果返回正常，状态码显示 READY，UI呈现待机绿色指示灯。',
            traceability: `${newProjData.name} SRS §1.0`
          },
          {
            id: `TC-${code}-02`,
            name: `${newProjData.name} 运行中物理中断防溢出与急停断电`,
            priority: 'P0',
            type: '安全联锁',
            precondition: '系统处于测量分析状态，采样针正在进行吸样操作。',
            steps: [
              '1. 模拟触发前仓门微动开关开启事件；',
              '2. 观察驱动泵与采样机械臂控制信号；',
              '3. 检查系统告警日志与报警音提示。'
            ],
            expectedResult: '系统在30ms内切断进样针高压驱动，产生 Critical 告警并锁定机构。',
            traceability: `${newProjData.name} SRS §2.0`
          }
        ],
        citations: [`${newProjData.name} 软件需求规格说明书`, `${newProjData.standard || 'IEC 62304'}`]
      }
    };

    setProjects((prev) => [newProject, ...prev]);
    setActiveProjectId(newId);
  };

  const handleUpdateProject = (updatedProject: ProjectItem) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleDeleteProject = (projectId: string) => {
    if (projects.length <= 1) return;
    const remaining = projects.filter((p) => p.id !== projectId);
    setProjects(remaining);
    if (activeProjectId === projectId) {
      setActiveProjectId(remaining[0].id);
    }
  };

  // Scoped Document Handlers for Active Project
  const handleSelectDoc = (docId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, selectedDocId: docId } : p))
    );
  };

  const handleSetDocuments = (
    newDocsOrUpdater: ProjectDocument[] | ((prev: ProjectDocument[]) => ProjectDocument[])
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          const resolved =
            typeof newDocsOrUpdater === 'function' ? newDocsOrUpdater(p.documents) : newDocsOrUpdater;
          return { ...p, documents: resolved };
        }
        return p;
      })
    );
  };

  const handleUpdateDocument = (updatedDoc: ProjectDocument) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const nextDocs = (p.documents || []).map((doc) =>
          doc.id === updatedDoc.id ? updatedDoc : doc
        );
        return {
          ...p,
          documents: nextDocs,
          updatedAt: '刚刚'
        };
      })
    );
  };

  const handleRenameCategoryInDocs = (oldName: string, newName: string) => {
    setProjects((prev) =>
      prev.map((proj) => ({
        ...proj,
        documents: (proj.documents || []).map((d) =>
          d.category === oldName ? { ...d, category: newName } : d
        )
      }))
    );
  };

  const handleReassignDocsCategory = (fromCategory: string, toCategory: string) => {
    setProjects((prev) =>
      prev.map((proj) => ({
        ...proj,
        documents: (proj.documents || []).map((d) =>
          d.category === fromCategory ? { ...d, category: toCategory } : d
        )
      }))
    );
  };

  // Scoped Session Handlers for Active Project
  const handleSetSessions = (
    newSessionsOrUpdater: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])
  ) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          const resolved =
            typeof newSessionsOrUpdater === 'function'
              ? newSessionsOrUpdater(p.sessions)
              : newSessionsOrUpdater;
          return { ...p, sessions: resolved };
        }
        return p;
      })
    );
  };

  const handleSetCurrentSessionId = (sessionId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, currentSessionId: sessionId } : p))
    );
  };

  // Clear chat sessions for active project
  const handleClearAllChatSessions = () => {
    const freshSessionId = `session-${Date.now()}`;
    const freshSession: ChatSession = {
      id: freshSessionId,
      title: `${activeProject.name} 新问答会话`,
      category: '通用问答',
      updatedAt: '刚刚',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `您好！已清空「${activeProject.name}」的历史问答记录。当前正连接 ${aiConfig.modelName.split(' ')[0]} 推理基座，请随时提问本项目受控工程问题。`
        }
      ]
    };
    handleSetSessions([freshSession]);
    handleSetCurrentSessionId(freshSessionId);
  };

  // Restore predefined sample sessions for active project
  const handleResetSampleSessions = () => {
    handleSetSessions(INITIAL_CHAT_SESSIONS);
    handleSetCurrentSessionId(INITIAL_CHAT_SESSIONS[0].id);
  };

  // Apply dark class and theme class to document body for global consistency
  useEffect(() => {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [mode]);

  // Global shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Handlers for cross-view workflows
  const handleSendPromptToKnowledge = (prompt: string) => {
    setKnowledgeInitialPrompt(prompt);
    setCurrentView('knowledge');
  };

  const handleAskKnowledgeAboutDoc = (doc: ProjectDocument) => {
    setKnowledgeInitialPrompt(`请解读《${doc.title} ${doc.version}》的核心验收指标，以及对自动化测试设计的约束。`);
    setCurrentView('knowledge');
  };

  const handleGenerateTestForDoc = (doc: ProjectDocument) => {
    setKnowledgeInitialPrompt(`请基于受控资产《${doc.title} ${doc.version}》规划核心测试关注点与潜在风险联锁。`);
    setCurrentView('knowledge');
  };

  const handleGenerateTestForNode = (nodeName: string) => {
    setKnowledgeInitialPrompt(`请分析业务节点【${nodeName}】的软硬件联锁边界与故障注入测试设计。`);
    setCurrentView('knowledge');
  };

  const handleConvertAnswerToTest = (answerText: string) => {
    setKnowledgeInitialPrompt(`请将以上分析推导为核心验收测试关注项：${answerText.slice(0, 80)}...`);
    setCurrentView('knowledge');
  };

  const handleNavigateToGraphNode = (nodeName: string) => {
    setGraphHighlightNode(nodeName);
    setCurrentView('graph');
  };

  const themeThemeClass =
    theme === 'spruce'
      ? 'selection:bg-emerald-500 selection:text-white'
      : theme === 'amber'
      ? 'selection:bg-amber-500 selection:text-white'
      : 'selection:bg-indigo-500 selection:text-white';

  return (
    <div
      id="qflow-app-container"
      className={`min-h-screen w-full flex ${
        mode === 'dark' ? 'dark bg-[#0b0f17] text-slate-100' : 'bg-slate-100 text-slate-950'
      } ${themeThemeClass} font-sans antialiased overflow-hidden`}
    >
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        theme={theme}
        mode={mode}
        navLayout={navLayout}
        onToggleNavLayout={() => setNavLayout(navLayout === 'full' ? 'compact' : 'full')}
        onOpenSettings={(tab) => {
          const validTabs: SettingsTab[] = ['projects', 'categories', 'model', 'appearance', 'data'];
          const targetTab = (typeof tab === 'string' && validTabs.includes(tab as SettingsTab))
            ? (tab as SettingsTab)
            : 'projects';
          setSettingsDefaultTab(targetTab);
          setIsSettingsOpen(true);
        }}
        onToggleMode={() => setMode(mode === 'dark' ? 'light' : 'dark')}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        aiModelName={aiConfig.modelName}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* View Workspace */}
        <main
          className={`flex-1 min-w-0 min-h-0 ${
            currentView === 'home'
              ? 'overflow-y-auto p-3 sm:p-5 lg:p-6 flex flex-col'
              : 'overflow-hidden p-2 sm:p-3.5 lg:p-4 flex flex-col'
          }`}
        >
          {currentView === 'home' && (
            <HomeView
              onNavigate={(v) => setCurrentView(v)}
              theme={theme}
              mode={mode}
              onSendPromptToKnowledge={handleSendPromptToKnowledge}
              onQuickGenerateTestForScope={(scope) => {
                setKnowledgeInitialPrompt(`请针对【${scope}】展开全面测试与风险验收分析。`);
                setCurrentView('knowledge');
              }}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={documents}
              selectedDocId={selectedDocId}
              onSelectDoc={handleSelectDoc}
              onAskKnowledgeAboutDoc={handleAskKnowledgeAboutDoc}
              onGenerateTestForDoc={handleGenerateTestForDoc}
              onNavigateToGraphNode={handleNavigateToGraphNode}
              onOpenImport={() => setIsImportOpen(true)}
              onOpenCategorySettings={() => {
                setSettingsDefaultTab('categories');
                setIsSettingsOpen(true);
              }}
              onUpdateDocument={handleUpdateDocument}
              categories={docCategories}
              projectName={activeProject.name}
              theme={theme}
              mode={mode}
            />
          )}

          {currentView === 'knowledge' && (
            <KnowledgeView
              onNavigate={(v) => setCurrentView(v)}
              onConvertAnswerToTest={handleConvertAnswerToTest}
              initialQuery={knowledgeInitialPrompt}
              theme={theme}
              mode={mode}
              aiConfig={aiConfig}
              sessions={sessions}
              setSessions={handleSetSessions}
              currentSessionId={currentSessionId}
              setCurrentSessionId={handleSetCurrentSessionId}
              onOpenAiConfig={() => {
                setSettingsDefaultTab('model');
                setIsSettingsOpen(true);
              }}
            />
          )}

          {currentView === 'graph' && (
            <GraphView
              onGenerateTestForNode={handleGenerateTestForNode}
              theme={theme}
              mode={mode}
              highlightNodeName={graphHighlightNode}
              nodes={graphNodes}
              edges={graphEdges}
            />
          )}

          {currentView === 'testing' && (
            <TestingView
              initialScope={testingInitialScope}
              theme={theme}
              mode={mode}
              testDraft={testDraft}
              projectName={activeProject.name}
            />
          )}
        </main>
      </div>

      {/* Global Settings Modal (Includes Project Management, Model Base Switcher & Management, Controlled Category Management, Appearance & Data) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsDefaultTab}
        config={aiConfig}
        onSaveConfig={(newConfig) => setAiConfig(newConfig)}
        theme={theme}
        onSelectTheme={(t) => setTheme(t)}
        mode={mode}
        onSelectMode={(m) => setMode(m)}
        navLayout={navLayout}
        onSelectNavLayout={(l) => setNavLayout(l)}
        sessions={sessions}
        onClearAllChatSessions={handleClearAllChatSessions}
        onResetSampleSessions={handleResetSampleSessions}
        models={models}
        onSaveModels={(newModels) => setModels(newModels)}
        onResetDefaultModels={() => setModels(AI_MODEL_PRESETS)}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onUpdateProject={handleUpdateProject}
        onDeleteProject={handleDeleteProject}
        onCreateProject={handleCreateProject}
        categories={docCategories}
        onSaveCategories={(newCats) => setDocCategories(newCats)}
        onResetDefaultCategories={() => setDocCategories(DEFAULT_DOC_CATEGORIES)}
        onRenameCategoryInDocs={handleRenameCategoryInDocs}
        onReassignDocsCategory={handleReassignDocsCategory}
      />

      {/* Global Command Palette / Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        documents={documents}
        onNavigate={(v) => setCurrentView(v)}
        onSelectDoc={handleSelectDoc}
        onSelectGraphNode={(name) => handleNavigateToGraphNode(name)}
        mode={mode}
      />

      {/* Import Document Modal */}
      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(newDoc) => {
          handleSetDocuments((prev) => [newDoc, ...prev]);
          handleSelectDoc(newDoc.id);
          setCurrentView('documents');
        }}
        theme={theme}
        mode={mode}
      />
    </div>
  );
}
