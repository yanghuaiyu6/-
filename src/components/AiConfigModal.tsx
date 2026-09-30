import React, { useState } from 'react';
import {
  Cpu,
  X,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AiConfig, ThemeType, ModeType } from '../types';
import { AI_MODEL_PRESETS, DEFAULT_AI_CONFIG } from '../data/aiPresets';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AiConfig;
  onSaveConfig: (newConfig: AiConfig) => void;
  theme: ThemeType;
  mode: ModeType;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  theme,
  mode
}) => {
  const [formConfig, setFormConfig] = useState<AiConfig>(config);
  const [showSavedToast, setShowSavedToast] = useState(false);

  React.useEffect(() => {
    setFormConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (presetId: typeof formConfig.provider) => {
    const preset = AI_MODEL_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setFormConfig((prev) => ({
      ...prev,
      provider: presetId,
      modelName: preset.name,
      endpointUrl: preset.defaultEndpoint
    }));
  };

  const handleSave = () => {
    onSaveConfig(formConfig);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 300);
  };

  const handleResetDefault = () => {
    setFormConfig(DEFAULT_AI_CONFIG);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border p-5 shadow-2xl transition-all flex flex-col max-h-[85vh] ${
          mode === 'dark'
            ? 'bg-slate-900 border-slate-700 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-inherit shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AI 模型基座设置</h3>
              <p className="text-[11px] text-slate-400">选择当前问答与测试生成继承的大模型基座</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
          {/* Model selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block text-xs">
              选择基础模型
            </label>
            <div className="space-y-2">
              {AI_MODEL_PRESETS.map((preset) => {
                const isSelected = formConfig.provider === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                        : mode === 'dark'
                        ? 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100 dark:text-white">
                          {preset.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5 truncate">{preset.desc}</p>
                    </div>

                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600 text-white'
                          : 'border-slate-600 text-transparent'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple Parameters: Temperature & Strict safety */}
          <div
            className={`p-3.5 rounded-xl border space-y-3 ${
              mode === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-300 text-xs">推理严格度 (严谨 ↔ 发散)</span>
                <span className="font-mono text-indigo-400 font-semibold text-xs">
                  {formConfig.temperature <= 0.2 ? '高严谨·低幻觉' : '标准适度'}
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="0.8"
                step="0.1"
                value={formConfig.temperature}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, temperature: parseFloat(e.target.value) })
                }
                className="w-full accent-indigo-500 cursor-pointer h-1.5"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-inherit">
              <div>
                <span className="font-semibold text-slate-300 block text-xs">行业安全联锁 (ISO 14971)</span>
                <span className="text-[11px] text-slate-400">生成测试用例时自动补充安全防护校验</span>
              </div>
              <input
                type="checkbox"
                checked={formConfig.strictSafetyAudit}
                onChange={(e) =>
                  setFormConfig({ ...formConfig, strictSafetyAudit: e.target.checked })
                }
                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-inherit flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>恢复默认</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>保存</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
