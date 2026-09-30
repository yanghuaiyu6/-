import React, { useState, useEffect } from 'react';
import { Search, X, FileText, Waypoints, FlaskConical, MessageSquare, ArrowRight } from 'lucide-react';
import { ViewType, ProjectDocument, ModeType } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: ProjectDocument[];
  onNavigate: (view: ViewType) => void;
  onSelectDoc: (docId: string) => void;
  onSelectGraphNode: (nodeName: string) => void;
  mode?: ModeType;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  documents,
  onNavigate,
  onSelectDoc,
  onSelectGraphNode,
  mode = 'dark'
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggling
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(query.toLowerCase()) ||
      d.summary.toLowerCase().includes(query.toLowerCase())
  );

  const matchedNodes = [
    '样本检测主流程',
    '异常报警状态机',
    '上下位机通信协议',
    '风险控制 R-17',
    'PR-184 变更分析'
  ].filter((n) => !query || n.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden ${
        mode === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-slate-300 bg-white text-slate-950'
      }`}>
        {/* Search Input bar */}
        <div className={`p-4 border-b flex items-center gap-3 ${
          mode === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-300 bg-slate-50'
        }`}>
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索需求条款、协议指令、风险条目或测试用例 (输入 PR-184, R-17...)"
            className={`w-full bg-transparent border-0 outline-none text-sm font-semibold ${
              mode === 'dark' ? 'text-white placeholder-slate-400' : 'text-slate-950 placeholder-slate-500'
            }`}
          />
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3 text-xs">
          {/* Matched Documents */}
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 dark:text-slate-400 block px-2 mb-1">
              受控规范文档
            </span>
            <div className="space-y-1">
              {filteredDocs.slice(0, 4).map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelectDoc(doc.id);
                    onNavigate('documents');
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors group ${
                    mode === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="font-bold text-slate-950 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white truncate">
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-slate-700 dark:text-slate-400 font-medium truncate">{doc.path}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-400 shrink-0 ml-2">{doc.version}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Matched Graph Nodes */}
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-700 dark:text-slate-400 block px-2 mb-1">
              业务关系图谱实体
            </span>
            <div className="space-y-1">
              {matchedNodes.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    onSelectGraphNode(name);
                    onNavigate('graph');
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-colors group ${
                    mode === 'dark' ? 'hover:bg-slate-800/80' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Waypoints className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                    <span className="font-bold text-slate-950 dark:text-slate-200 group-hover:text-black dark:group-hover:text-white">{name}</span>
                  </div>
                  <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-bold flex items-center gap-1">
                    <span>在 3D 星图中定位</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className={`p-2.5 border-t text-[10px] flex items-center justify-between px-4 font-medium ${
          mode === 'dark' ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-300 bg-slate-50 text-slate-700'
        }`}>
          <span>提示：按 ESC 或点击空白处关闭</span>
          <span className="font-mono font-bold">QFlow AI Intelligence Indexer</span>
        </div>
      </div>
    </div>
  );
};
