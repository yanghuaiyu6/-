import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  MessageSquareCode,
  ScanSearch,
  BrainCircuit
} from 'lucide-react';
import { ViewType, ThemeType, ModeType } from '../types';

interface HomeViewProps {
  onNavigate: (view: ViewType) => void;
  theme: ThemeType;
  mode: ModeType;
  onSendPromptToKnowledge: (prompt: string) => void;
  onQuickGenerateTestForScope: (scope: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  theme,
  mode,
  onSendPromptToKnowledge,
  onQuickGenerateTestForScope
}) => {
  const [commandInput, setCommandInput] = useState('');

  const SUGGESTED_PROMPTS = [
    '分析 PR-184 的影响，并生成异常报警回归测试',
    '设备在吸样过程中网络闪断，系统状态机应如何迁移？',
    '根据 ISO 14971 R-17 提取进样臂防夹伤安全测试用例',
    '核对上下位机通信协议 V2.4 与当前需求 SRS-3.2 的一致性'
  ];

  const handleCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = commandInput.trim() || '分析 PR-184 的影响，并生成异常报警回归测试';
    onSendPromptToKnowledge(query);
  };

  return (
    <div
      id="qflow-home-view"
      className="my-auto flex-1 flex flex-col justify-center space-y-5 lg:space-y-6 max-w-[1600px] w-full mx-auto py-2 sm:py-4"
    >
      {/* Top AI Command Stage */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10 border transition-all shadow-xl backdrop-blur-xl ${
          mode === 'dark'
            ? 'bg-gradient-to-br from-slate-900/90 via-slate-950/80 to-slate-900/60 border-slate-800/80'
            : 'bg-gradient-to-br from-white via-indigo-50/40 to-white border-slate-200/90'
        }`}
      >
        {/* Subtle decorative glow orb */}
        <div
          className={`absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
            theme === 'spruce'
              ? 'bg-emerald-500'
              : theme === 'amber'
              ? 'bg-amber-500'
              : 'bg-indigo-500'
          }`}
        />

        <div className="relative z-10">
          {/* Main Headline */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white max-w-3xl">
            智能测试工程管控工作台
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-800 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            面向复杂受控工程与严苛合规体系的智能测试全流程管控平台，贯通需求拓扑、通信协议、风险控制与用例生成。
          </p>

          {/* Command Bar Form */}
          <form onSubmit={handleCommandSubmit} className="mt-5 max-w-3xl">
            <div
              className={`p-2 rounded-2xl border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 transition-all shadow-md ${
                mode === 'dark'
                  ? 'bg-slate-900/90 border-slate-700/80 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20'
                  : 'bg-white border-slate-400 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20'
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-1 flex-1">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 animate-pulse" />
                <input
                  id="home-command-input"
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="例如：分析网络闪断重连机制，生成安全互锁回归测试用例..."
                  className="w-full bg-transparent border-0 outline-none text-sm text-slate-950 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 font-semibold"
                />
              </div>

              <button
                id="btn-home-command-run"
                type="submit"
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shrink-0 hover:scale-102 shadow-md ${
                  theme === 'spruce'
                    ? 'bg-gradient-to-r from-teal-700 to-emerald-600 shadow-emerald-500/25'
                    : theme === 'amber'
                    ? 'bg-gradient-to-r from-amber-700 to-orange-600 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-indigo-700 to-cyan-600 shadow-indigo-500/25'
                }`}
              >
                <span>立即分析</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Prompt Recommendation Pills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setCommandInput(p);
                  onSendPromptToKnowledge(p);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl border text-left font-semibold transition-all ${
                  mode === 'dark'
                    ? 'bg-slate-900/50 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-950 border-slate-300 shadow-xs'
                }`}
              >
                ⚡ {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3 Core Interactive Action Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Pillar 1: Understand Business Network */}
        <div
          id="card-action-graph"
          onClick={() => onNavigate('graph')}
          className={`p-5 sm:p-6 lg:p-7 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
            mode === 'dark'
              ? 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50'
              : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-indigo-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ScanSearch className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-950 dark:text-slate-100 flex items-center justify-between">
            <span>理解业务关系图谱</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="mt-2 text-xs text-slate-800 dark:text-slate-400 font-medium leading-relaxed">
            从 3D 知识拓扑中洞察功能、协议、风险项与上下游依赖，直观呈现研发变更带来的连锁反应。
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-400">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
            14 个核心业务节点 · 18 组依赖关系
          </div>
        </div>

        {/* Pillar 2: Knowledge AI QA */}
        <div
          id="card-action-knowledge"
          onClick={() => onNavigate('knowledge')}
          className={`p-5 sm:p-6 lg:p-7 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
            mode === 'dark'
              ? 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-emerald-500/50'
              : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-emerald-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-950 dark:text-slate-100 flex items-center justify-between">
            <span>受控知识智能问答</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="mt-2 text-xs text-slate-800 dark:text-slate-400 font-medium leading-relaxed">
            基于多模态受控知识资产进行深度事实溯源与归因推导，严格约束条款引用并杜绝虚构。
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400"></span>
            私有受控微调 · 100% 事实溯源依据
          </div>
        </div>

        {/* Pillar 3: Manage Knowledge */}
        <div
          id="card-action-documents"
          onClick={() => onNavigate('documents')}
          className={`p-5 sm:p-6 lg:p-7 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 ${
            mode === 'dark'
              ? 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50'
              : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-cyan-400'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-base text-slate-950 dark:text-slate-100 flex items-center justify-between">
            <span>更新受控知识资产</span>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
          </h3>
          <p className="mt-2 text-xs text-slate-800 dark:text-slate-400 font-medium leading-relaxed">
            结构化解析设计文档、CAN-FD协议、历史缺陷报告，智能提取章节实体并构建版本演进基线。
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono font-bold text-cyan-700 dark:text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400"></span>
            7 份核心规范 · 286 份历史归档
          </div>
        </div>
      </div>
    </div>
  );
};

