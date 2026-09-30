import React, { useState } from 'react';
import {
  Wand2,
  Download,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileText,
  FileJson,
  Copy,
  Check,
  Plus,
  ArrowRight,
  Send,
  Eye,
  Settings
} from 'lucide-react';
import { TestDraft, TestCaseItem, ThemeType, ModeType } from '../types';
import { INITIAL_TEST_DRAFT } from '../data/mockData';

interface TestingViewProps {
  initialScope?: string;
  theme: ThemeType;
  mode: ModeType;
  testDraft?: TestDraft;
  projectName?: string;
}

export const TestingView: React.FC<TestingViewProps> = ({
  initialScope,
  theme,
  mode,
  testDraft: propTestDraft,
  projectName
}) => {
  const [scope, setScope] = useState<string>(initialScope || 'PR-184 异常报警与重连容错专项');
  const [outputType, setOutputType] = useState<string>('full');
  const [supplementary, setSupplementary] = useState<string>(
    '重点覆盖物理拔线3秒自保时限、高优先级告警抢占，以及重连后严禁未确认自动恢复电机。'
  );

  const [draft, setDraft] = useState<TestDraft>(propTestDraft || INITIAL_TEST_DRAFT);
  const [activeTab, setActiveTab] = useState<'cases' | 'outline' | 'citations'>('cases');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  React.useEffect(() => {
    if (propTestDraft) {
      setDraft(propTestDraft);
    }
  }, [propTestDraft]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setDraft((prev) => ({
        ...prev,
        scope,
        version: `AI-Draft V${(parseFloat(prev.version.replace(/[^\d.]/g, '')) + 0.1).toFixed(1)}`,
        status: '最新生成 (就绪)'
      }));
    }, 900);
  };

  const handleCopyXmind = () => {
    const xmindStructure = {
      root: {
        title: draft.title,
        children: [
          { title: '测试目标', detail: draft.objective },
          { title: '测试点', children: draft.testPoints.map((p) => ({ title: p })) },
          {
            title: '测试用例集',
            children: draft.cases.map((c) => ({
              title: `${c.id}: ${c.name} [${c.priority}]`,
              expected: c.expectedResult
            }))
          },
          { title: '受控依据', children: draft.citations.map((cite) => ({ title: cite })) }
        ]
      }
    };
    navigator.clipboard.writeText(JSON.stringify(xmindStructure, null, 2));
    setCopiedNotification('已复制 XMind 兼容结构 JSON 到剪贴板！');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const handleExportCsv = () => {
    const headers = '用例ID,用例名称,优先级,测试类型,前置条件,测试步骤,预期结果,需求追溯\n';
    const rows = draft.cases
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.priority}","${c.type}","${c.precondition.replace(/"/g, '""')}","${c.steps.join('; ').replace(/"/g, '""')}","${c.expectedResult.replace(/"/g, '""')}","${c.traceability}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `QFlow_TestCases_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedNotification('已下载标准 CSV 测试用例表！');
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  return (
    <div id="qflow-testing-view" className="h-full w-full max-w-[1920px] mx-auto min-h-0 flex flex-col lg:flex-row gap-3 lg:gap-5">
      {/* Left Form: Test Parameters */}
      <div
        className={`w-full lg:w-80 xl:w-96 shrink-0 min-h-0 p-4 sm:p-5 rounded-2xl border flex flex-col justify-between overflow-y-auto ${
          mode === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-300'
        } shadow-sm space-y-5`}
      >
        <div className="space-y-4">
          <div className="border-b pb-3 border-inherit">
            <h2 className="text-sm font-extrabold text-slate-950 dark:text-white flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              AI 智能测试设计引擎
            </h2>
            <p className="text-[11px] text-slate-800 dark:text-slate-400 font-medium mt-0.5">
              基于项目需求规格、通信协议与风险控制自动生成四段论用例
            </p>
          </div>

          {/* Test Scope Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
              测试范围 (Test Scope)
            </label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs outline-none font-semibold ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-200 focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-indigo-600'
              }`}
            >
              <option value="PR-184 异常报警与重连容错专项">PR-184 异常报警与重连容错专项 (最新推荐)</option>
              <option value="样本检测全流程业务回归">样本检测全流程业务回归 (126条基线)</option>
              <option value="上下位机通信协议 V2.4 健壮性">上下位机通信协议 V2.4 健壮性</option>
              <option value="ISO 14971 R-17 机械运动致伤防护">ISO 14971 R-17 机械运动致伤防护</option>
            </select>
          </div>

          {/* Output Granularity Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
              输出格式与深度
            </label>
            <select
              value={outputType}
              onChange={(e) => setOutputType(e.target.value)}
              className={`w-full p-2.5 rounded-xl border text-xs outline-none font-semibold ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-200 focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 focus:border-indigo-600'
              }`}
            >
              <option value="full">完整测试方案 + 结构化四段论用例 (Step-by-Step)</option>
              <option value="points">仅生成测试点大纲与风险覆盖项</option>
              <option value="matrix">边界值与极限故障注入矩阵</option>
            </select>
          </div>

          {/* Supplementary Constraints */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
              补充要求 / 专家约束提示词
            </label>
            <textarea
              rows={4}
              value={supplementary}
              onChange={(e) => setSupplementary(e.target.value)}
              placeholder="输入特定异常边界、网络抖动时长、优先级覆盖要求..."
              className={`w-full p-2.5 rounded-xl border text-xs outline-none resize-none leading-relaxed font-semibold ${
                mode === 'dark'
                  ? 'bg-slate-950 border-slate-700 text-slate-200 focus:border-indigo-500'
                  : 'bg-slate-50 border-slate-300 text-slate-950 placeholder-slate-500 focus:border-indigo-600'
              }`}
            />
          </div>

          {/* Quick preset chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-800 dark:text-slate-400 block font-bold">快捷注入约束：</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                '覆盖拔线3秒超时',
                '高优先级告警抢占',
                '防重连误自旋(R-17)',
                '校验历史BUG-42'
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSupplementary((prev) => `${prev} ${chip}。`)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mode === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300'
                  }`}
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <div className="pt-4 border-t border-inherit">
          <button
            id="btn-generate-test-plan"
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-101 ${
              theme === 'spruce'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 shadow-emerald-500/20'
                : theme === 'amber'
                ? 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 shadow-amber-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-indigo-500/20'
            }`}
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-cyan-200" />
                <span>正在提取受控条款与金用例对齐...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>生成结构化测试用例草稿</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Pane: Generated Test Artifact Viewer */}
      <div
        className={`flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all ${
          mode === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-300'
        }`}
      >
        {/* Top Artifact Header */}
        <div className={`p-4 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          mode === 'dark' ? 'bg-slate-950/20' : 'bg-slate-50'
        }`}>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-950 dark:text-white">{draft.title}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
                {draft.version}
              </span>
            </div>
            <p className="text-[11px] text-slate-800 dark:text-slate-400 font-medium mt-0.5">
              测试范围：{draft.scope} · 包含 {draft.cases.length} 条高覆盖四段论用例
            </p>
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyXmind}
              title="导出为脑图结构"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                mode === 'dark' ? 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200' : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-950 shadow-xs'
              }`}
            >
              <Copy className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>导出 XMind 结构</span>
            </button>

            <button
              onClick={handleExportCsv}
              title="导出为 CSV 表格"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 Excel / CSV</span>
            </button>
          </div>
        </div>

        {copiedNotification && (
          <div className="px-4 py-2 bg-emerald-500/20 text-emerald-900 dark:text-emerald-300 border-b border-emerald-500/30 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Artifact Subtabs */}
        <div className={`px-4 border-b border-inherit flex items-center justify-between text-xs ${
          mode === 'dark' ? 'bg-slate-950/10' : 'bg-slate-100'
        }`}>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('cases')}
              className={`py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'cases'
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : 'border-transparent text-slate-800 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
              }`}
            >
              <span>可执行测试用例列表</span>
              <span className={`text-[10px] px-1.5 rounded-full font-mono font-bold ${
                mode === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-950'
              }`}>
                {draft.cases.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('outline')}
              className={`py-2.5 font-bold border-b-2 transition-colors ${
                activeTab === 'outline'
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : 'border-transparent text-slate-800 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
              }`}
            >
              方案目标与测试点
            </button>
            <button
              onClick={() => setActiveTab('citations')}
              className={`py-2.5 font-bold border-b-2 transition-colors ${
                activeTab === 'citations'
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                  : 'border-transparent text-slate-800 dark:text-slate-400 hover:text-black dark:hover:text-slate-200'
              }`}
            >
              受控依据追溯与合规
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'cases' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {draft.cases.map((c) => (
                <div
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                  } space-y-3.5`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 border-inherit">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded font-mono text-xs font-bold bg-indigo-500/15 text-indigo-800 dark:text-indigo-400 border border-indigo-500/30">
                        {c.id}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-950 dark:text-white">{c.name}</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                          c.priority === 'P0'
                            ? 'bg-red-500/15 text-red-800 dark:text-red-400 border border-red-500/30'
                            : 'bg-amber-500/15 text-amber-900 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {c.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        mode === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-white text-slate-900 border-slate-300'
                      }`}>
                        {c.type}
                      </span>
                    </div>
                  </div>

                  {/* Precondition */}
                  <div className="text-xs">
                    <span className="font-bold text-slate-950 dark:text-slate-400 block mb-1">【前置条件】</span>
                    <p className={`leading-relaxed p-2.5 rounded-xl border font-medium ${
                      mode === 'dark' ? 'bg-slate-900/30 border-slate-800/60 text-slate-300' : 'bg-white border-slate-300 text-slate-950'
                    }`}>
                      {c.precondition}
                    </p>
                  </div>

                  {/* Step by step */}
                  <div className="text-xs">
                    <span className="font-bold text-slate-950 dark:text-slate-400 block mb-1">【执行步骤】</span>
                    <div className="space-y-1 text-slate-950 dark:text-slate-300 font-medium">
                      {c.steps.map((step, idx) => (
                        <div key={idx} className="leading-relaxed pl-1">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expected Result */}
                  <div className={`text-xs p-3 rounded-xl border ${
                    mode === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  }`}>
                    <span className="font-bold block mb-1 text-emerald-800 dark:text-emerald-400">【定量预期结果 (Expected Value)】</span>
                    <p className="leading-relaxed font-semibold">{c.expectedResult}</p>
                  </div>

                  {/* Traceability */}
                  <div className="flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-400 pt-1 font-semibold">
                    <span className="font-mono">追溯源：{c.traceability}</span>
                    <span className="text-emerald-800 dark:text-emerald-400 font-bold">已对齐 IEC 62304</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'outline' && (
            <div className="max-w-4xl mx-auto space-y-6 text-xs text-slate-950 dark:text-slate-300 font-medium">
              <div className={`p-5 rounded-2xl border ${mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'} space-y-3`}>
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">测试目标与验证准则</h3>
                <p className="leading-relaxed">{draft.objective}</p>
              </div>

              <div className={`p-5 rounded-2xl border ${mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'} space-y-3`}>
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">测试范围规划</h3>
                <ul className="list-disc pl-5 space-y-1.5">
                  {draft.scopeList.map((s, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-5 rounded-2xl border ${mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'} space-y-3`}>
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">提炼的核心测试点清单</h3>
                <div className="space-y-2">
                  {draft.testPoints.map((tp, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border font-semibold ${
                      mode === 'dark' ? 'bg-slate-900/40 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-950'
                    }`}>
                      {tp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'citations' && (
            <div className="max-w-4xl mx-auto space-y-4 text-xs">
              <div className="border-b pb-3 border-inherit">
                <h3 className="font-extrabold text-sm text-slate-950 dark:text-white">本测试方案关联的受控规范依据</h3>
                <p className="text-slate-800 dark:text-slate-400 font-medium">
                  支持医疗器械注册申报与 FDA / NMPA 体系飞行检查追溯
                </p>
              </div>

              <div className="space-y-2.5">
                {draft.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span className="font-bold text-slate-950 dark:text-white">{cite}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30">
                      已核验
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
