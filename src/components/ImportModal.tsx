import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  X,
  FileText,
  FileCode2,
  FileSpreadsheet,
  FileJson,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileUp,
  FolderPlus,
  Loader2
} from 'lucide-react';
import { ProjectDocument, DocCategory, ThemeType, ModeType } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (newDoc: ProjectDocument) => void;
  theme: ThemeType;
  mode: ModeType;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  theme,
  mode
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Exclude<DocCategory, '全部'>>('需求');
  const [version, setVersion] = useState('V1.0');
  const [owner, setOwner] = useState('当前登录用户 (QA)');
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    if (!title) {
      // derive nice clean title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
    }
    // auto detect category from filename
    const lower = file.name.toLowerCase();
    if (lower.includes('协议') || lower.includes('protocol') || lower.includes('api')) {
      setCategory('协议');
    } else if (lower.includes('风险') || lower.includes('risk') || lower.includes('hazard')) {
      setCategory('风险');
    } else if (lower.includes('测试') || lower.includes('test') || lower.includes('case')) {
      setCategory('测试');
    } else if (lower.includes('设计') || lower.includes('design') || lower.includes('arch')) {
      setCategory('设计');
    } else {
      setCategory('需求');
    }
    if (!summary) {
      setSummary(`导入的文件《${file.name}》，待知识库提取核心业务条目与测试依赖。`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsProcessing(true);
    setProcessStep('正在上传文档至 QFlow 资产受控沙箱...');

    setTimeout(() => {
      setProcessStep('正在进行大模型语义切分与实体抽取 (NER)...');
      setTimeout(() => {
        setProcessStep('正在关联知识图谱节点与 ISO 14971 追溯链...');
        setTimeout(() => {
          // Construct new ProjectDocument
          const id = `doc-${Date.now().toString(36)}`;
          const pathPrefix =
            category === '需求'
              ? '01 产品与需求'
              : category === '设计'
              ? '02 架构与设计'
              : category === '协议'
              ? '03 软硬件协议'
              : category === '风险'
              ? '04 质量与风险'
              : '05 测试资产库';

          const newDoc: ProjectDocument = {
            id,
            title: title.trim(),
            path: `${pathPrefix} / ${title.trim()}`,
            category,
            version: version.trim() || 'V1.0',
            owner: owner || '当前登录用户',
            updated: '刚刚',
            summary:
              summary.trim() ||
              `受控资料《${title.trim()}》，包含${category}规格要素，已由 AI 完成知识索引。`,
            relationsCount: Math.floor(Math.random() * 20) + 12,
            testCoverageCount: Math.floor(Math.random() * 35) + 15,
            riskCount: category === '风险' ? 6 : Math.floor(Math.random() * 4) + 1,
            modulesCount: 3,
            tags: ['新导入资料', 'AI已解析', '受控基线', category],
            aiParsedStatus: 'completed',
            sections: [
              {
                heading: '1. 规范范围与关键控制要素',
                content: `本受控资产《${title.trim()}》正式导入知识资产库，界定了${category}层级核心验收基线与软硬件协同边界。系统已在知识拓扑中挂载相应校验项。`,
                safetyLevel: category === '风险' ? 'critical' : 'info'
              },
              {
                heading: '2. 接口协议与异常防护边界',
                content:
                  '对输入参数、状态转换及网络通讯波动建立全生命周期监控，在异常工况下触发保护联锁或告警日志记录。',
                safetyLevel: 'warning'
              },
              {
                heading: '3. 自动化测试与持续回归指导',
                content:
                  '可直接基于本资产一键生成覆盖正面场景、边界值及异常故障注入的标准化测试用例。'
              }
            ]
          };

          setIsProcessing(false);
          onImportSuccess(newDoc);
          onClose();
        }, 600);
      }, 700);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-2xl border p-6 shadow-2xl transition-all ${
          mode === 'dark'
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white">导入资料至知识资产库</h3>
              <p className="text-[11px] text-slate-800 dark:text-slate-400 font-medium">
                支持导入需求规范、通信规约、风险矩阵或测试用例，AI 自动切分并构建追溯拓扑
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className={`p-1.5 rounded-lg transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-indigo-500 bg-indigo-500/10'
                : selectedFile
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : mode === 'dark'
                ? 'border-slate-700 hover:border-slate-600 bg-slate-950/40'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".docx,.doc,.pdf,.md,.txt,.xlsx,.json"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />
            <div className="flex flex-col items-center justify-center gap-1.5">
              {selectedFile ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                    已选定文件：{selectedFile.name}
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-400 font-mono font-medium">
                    {(selectedFile.size / 1024).toFixed(1)} KB · 点击可重新选择
                  </div>
                </>
              ) : (
                <>
                  <FileUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400 opacity-80 mb-1" />
                  <div className="text-xs font-bold text-slate-950 dark:text-slate-200">
                    拖拽文件至此处，或 <span className="text-indigo-700 dark:text-indigo-400 underline">点击浏览本地文件</span>
                  </div>
                  <div className="text-[11px] text-slate-800 dark:text-slate-400 font-medium">
                    支持 Word (.docx)、PDF、Markdown、Excel (.xlsx)、JSON 规约
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-950 dark:text-slate-400 block mb-1">
                资料名称 / 文档标题 *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：急诊插队规格书"
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none font-semibold transition-colors ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-700 focus:border-indigo-500 text-white'
                    : 'bg-slate-50 border-slate-300 focus:border-indigo-600 text-slate-950'
                }`}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-950 dark:text-slate-400 block mb-1">受控版本</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="V1.0"
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none font-mono font-semibold ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-700 focus:border-indigo-500 text-white'
                    : 'bg-slate-50 border-slate-300 focus:border-indigo-600 text-slate-950'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-950 dark:text-slate-400 block mb-1">资产分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Exclude<DocCategory, '全部'>)}
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none font-semibold ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-indigo-600'
                }`}
              >
                <option value="需求">需求 (SRS / PRD)</option>
                <option value="协议">协议 (Protocol / API / Communication)</option>
                <option value="风险">风险 (ISO 14971 / FMEA / Hazard)</option>
                <option value="设计">设计 (System Arch / UI / Database)</option>
                <option value="测试">测试 (Test Cases / Plan / Baseline)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-950 dark:text-slate-400 block mb-1">编写人 / 归属负责人</label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="姓名或科室组"
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none font-semibold ${
                  mode === 'dark'
                    ? 'bg-slate-950 border-slate-700 text-white'
                    : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-indigo-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-950 dark:text-slate-400 block mb-1">
              核心摘要 / 业务背景
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简述该受控资料界定的业务范围、重要指标或安全互锁要点..."
              className={`w-full px-3 py-2 rounded-xl border text-xs outline-none resize-none font-medium leading-relaxed ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-700 focus:border-indigo-500 text-white'
                  : 'bg-slate-50 border-slate-300 focus:border-indigo-600 text-slate-950'
              }`}
            />
          </div>

          {/* Loading status display */}
          {isProcessing && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center gap-3 animate-pulse">
              <Loader2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin shrink-0" />
              <div className="text-xs text-indigo-900 dark:text-indigo-300 font-bold">{processStep}</div>
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-inherit flex items-center justify-between">
            <span className="text-[11px] text-slate-800 dark:text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>导入后将自动在「知识资产」中高亮定位并完成图谱关联</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  mode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isProcessing || !title.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>解析中...</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>确认导入资产</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
