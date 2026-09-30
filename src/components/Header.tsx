import React from 'react';
import {
  Search,
  UploadCloud,
  AlertTriangle,
  Radio,
  ExternalLink,
  Command,
  FileSpreadsheet
} from 'lucide-react';
import { ViewType, ThemeType, ModeType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  theme: ThemeType;
  mode: ModeType;
  activeProject: string;
  onQuickSearch: () => void;
  onQuickCreateTest?: () => void;
  onQuickImport: () => void;
}

const VIEW_TITLES: Record<ViewType, { title: string; subtitle: string }> = {
  home: { title: '项目测试全景', subtitle: 'AI 驱动的业务理解、影响分析与测试管控' },
  knowledge: { title: '知识智能问答', subtitle: '已连接 286 份受控规范，基于 AI 基座支持追溯性推理与一键生成' },
  documents: { title: '知识资产管理器', subtitle: '需求规格、通信协议、风险管理与测试用例结构化解析' },
  graph: { title: '业务关系与影响图谱', subtitle: '3D 节点空间交互，分析上下游依赖与 PR-184 风险波及面' },
  testing: { title: '智能测试设计工作台', subtitle: '基于受控业务依据自动提炼测试点与可执行用例' }
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  theme,
  mode,
  activeProject,
  onQuickSearch,
  onQuickCreateTest,
  onQuickImport
}) => {
  const info = VIEW_TITLES[currentView];

  return (
    <header
      id="qflow-header"
      className={`h-16 px-6 flex items-center justify-between border-b shrink-0 select-none z-20 backdrop-blur-md transition-colors ${
        mode === 'dark'
          ? 'bg-slate-950/80 border-slate-800/80 text-slate-100'
          : 'bg-white/95 border-slate-300 text-slate-950 shadow-xs'
      }`}
    >
      {/* Title & Subtitle */}
      <div className="flex items-center gap-4 min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-slate-950 dark:text-white">{info.title}</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              智能体就绪
            </span>
          </div>
          <p className="text-[11px] text-slate-800 dark:text-slate-400 font-medium truncate hidden md:block">{info.subtitle}</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          id="btn-global-search"
          onClick={onQuickSearch}
          className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
            mode === 'dark'
              ? 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-slate-100 hover:border-slate-700'
              : 'bg-slate-100 border-slate-300 text-slate-900 hover:text-black hover:bg-slate-200'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>全局业务检索</span>
          <kbd className={`hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded border ${
            mode === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-900 border-slate-300 shadow-xs'
          }`}>
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>

        {/* Action Buttons */}
        {currentView === 'documents' && (
          <button
            id="btn-header-import"
            onClick={onQuickImport}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              mode === 'dark'
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-sm'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>导入资料</span>
          </button>
        )}
      </div>
    </header>
  );
};
