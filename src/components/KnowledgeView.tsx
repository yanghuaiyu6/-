import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  ShieldAlert,
  Send,
  Wand2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Copy,
  BookOpen,
  Check,
  Cpu,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  History,
  Trash2,
  ChevronDown,
  Search,
  MessageSquare,
  Zap,
  Flame,
  EyeOff,
  X
} from 'lucide-react';
import { ChatMessage, ChatSession, ViewType, ThemeType, ModeType, AiConfig, ChatCitation } from '../types';
import { QA_KNOWLEDGE_BASE, findMatchingAnswer } from '../data/qaKnowledgeBase';
import { INITIAL_CHAT_SESSIONS } from '../data/mockSessions';

interface KnowledgeViewProps {
  onNavigate: (view: ViewType) => void;
  onConvertAnswerToTest: (answerText: string) => void;
  initialQuery?: string;
  theme: ThemeType;
  mode: ModeType;
  aiConfig: AiConfig;
  onOpenAiConfig: () => void;
  sessions?: ChatSession[];
  setSessions?: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentSessionId?: string;
  setCurrentSessionId?: (id: string) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  onNavigate,
  onConvertAnswerToTest,
  initialQuery,
  theme,
  mode,
  aiConfig,
  onOpenAiConfig,
  sessions: externalSessions,
  setSessions: externalSetSessions,
  currentSessionId: externalCurrentSessionId,
  setCurrentSessionId: externalSetCurrentSessionId
}) => {
  // Sessions Management State (uses external if provided, otherwise local)
  const [internalSessions, setInternalSessions] = useState<ChatSession[]>(INITIAL_CHAT_SESSIONS);
  const [internalCurrentSessionId, setInternalCurrentSessionId] = useState<string>(INITIAL_CHAT_SESSIONS[0].id);

  const sessions = externalSessions || internalSessions;
  const setSessions = externalSetSessions || setInternalSessions;
  const currentSessionId = externalCurrentSessionId || internalCurrentSessionId;
  const setCurrentSessionId = externalSetCurrentSessionId || setInternalCurrentSessionId;

  // Temporary / Ephemeral Chat State (Not recorded in history; destroyed upon adding new session or exiting)
  const [isTemporaryMode, setIsTemporaryMode] = useState<boolean>(false);
  const [temporarySession, setTemporarySession] = useState<ChatSession | null>(null);

  const [showHistoryRail, setShowHistoryRail] = useState<boolean>(false);
  const [showRightRail, setShowRightRail] = useState<boolean>(false);
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');

  // Active Session (Switches to temporarySession when in temporary mode)
  const activeSession: ChatSession = isTemporaryMode && temporarySession
    ? temporarySession
    : (sessions.find((s) => s.id === currentSessionId) || sessions[0]);

  const messages = activeSession?.messages || [];

  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});

  // Citation selection
  const lastAssistantMsg = [...messages].reverse().find((m) => m.sender === 'assistant');
  const [selectedCitation, setSelectedCitation] = useState<ChatCitation | null>(
    lastAssistantMsg?.structuredAnswer?.citations?.[0] || QA_KNOWLEDGE_BASE[0].citations[0]
  );

  // Synchronize with initialQuery if provided
  useEffect(() => {
    if (initialQuery && initialQuery !== messages[0]?.text) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Start Temporary Chat (Ephemeral, not recorded in persistent sessions)
  const handleStartTemporarySession = () => {
    const tempSessionId = `temp-${Date.now()}`;
    const tempSession: ChatSession = {
      id: tempSessionId,
      title: '⚡ 临时无痕问答',
      category: '临时问答',
      updatedAt: '进行中',
      messages: [
        {
          id: `msg-temp-welcome-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `【临时问答模式已开启】\n本次问答数据仅在当前内存中运行，不会存入任何历史记录列表中。\n当您添加新会话、切换到历史会话或点击「销毁」时，本会话内容将立即自动彻底销毁。\n已继承当前生效推理基座：${aiConfig.modelName.split(' ')[0]}。`
        }
      ]
    };
    setTemporarySession(tempSession);
    setIsTemporaryMode(true);
    setSelectedCitation(null);
  };

  // Exit & Destroy Temporary Chat
  const handleExitTemporarySession = () => {
    setTemporarySession(null);
    setIsTemporaryMode(false);
    const targetSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];
    const lastMsg = [...(targetSession?.messages || [])].reverse().find((m) => m.sender === 'assistant');
    if (lastMsg?.structuredAnswer?.citations?.[0]) {
      setSelectedCitation(lastMsg.structuredAnswer.citations[0]);
    } else {
      setSelectedCitation(QA_KNOWLEDGE_BASE[0].citations[0]);
    }
  };

  // Create New Session (Destroys temporary session if active, then creates regular session)
  const handleNewSession = () => {
    if (isTemporaryMode) {
      setTemporarySession(null);
      setIsTemporaryMode(false);
    }
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: '新问答会话',
      category: '通用问答',
      updatedAt: '刚刚',
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `您好！我是连接受控业务规范的知识问答引擎。已继承 ${aiConfig.modelName.split(' ')[0]} 基座。请在下方输入您的需求疑问或测试设计问题。`
        }
      ]
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
    setSelectedCitation(null);
  };

  // Switch Session (Destroys temporary session if active, then selects session)
  const handleSelectSession = (sessionId: string) => {
    if (isTemporaryMode) {
      setTemporarySession(null);
      setIsTemporaryMode(false);
    }
    setCurrentSessionId(sessionId);
    const targetSession = sessions.find((s) => s.id === sessionId);
    const lastMsg = [...(targetSession?.messages || [])].reverse().find((m) => m.sender === 'assistant');
    if (lastMsg?.structuredAnswer?.citations?.[0]) {
      setSelectedCitation(lastMsg.structuredAnswer.citations[0]);
    }
  };

  // Delete Session
  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleNewSession();
      return;
    }
    const updated = sessions.filter((s) => s.id !== sessionId);
    setSessions(updated);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(updated[0].id);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(historySearchTerm.toLowerCase())
  );

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text
    };

    if (isTemporaryMode) {
      // In temporary mode: only update temporarySession in memory
      setTemporarySession((prev) => {
        if (!prev) return null;
        const isDefaultTitle = prev.title === '⚡ 临时无痕问答';
        return {
          ...prev,
          title: isDefaultTitle ? (text.length > 18 ? `⚡ ${text.slice(0, 16)}...` : `⚡ ${text}`) : prev.title,
          messages: [...prev.messages, userMsg]
        };
      });
    } else {
      // Update persistent active session messages
      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === currentSessionId) {
            const isNewTitle = sess.title === '新问答会话';
            return {
              ...sess,
              title: isNewTitle ? (text.length > 18 ? text.slice(0, 18) + '...' : text) : sess.title,
              updatedAt: '刚刚',
              messages: [...sess.messages, userMsg]
            };
          }
          return sess;
        })
      );
    }

    setInputText('');
    setIsThinking(true);

    setTimeout(() => {
      setIsThinking(false);
      const matched = findMatchingAnswer(text);

      let aiMsg: ChatMessage;
      if (matched) {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `针对“${text}”，已从受控需求与规约中精确定位到业务逻辑与测试准则：`,
          structuredAnswer: {
            summary: matched.summary,
            steps: matched.steps,
            safetyConstraint: matched.safetyConstraint,
            citations: matched.citations,
            confidence: matched.confidence
          }
        };
        setSelectedCitation(matched.citations[0]);
      } else {
        aiMsg = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `针对“${text}”，基于当前受控规范与 ${aiConfig.modelName.split(' ')[0]} 提炼推理结果如下：`,
          structuredAnswer: {
            summary: `针对“${text}”的系统设计与测试执行准则`,
            steps: [
              `1. 前置状态核查：确保分析仪上位机与下位机主控板处于待命状态，记录测试基线序列号。`,
              `2. 核心规约执行：遵循 SRS-3.2 规范与协议定义，输入“${text}”相关测试向量，采集总线交互帧时序。`,
              `3. 判定准则：判定各状态机转移响应时延（≤3000ms），严禁在无复位确认前提下执行进样操作。`,
              `4. 审计与防复发：全量记录加密审计事件日志，执行 SHA-256 完整性签名。`
            ],
            safetyConstraint: aiConfig.strictSafetyAudit
              ? '安全合规约束 (ISO 14971 / IEC 62304)：涉及运动机构或高压注样时，系统强制保持联锁断电状态，禁止未授权自动恢复。'
              : undefined,
            citations: [
              {
                id: 'c-dyn-1',
                title: '软件需求规格说明书',
                section: 'SRS-3.2 §8.2 异常状态机与安全互锁',
                relevance: 96,
                snippet: '定义了主业务流程状态转移矩阵与操作员确认步骤。'
              },
              {
                id: 'c-dyn-2',
                title: '上下位机通信协议规范',
                section: 'Protocol V2.4 §4.2 指令时延',
                relevance: 92,
                snippet: '通信帧响应超时重试与心跳探测规约。'
              }
            ],
            confidence: 94
          }
        };
        setSelectedCitation(aiMsg.structuredAnswer?.citations[0] || null);
      }

      if (isTemporaryMode) {
        setTemporarySession((prev) => (prev ? { ...prev, messages: [...prev.messages, aiMsg] } : null));
      } else {
        setSessions((prev) =>
          prev.map((sess) => {
            if (sess.id === currentSessionId) {
              return {
                ...sess,
                messages: [...sess.messages, aiMsg]
              };
            }
            return sess;
          })
        );
      }
    }, 650);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined! : type
    }));
  };

  return (
    <div id="qflow-knowledge-view" className="h-full w-full max-w-[1920px] mx-auto flex flex-col min-h-0">
      {/* Main Chat Workspace */}
      <div
        className={`flex-1 min-h-0 min-w-0 flex rounded-2xl border overflow-hidden shadow-sm transition-all ${
          mode === 'dark' ? 'bg-slate-900/70 border-slate-800/60' : 'bg-white border-slate-300'
        }`}
      >
        {/* Left: Collapsible History Sessions Rail (Full-Height from top to bottom) */}
        <div
          id="qflow-knowledge-left-rail"
          className={`shrink-0 flex flex-col justify-between border-r transition-all duration-300 overflow-hidden ${
            showHistoryRail ? 'w-64 sm:w-72 p-3.5' : 'w-11 py-3 px-1'
          } ${mode === 'dark' ? 'border-slate-800/60 bg-slate-950/40' : 'border-slate-300 bg-slate-50/80'}`}
        >
          {!showHistoryRail ? (
            <div className="h-full flex flex-col items-center justify-start">
              <div className="flex flex-col items-center gap-3 w-full">
                <button
                  id="btn-expand-history-rail"
                  onClick={() => setShowHistoryRail(true)}
                  title="展开历史会话面板"
                  className={`p-1.5 rounded-lg transition-colors ${
                    mode === 'dark'
                      ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/60'
                      : 'text-indigo-700 hover:text-indigo-900 hover:bg-slate-200'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowHistoryRail(true)}
                  title="展开历史会话面板"
                  className={`p-1 rounded-lg transition-colors flex flex-col items-center gap-1.5 ${
                    mode === 'dark'
                      ? 'hover:bg-slate-800/60 text-slate-300 hover:text-slate-100'
                      : 'hover:bg-slate-200 text-slate-900 hover:text-black font-bold'
                  }`}
                >
                  <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] [writing-mode:vertical-lr] tracking-widest font-bold">
                    历史会话
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              <div className="flex flex-col h-full overflow-hidden space-y-3">
                {/* Left Rail Header */}
                <div className="flex items-center justify-between pb-2 border-b border-inherit shrink-0">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-950 dark:text-white">
                    <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>会话历史 ({sessions.length})</span>
                  </div>
                  <button
                    id="btn-collapse-history-rail"
                    type="button"
                    onClick={() => setShowHistoryRail(false)}
                    title="收起历史会话面板"
                    className={`p-1 rounded-lg transition-colors ${
                      mode === 'dark'
                        ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                        : 'text-slate-700 hover:text-black hover:bg-slate-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Search in History */}
                <div className="shrink-0 space-y-2">
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900/90 border-slate-300 dark:border-slate-700 text-xs">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      placeholder="搜索历史问答..."
                      className="w-full bg-transparent border-0 outline-none text-xs text-slate-950 dark:text-slate-100 placeholder-slate-400 font-medium"
                    />
                    {historySearchTerm && (
                      <button
                        type="button"
                        onClick={() => setHistorySearchTerm('')}
                        className="text-[10px] text-slate-400 hover:text-slate-950 dark:hover:text-white"
                      >
                        清除
                      </button>
                    )}
                  </div>

                  {/* Temporary Chat Entry in Sidebar */}
                  {!isTemporaryMode ? (
                    <button
                      type="button"
                      onClick={handleStartTemporarySession}
                      className={`w-full py-2 px-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold transition-all ${
                        mode === 'dark'
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                          : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>开启临时问答</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-normal">
                        不存历史
                      </span>
                    </button>
                  ) : (
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        mode === 'dark'
                          ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                          : 'bg-amber-50 border-amber-400 ring-1 ring-amber-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold text-amber-800 dark:text-amber-300 truncate">
                            {temporarySession?.title || '临时无痕问答'}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400/80 font-medium truncate mt-0.5">
                          临时流转中 · 新建后自动销毁
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExitTemporarySession}
                        title="立即销毁此临时问答"
                        className="p-1 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-600 dark:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Sessions List */}
                <div className="overflow-y-auto space-y-1.5 flex-1 pr-0.5">
                  {filteredSessions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                      暂无匹配的历史会话
                    </div>
                  ) : (
                    filteredSessions.map((s) => {
                      const isActive = !isTemporaryMode && s.id === currentSessionId;
                      const userQuestion = s.messages.find((m) => m.sender === 'user')?.text || s.title;
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSession(s.id)}
                          className={`group p-2.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                            isActive
                              ? mode === 'dark'
                                ? 'bg-indigo-950/50 border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/40'
                                : 'bg-white border-indigo-400 shadow-xs ring-1 ring-indigo-300'
                              : mode === 'dark'
                              ? 'bg-slate-900/50 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                              : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-xs font-bold truncate ${
                                  isActive
                                    ? 'text-indigo-700 dark:text-indigo-300'
                                    : 'text-slate-950 dark:text-slate-100'
                                }`}
                              >
                                {s.title}
                              </span>
                              {isActive && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-600 text-white shrink-0">
                                  当前
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium truncate mb-1">
                              {userQuestion}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                              <span className="px-1.5 py-0.2 rounded bg-slate-500/10 text-slate-700 dark:text-slate-300 font-semibold text-[9px]">
                                {s.category}
                              </span>
                              <span>·</span>
                              <span>{s.updatedAt}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleDeleteSession(e, s.id)}
                            title="删除此会话"
                            className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/15 text-slate-400 hover:text-red-600 transition-all shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Main Conversation Workspace (Contains Header, Messages + Right Evidence Rail, and Bottom Composer) */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top Banner */}
          <div className="px-5 py-3 border-b border-inherit flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isTemporaryMode
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400'
                }`}
              >
                {isTemporaryMode ? <Zap className="w-4.5 h-4.5" /> : <BrainCircuit className="w-4.5 h-4.5" />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-bold text-slate-950 dark:text-white truncate">
                    {activeSession.title}
                  </h2>
                  {isTemporaryMode && (
                    <span
                      id="badge-temp-chat-mode"
                      title="临时问答模式：本次问答不存入历史，添加新会话或切换后自动销毁"
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/35 shrink-0"
                    >
                      <EyeOff className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>无痕临时模式</span>
                    </span>
                  )}
                  <span
                    id="badge-chat-model"
                    title={`当前会话推理基座: ${aiConfig.modelName}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/25 shrink-0"
                  >
                    <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    <span>{aiConfig.modelName}</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-800 dark:text-slate-400 font-medium truncate">
                  {isTemporaryMode
                    ? '临时对话流转中 · 退出、切换或新增会话后将立即自动销毁'
                    : '针对受控规约精准提炼业务要求与故障逻辑 · 自动校验 ISO 14971 安全联锁'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Temporary Chat Toggle Button */}
              {!isTemporaryMode ? (
                <button
                  id="btn-start-temp-chat"
                  type="button"
                  onClick={handleStartTemporarySession}
                  title="开启临时问答：不记录在历史中，添加新会话或切换后即刻自动销毁"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs border ${
                    mode === 'dark'
                      ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/35 text-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>临时问答</span>
                </button>
              ) : (
                <button
                  id="btn-destroy-temp-chat"
                  type="button"
                  onClick={handleExitTemporarySession}
                  title="立即销毁当前临时问答并退出"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>销毁临时问答</span>
                </button>
              )}

              <button
                id="btn-new-chat-session"
                onClick={handleNewSession}
                title={isTemporaryMode ? '添加新会话（将自动销毁当前临时问答）' : '开启新问答'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新问答</span>
              </button>

              <button
                onClick={() => {
                  if (isTemporaryMode && temporarySession) {
                    setTemporarySession({
                      ...temporarySession,
                      messages: [temporarySession.messages[0]]
                    });
                  } else {
                    setSessions((prev) =>
                      prev.map((s) => (s.id === currentSessionId ? { ...s, messages: [s.messages[0]] } : s))
                    );
                  }
                }}
                title="清空当前会话消息"
                className={`p-1.5 rounded-lg transition-colors border ${
                  mode === 'dark'
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-slate-800'
                    : 'text-slate-700 hover:text-black hover:bg-slate-100 border-slate-300'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Ephemeral / Temporary Chat Notice Banner */}
          {isTemporaryMode && (
            <div
              id="banner-temp-chat-notice"
              className="mx-4 sm:mx-6 mt-3 px-4 py-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-500/35 flex items-center justify-between gap-3 text-xs shrink-0 shadow-xs"
            >
              <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200 font-medium">
                <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong>临时问答模式已生效</strong>：本会话不记录在历史中。<strong>添加新会话</strong>、切换其他历史会话或点击右侧按钮后即可彻底销毁。
                </span>
              </div>
              <button
                type="button"
                onClick={handleExitTemporarySession}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 transition-colors flex items-center gap-1 shadow-xs"
              >
                <Trash2 className="w-3 h-3" />
                <span>立即销毁</span>
              </button>
            </div>
          )}

          {/* Middle Workspace: Center Messages Thread + Right Evidence Panel */}
          <div className="flex-1 flex min-h-0 overflow-hidden">

          {/* Center: Chat Conversation Sub-pane */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Message Thread (The Single Primary Scroll Container) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {msg.sender === 'user' ? (
                    <div className="max-w-2xl sm:max-w-3xl p-4 rounded-2xl rounded-tr-sm bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-sm leading-relaxed">
                      {msg.text}
                    </div>
                  ) : (
                    <div
                      className={`w-full p-5 sm:p-6 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                        mode === 'dark'
                          ? 'bg-slate-950/40 border-slate-800 text-slate-200'
                          : 'bg-white border-slate-300 text-slate-950 shadow-sm'
                      } space-y-4`}
                    >
                      {/* Top Citation Meta Bar */}
                      <div className="flex items-center justify-between border-b border-inherit pb-2.5">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          <span>已对齐受控规约</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                            可信度 {msg.structuredAnswer?.confidence || 98}%
                          </span>
                          <button
                            onClick={() =>
                              handleCopy(
                                msg.id,
                                `${msg.structuredAnswer?.summary || ''}\n\n${(msg.structuredAnswer?.steps || []).join('\n')}`
                              )
                            }
                            title="复制回答"
                            className={`transition-colors ${
                              mode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-black'
                            }`}
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Summary */}
                      {msg.structuredAnswer && (
                        <div className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white leading-snug">
                          {msg.structuredAnswer.summary}
                        </div>
                      )}

                      {/* Structured Steps */}
                      <div className="space-y-2 py-0.5">
                        {msg.structuredAnswer?.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-950 dark:text-slate-300 font-medium leading-relaxed">
                            <span className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="flex-1">{step}</span>
                          </div>
                        ))}
                      </div>

                      {/* Safety Constraint Callout */}
                      {msg.structuredAnswer?.safetyConstraint && (
                        <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                          mode === 'dark'
                            ? 'bg-red-500/10 border-red-500/20 text-red-300'
                            : 'bg-red-50 border-red-300 text-red-950'
                        }`}>
                          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <b className="block text-red-800 dark:text-red-400 text-xs mb-0.5 font-bold">安全联锁约束 (ISO 14971)</b>
                            <p className="text-[11px] text-red-950 dark:text-red-200 font-medium leading-relaxed">
                              {msg.structuredAnswer.safetyConstraint}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Interactive Citations list */}
                      {msg.structuredAnswer?.citations && (
                        <div className="pt-2.5 border-t border-inherit">
                          <div className="text-[10px] font-bold text-slate-800 dark:text-slate-400 mb-1.5">
                            依据条款（点击展开右侧溯源详情）：
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.structuredAnswer.citations.map((c) => {
                              const isSelected = selectedCitation?.id === c.id;
                              return (
                                <button
                                  key={c.id}
                                  onClick={() => {
                                    setSelectedCitation(c);
                                    setShowRightRail(true);
                                  }}
                                  className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all flex items-center gap-1.5 font-bold ${
                                    isSelected
                                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                                      : mode === 'dark'
                                      ? 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'
                                  }`}
                                >
                                  <span>{c.section}</span>
                                  <span className="opacity-80 font-sans">({c.relevance}%)</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Footer Action Strip */}
                      <div className="pt-2 border-t border-inherit flex items-center justify-between">
                        <button
                          onClick={() => handleCopy(msg.id, msg.structuredAnswer?.summary || msg.text)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                            copiedId === msg.id
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : mode === 'dark'
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                              : 'text-slate-800 hover:text-black hover:bg-slate-100'
                          }`}
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>复制解答</span>
                            </>
                          )}
                        </button>

                        {/* Feedback Rating */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1.5 rounded-md transition-colors ${
                              feedbackGiven[msg.id] === 'up'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                                : mode === 'dark'
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                : 'text-slate-600 hover:text-black hover:bg-slate-100'
                            }`}
                            title="结论准确，对测试设计有帮助"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1.5 rounded-md transition-colors ${
                              feedbackGiven[msg.id] === 'down'
                                ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                                : mode === 'dark'
                                ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                : 'text-slate-600 hover:text-black hover:bg-slate-100'
                            }`}
                            title="需要补充更多条款或规约"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-xs text-indigo-950 dark:text-indigo-300 max-w-md font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin text-indigo-600 dark:text-cyan-400" />
                  <span>
                    正在索引受控规范，经由 {aiConfig.modelName.split(' ')[0]} 提取测试逻辑...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Citations & Evidence Panel */}
          <div
            id="qflow-knowledge-right-rail"
            className={`shrink-0 flex flex-col justify-between border-l transition-all duration-300 overflow-hidden ${
              showRightRail ? 'w-72 sm:w-80 p-4' : 'w-11 py-3 px-1'
            } ${mode === 'dark' ? 'border-slate-800/60 bg-slate-950/20' : 'border-slate-300 bg-slate-50'}`}
          >
            {!showRightRail ? (
              <div className="h-full flex flex-col items-center justify-start">
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    id="btn-expand-citations"
                    onClick={() => setShowRightRail(true)}
                    title="展开依据溯源面板"
                    className={`p-1.5 rounded-lg transition-colors ${
                      mode === 'dark' ? 'text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/60' : 'text-indigo-700 hover:text-indigo-900 hover:bg-slate-200'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowRightRail(true)}
                    title="展开依据溯源面板"
                    className={`p-1 rounded-lg transition-colors flex flex-col items-center gap-1.5 ${
                      mode === 'dark' ? 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-200 text-slate-800 hover:text-black font-bold'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[10px] [writing-mode:vertical-lr] tracking-widest font-bold">
                      依据溯源
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full justify-between overflow-hidden">
                <div className="space-y-3.5 overflow-y-auto no-scrollbar pr-0.5">
                  {/* Rail Sub-header with Collapse Button */}
                  <div className="flex items-center justify-between pb-2 border-b border-inherit">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-950 dark:text-white">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>依据溯源</span>
                    </div>
                    <button
                      id="btn-collapse-citations"
                      onClick={() => setShowRightRail(false)}
                      title="收起依据溯源面板"
                      className={`p-1 rounded-lg transition-colors ${
                        mode === 'dark' ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50' : 'text-slate-700 hover:text-black hover:bg-slate-200'
                      }`}
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Active AI Model Record */}
                  <div
                    className={`p-2.5 rounded-xl border space-y-1 transition-all ${
                      mode === 'dark' ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 dark:text-indigo-400">
                      <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>会话模型记录</span>
                    </div>
                    <div className="font-bold text-xs text-slate-950 dark:text-white truncate">
                      {aiConfig.modelName}
                    </div>
                  </div>

                  {/* Citation Header */}
                  <div className="border-b pb-1.5 border-inherit">
                    <h3 className="text-xs font-bold text-slate-950 dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>权威引用溯源</span>
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-800 dark:text-slate-400 font-medium mt-0.5">点击条款可联动查看受控原著片段</p>
                  </div>

                  {/* Citation Cards */}
                  <div className="space-y-2">
                    {(lastAssistantMsg?.structuredAnswer?.citations || QA_KNOWLEDGE_BASE[0].citations).map(
                      (ref) => {
                        const isSelected = selectedCitation?.id === ref.id;
                        return (
                          <div
                            key={ref.id}
                            onClick={() => setSelectedCitation(ref)}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                              isSelected
                                ? 'border-indigo-500 bg-indigo-500/15 shadow-xs'
                                : mode === 'dark'
                                ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                                : 'bg-white border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                              <span className="truncate max-w-[140px]">{ref.title}</span>
                              <span className="text-[9px] font-mono text-emerald-800 dark:text-emerald-400 font-bold">
                                {ref.relevance}%
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-950 dark:text-slate-300 mt-0.5 font-bold">
                              {ref.section}
                            </div>
                            <p className="text-[10px] text-slate-800 dark:text-slate-400 font-medium mt-1 line-clamp-2 leading-relaxed">
                              {ref.snippet}
                            </p>
                          </div>
                        );
                      }
                    )}
                  </div>

                  {/* Selected Citation Deep Inspector */}
                  {selectedCitation && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        mode === 'dark' ? 'bg-indigo-950/20 border-indigo-500/30' : 'bg-indigo-50 border-indigo-300 text-slate-950'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        <span>规范条款依据与定位</span>
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">可信核验</span>
                      </div>
                      <div className="font-bold text-xs text-slate-950 dark:text-slate-200">
                        {selectedCitation.title} · {selectedCitation.section}
                      </div>
                      <p className="text-[11px] text-slate-950 dark:text-slate-300 font-medium leading-relaxed">
                        "{selectedCitation.snippet}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Consistency Meter */}
                <div className="pt-2 border-t border-inherit space-y-1 text-xs shrink-0">
                  <div className="flex items-center justify-between text-[10px] font-semibold">
                    <span className="text-slate-800 dark:text-slate-400">交叉验证度</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">98.8%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '98.8%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM COMPOSER AREA: Integrated directly across the bottom of the main view */}
        <div
          className={`px-5 py-3 border-t shrink-0 ${
            mode === 'dark'
              ? 'border-slate-800/60 bg-slate-950/30'
              : 'border-slate-300 bg-slate-50'
          }`}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className={`p-1.5 rounded-xl border flex items-center gap-2 ${
              mode === 'dark'
                ? 'bg-slate-950/50 border-slate-800/80 focus-within:border-indigo-500/60'
                : 'bg-white border-slate-400 focus-within:border-indigo-600 shadow-xs'
            } transition-colors`}
          >
            <input
              id="input-qa-query"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入针对需求规约、协议时延、安全防夹或历史缺陷的测试问题..."
              className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm px-2.5 text-slate-950 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 font-semibold"
            />
            <button
              id="btn-qa-send"
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>发送</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};
