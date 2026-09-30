import React from 'react';
import { Palette, X, Sun, Moon, Check, Sparkles, Layout } from 'lucide-react';
import { ThemeType, ModeType, NavLayout } from '../types';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
  mode: ModeType;
  onSelectMode: (mode: ModeType) => void;
  navLayout: NavLayout;
  onSelectNavLayout: (layout: NavLayout) => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  mode,
  onSelectMode,
  navLayout,
  onSelectNavLayout
}) => {
  if (!isOpen) return null;

  const themes: { id: ThemeType; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'aurora',
      name: '星云蓝 (Aurora Indigo)',
      desc: '科技感强、高对比度经典工程基线',
      colors: ['#6366f1', '#06b6d4', '#3b82f6']
    },
    {
      id: 'spruce',
      name: '云杉青 (Spruce Teal)',
      desc: '沉稳克制、医疗与实验室专业风格',
      colors: ['#059669', '#14b8a6', '#10b981']
    },
    {
      id: 'amber',
      name: '暖金棕 (Obsidian Amber)',
      desc: '高质感暗调黑金、温暖清晰',
      colors: ['#d97706', '#f59e0b', '#ea580c']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          mode === 'dark'
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-4 border-inherit">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">界面外观与视觉偏好</h3>
              <p className="text-[11px] text-slate-400">定制 QFlow 全流程管控平台的色彩与布局</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          {/* Theme Color Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              品牌主题色彩
            </label>
            <div className="space-y-2">
              {themes.map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTheme(t.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : mode === 'dark'
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-2">
                        <span>{t.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {t.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              明暗显示模式
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectMode('dark')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>暗夜工程模式</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectMode('light')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  mode === 'light'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-slate-100 text-slate-600'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>明亮日间模式</span>
              </button>
            </div>
          </div>

          {/* Navigation Layout */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
              导航栏空间密度
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectNavLayout('full')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  navLayout === 'full'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                <Layout className="w-4 h-4" />
                <span>完整侧边栏 (Full)</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectNavLayout('compact')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  navLayout === 'compact'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                    : 'border-slate-700 text-slate-400'
                }`}
              >
                <Layout className="w-4 h-4 rotate-90" />
                <span>紧凑收缩栏 (Compact)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-inherit flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            完成应用
          </button>
        </div>
      </div>
    </div>
  );
};
