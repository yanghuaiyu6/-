import React, { useState, useEffect } from 'react';
import {
  Settings,
  X,
  Check,
  Cpu,
  Palette,
  Sun,
  Moon,
  Layout,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  Trash2,
  Database,
  MessageSquare,
  AlertTriangle,
  HardDrive,
  Plus,
  Pencil,
  Server,
  Globe,
  Tag,
  AlertCircle,
  Briefcase,
  FolderGit2,
  FileText,
  Copy,
  ChevronRight,
  ExternalLink,
  Layers,
  FileCode2,
  FileJson,
  FileSpreadsheet,
  Bookmark,
  Folder,
  FlaskConical
} from 'lucide-react';
import { AiConfig, ThemeType, ModeType, NavLayout, ChatSession, AiModelPreset, ProjectItem, DocCategoryConfig } from '../types';
import { AI_MODEL_PRESETS, DEFAULT_AI_CONFIG } from '../data/aiPresets';
import {
  DEFAULT_DOC_CATEGORIES,
  CATEGORY_COLOR_OPTIONS,
  CATEGORY_ICON_OPTIONS,
  getCategoryVisualTheme
} from '../data/mockCategories';

export type SettingsTab = 'projects' | 'categories' | 'model' | 'appearance' | 'data';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: SettingsTab;
  config: AiConfig;
  onSaveConfig: (newConfig: AiConfig) => void;
  theme: ThemeType;
  onSelectTheme: (theme: ThemeType) => void;
  mode: ModeType;
  onSelectMode: (mode: ModeType) => void;
  navLayout: NavLayout;
  onSelectNavLayout: (layout: NavLayout) => void;
  sessions?: ChatSession[];
  onClearAllChatSessions?: () => void;
  onResetSampleSessions?: () => void;
  models?: AiModelPreset[];
  onSaveModels?: (newModels: AiModelPreset[]) => void;
  onResetDefaultModels?: () => void;
  projects?: ProjectItem[];
  activeProjectId?: string;
  onSelectProject?: (projectId: string) => void;
  onUpdateProject?: (updatedProject: ProjectItem) => void;
  onDeleteProject?: (projectId: string) => void;
  onCreateProject?: (newProject: Omit<ProjectItem, 'id'> & { id?: string }) => void;
  categories?: DocCategoryConfig[];
  onSaveCategories?: (newCategories: DocCategoryConfig[]) => void;
  onResetDefaultCategories?: () => void;
  onRenameCategoryInDocs?: (oldName: string, newName: string) => void;
  onReassignDocsCategory?: (fromCategory: string, toCategory: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'projects',
  config,
  onSaveConfig,
  theme,
  onSelectTheme,
  mode,
  onSelectMode,
  navLayout,
  onSelectNavLayout,
  sessions = [],
  onClearAllChatSessions,
  onResetSampleSessions,
  models: externalModels,
  onSaveModels,
  onResetDefaultModels,
  projects = [],
  activeProjectId = '',
  onSelectProject,
  onUpdateProject,
  onDeleteProject,
  onCreateProject,
  categories: externalCategories,
  onSaveCategories,
  onResetDefaultCategories,
  onRenameCategoryInDocs,
  onReassignDocsCategory
}) => {
  const validTabs: SettingsTab[] = ['projects', 'categories', 'model', 'appearance', 'data'];
  const sanitizedDefaultTab = (typeof defaultTab === 'string' && validTabs.includes(defaultTab as SettingsTab))
    ? (defaultTab as SettingsTab)
    : 'projects';

  const [activeTab, setActiveTab] = useState<SettingsTab>(sanitizedDefaultTab);
  const [formConfig, setFormConfig] = useState<AiConfig>(config);
  const [localModels, setLocalModels] = useState<AiModelPreset[]>(externalModels || AI_MODEL_PRESETS);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('已保存设置');
  const [confirmClearData, setConfirmClearData] = useState(false);

  // Model Form Modal State (Add / Edit)
  const [isEditingModel, setIsEditingModel] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [modelFormData, setModelFormData] = useState({
    name: '',
    badge: '自定义基座',
    desc: '',
    defaultEndpoint: 'https://',
    contextWindow: '128K Tokens',
    strengthsText: '私有部署, 业务对齐, 严格测试'
  });
  const [modelFormError, setModelFormError] = useState('');

  // Delete Model Confirmation
  const [deletingModelId, setDeletingModelId] = useState<string | null>(null);

  // Project Form State (Add / Edit)
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectFormMode, setProjectFormMode] = useState<'create' | 'edit'>('create');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectFormData, setProjectFormData] = useState({
    name: '',
    code: '',
    version: 'V1.0',
    category: '血液学 / 激光流式',
    standard: 'IEC 62304 Class B / ISO 14971',
    description: '',
    template: 'medical' as 'medical' | 'clean'
  });
  const [projectFormError, setProjectFormError] = useState('');
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const models = externalModels || localModels;

  // Controlled Document Categories State
  const [localCategories, setLocalCategories] = useState<DocCategoryConfig[]>(
    externalCategories || DEFAULT_DOC_CATEGORIES
  );
  const categories = externalCategories || localCategories;

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    color: 'indigo',
    icon: 'FileText'
  });
  const [categoryFormError, setCategoryFormError] = useState('');
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [reassignTargetCategory, setReassignTargetCategory] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const initialTab = (typeof defaultTab === 'string' && validTabs.includes(defaultTab as SettingsTab))
        ? (defaultTab as SettingsTab)
        : 'projects';
      setActiveTab(initialTab);
      setConfirmClearData(false);
      setIsEditingModel(false);
      setIsEditingCategory(false);
      setIsEditingProject(false);
      setDeletingModelId(null);
      setDeletingCategoryId(null);
      setDeletingProjectId(null);
      setFormConfig(config);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (externalModels) {
      setLocalModels(externalModels);
    }
  }, [externalModels]);

  useEffect(() => {
    if (externalCategories) {
      setLocalCategories(externalCategories);
    }
  }, [externalCategories]);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  // Category Management Handlers
  const handleOpenCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({
      name: '',
      description: '',
      color: 'indigo',
      icon: 'FileText'
    });
    setCategoryFormError('');
    setIsEditingCategory(true);
  };

  const handleOpenEditCategory = (cat: DocCategoryConfig) => {
    setEditingCategoryId(cat.id);
    setCategoryFormData({
      name: cat.name,
      description: cat.description || '',
      color: cat.color || 'indigo',
      icon: cat.icon || 'FileText'
    });
    setCategoryFormError('');
    setIsEditingCategory(true);
  };

  const handleSaveCategoryForm = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = categoryFormData.name.trim();
    if (!trimmedName) {
      setCategoryFormError('分类名称不能为空');
      return;
    }

    const duplicate = categories.some(
      (c) => c.name === trimmedName && c.id !== editingCategoryId
    );
    if (duplicate) {
      setCategoryFormError(`已存在同名分类「${trimmedName}」，请使用其他名称`);
      return;
    }

    if (editingCategoryId) {
      const targetCat = categories.find((c) => c.id === editingCategoryId);
      const oldName = targetCat?.name;
      const updatedList = categories.map((c) =>
        c.id === editingCategoryId
          ? {
              ...c,
              name: trimmedName,
              description: categoryFormData.description.trim(),
              color: categoryFormData.color,
              icon: categoryFormData.icon
            }
          : c
      );

      if (oldName && oldName !== trimmedName) {
        onRenameCategoryInDocs?.(oldName, trimmedName);
      }

      setLocalCategories(updatedList);
      onSaveCategories?.(updatedList);
      triggerToast(`已更新受控分类「${trimmedName}」`);
    } else {
      const newCat: DocCategoryConfig = {
        id: `cat-${Date.now()}`,
        name: trimmedName,
        description: categoryFormData.description.trim() || '自定义受控知识资产分类',
        color: categoryFormData.color,
        icon: categoryFormData.icon,
        isDefault: false
      };
      const updatedList = [...categories, newCat];
      setLocalCategories(updatedList);
      onSaveCategories?.(updatedList);
      triggerToast(`已新建受控分类「${trimmedName}」`);
    }

    setIsEditingCategory(false);
    setCategoryFormError('');
  };

  const handleConfirmDeleteCategory = (catId: string) => {
    if (categories.length <= 1) {
      triggerToast('系统至少需保留一个受控资产分类');
      return;
    }
    const catToDelete = categories.find((c) => c.id === catId);
    if (!catToDelete) return;

    const remaining = categories.filter((c) => c.id !== catId);
    const targetFallback = reassignTargetCategory || remaining[0]?.name;

    if (targetFallback && catToDelete.name) {
      onReassignDocsCategory?.(catToDelete.name, targetFallback);
    }

    setLocalCategories(remaining);
    onSaveCategories?.(remaining);
    setDeletingCategoryId(null);
    triggerToast(`已删除受控分类「${catToDelete.name}」${targetFallback ? `，关联文档已归入「${targetFallback}」` : ''}`);
  };

  const handleResetDefaultCategories = () => {
    setLocalCategories(DEFAULT_DOC_CATEGORIES);
    onSaveCategories?.(DEFAULT_DOC_CATEGORIES);
    onResetDefaultCategories?.();
    triggerToast('已重置恢复为系统预置标准受控分类');
  };

  // Project Management Handlers
  const handleOpenCreateProject = () => {
    setProjectFormMode('create');
    setEditingProjectId(null);
    setProjectFormData({
      name: '',
      code: '',
      version: 'V1.0',
      category: '血液学 / 激光流式',
      standard: 'IEC 62304 Class B / ISO 14971',
      description: '',
      template: 'medical'
    });
    setProjectFormError('');
    setIsEditingProject(true);
  };

  const handleOpenEditProject = (proj: ProjectItem) => {
    setProjectFormMode('edit');
    setEditingProjectId(proj.id);
    setProjectFormData({
      name: proj.name,
      code: proj.code,
      version: proj.version,
      category: proj.category,
      standard: proj.standard,
      description: proj.description,
      template: 'medical'
    });
    setProjectFormError('');
    setIsEditingProject(true);
  };

  const handleSaveProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectFormData.name.trim()) {
      setProjectFormError('项目名称为必填项');
      return;
    }
    if (!projectFormData.code.trim()) {
      setProjectFormError('项目代号/型号为必填项');
      return;
    }

    if (projectFormMode === 'create') {
      onCreateProject?.({
        name: projectFormData.name.trim(),
        code: projectFormData.code.trim().toUpperCase(),
        version: projectFormData.version.trim() || 'V1.0',
        category: projectFormData.category.trim() || '医疗器械受控系统',
        standard: projectFormData.standard.trim() || 'IEC 62304 / ISO 14971',
        description: projectFormData.description.trim() || '新创建的受控医疗软件工程项目，具备隔离的受控知识资产与测试集。',
        updatedAt: '刚刚创建',
        documents: [],
        selectedDocId: '',
        sessions: [],
        currentSessionId: ''
      });
      triggerToast(`已创建项目：${projectFormData.name.trim()}`);
    } else if (projectFormMode === 'edit' && editingProjectId) {
      const existing = projects.find((p) => p.id === editingProjectId);
      if (existing) {
        const updated: ProjectItem = {
          ...existing,
          name: projectFormData.name.trim(),
          code: projectFormData.code.trim().toUpperCase(),
          version: projectFormData.version.trim() || existing.version,
          category: projectFormData.category.trim() || existing.category,
          standard: projectFormData.standard.trim() || existing.standard,
          description: projectFormData.description.trim() || existing.description,
          updatedAt: '刚刚修改'
        };
        onUpdateProject?.(updated);
        triggerToast(`已更新项目：${updated.name}`);
      }
    }
    setIsEditingProject(false);
  };

  const handleConfirmDeleteProject = (projId: string) => {
    const target = projects.find((p) => p.id === projId);
    if (!target) return;
    if (projects.length <= 1) {
      triggerToast('系统至少需要保留一个项目');
      return;
    }
    onDeleteProject?.(projId);
    setDeletingProjectId(null);
    triggerToast(`已删除项目：${target.name}`);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = models.find((p) => p.id === presetId);
    if (!preset) return;
    const updated = {
      ...formConfig,
      provider: presetId,
      modelName: preset.name,
      endpointUrl: preset.defaultEndpoint
    };
    setFormConfig(updated);
    // Instant base switch
    onSaveConfig(updated);
    triggerToast(`已切换推理基座为：${preset.name.split(' ')[0]}`);
  };

  const handleOpenAddModel = () => {
    setEditingModelId(null);
    setModelFormData({
      name: '',
      badge: '私有接入',
      desc: '',
      defaultEndpoint: 'https://ai-gateway.internal.med/v1/models/custom-model',
      contextWindow: '128K Tokens',
      strengthsText: '本地部署, 医疗规约对齐, 高吞吐'
    });
    setModelFormError('');
    setIsEditingModel(true);
  };

  const handleOpenEditModel = (e: React.MouseEvent, model: AiModelPreset) => {
    e.stopPropagation();
    setEditingModelId(model.id);
    setModelFormData({
      name: model.name,
      badge: model.badge || '自定义基座',
      desc: model.desc || '',
      defaultEndpoint: model.defaultEndpoint || '',
      contextWindow: model.contextWindow || '128K Tokens',
      strengthsText: model.strengths ? model.strengths.join(', ') : ''
    });
    setModelFormError('');
    setIsEditingModel(true);
  };

  const handleSaveModelForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelFormData.name.trim()) {
      setModelFormError('请输入模型名称');
      return;
    }
    if (!modelFormData.defaultEndpoint.trim()) {
      setModelFormError('请输入模型接入地址');
      return;
    }

    const strengths = modelFormData.strengthsText
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedModels: AiModelPreset[];

    if (editingModelId) {
      // Editing existing model
      updatedModels = models.map((m) => {
        if (m.id === editingModelId) {
          return {
            ...m,
            name: modelFormData.name.trim(),
            badge: modelFormData.badge.trim() || '自定义基座',
            desc: modelFormData.desc.trim() || '自定义配置的大语言模型基座',
            defaultEndpoint: modelFormData.defaultEndpoint.trim(),
            contextWindow: modelFormData.contextWindow.trim() || '128K Tokens',
            strengths: strengths.length > 0 ? strengths : ['自定义推理基座']
          };
        }
        return m;
      });

      // If the edited model is currently active, update active config name
      if (formConfig.provider === editingModelId) {
        const updatedConfig = {
          ...formConfig,
          modelName: modelFormData.name.trim(),
          endpointUrl: modelFormData.defaultEndpoint.trim()
        };
        setFormConfig(updatedConfig);
        onSaveConfig(updatedConfig);
      }

      triggerToast('模型基座配置已更新');
    } else {
      // Adding new model
      const newModelId = `custom-model-${Date.now()}`;
      const newModel: AiModelPreset = {
        id: newModelId,
        name: modelFormData.name.trim(),
        badge: modelFormData.badge.trim() || '自定义基座',
        desc: modelFormData.desc.trim() || '用户自定义新增的大语言模型基座',
        defaultEndpoint: modelFormData.defaultEndpoint.trim(),
        contextWindow: modelFormData.contextWindow.trim() || '128K Tokens',
        strengths: strengths.length > 0 ? strengths : ['自定义推理基座'],
        isCustom: true
      };

      updatedModels = [...models, newModel];

      // Auto switch to newly added model
      const updatedConfig = {
        ...formConfig,
        provider: newModelId,
        modelName: newModel.name,
        endpointUrl: newModel.defaultEndpoint
      };
      setFormConfig(updatedConfig);
      onSaveConfig(updatedConfig);
      triggerToast('已成功添加并激活新 AI 基座');
    }

    setLocalModels(updatedModels);
    if (onSaveModels) {
      onSaveModels(updatedModels);
    }
    setIsEditingModel(false);
  };

  const handleDeleteModel = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    if (models.length <= 1) {
      triggerToast('至少需要保留一个 AI 模型基座');
      return;
    }

    const targetModel = models.find((m) => m.id === modelId);
    const updatedModels = models.filter((m) => m.id !== modelId);
    setLocalModels(updatedModels);
    if (onSaveModels) {
      onSaveModels(updatedModels);
    }

    // If currently selected model is deleted, safely switch to the first available model
    if (formConfig.provider === modelId) {
      const fallback = updatedModels[0];
      const updatedConfig = {
        ...formConfig,
        provider: fallback.id,
        modelName: fallback.name,
        endpointUrl: fallback.defaultEndpoint
      };
      setFormConfig(updatedConfig);
      onSaveConfig(updatedConfig);
    }

    setDeletingModelId(null);
    triggerToast(`已移除模型基座：${targetModel?.name.split(' ')[0] || ''}`);
  };

  const handleResetToDefaultModels = () => {
    setLocalModels(AI_MODEL_PRESETS);
    if (onSaveModels) {
      onSaveModels(AI_MODEL_PRESETS);
    }
    if (onResetDefaultModels) {
      onResetDefaultModels();
    }
    // Switch to first default model
    const defaultModel = AI_MODEL_PRESETS[0];
    const updatedConfig = {
      ...formConfig,
      provider: defaultModel.id,
      modelName: defaultModel.name,
      endpointUrl: defaultModel.defaultEndpoint
    };
    setFormConfig(updatedConfig);
    onSaveConfig(updatedConfig);
    triggerToast('已恢复预设官方模型基座库');
  };

  const handleSave = () => {
    onSaveConfig(formConfig);
    triggerToast('已保存并生效');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleResetDefault = () => {
    setFormConfig(DEFAULT_AI_CONFIG);
    onSaveConfig(DEFAULT_AI_CONFIG);
    triggerToast('已重置为默认基座参数');
  };

  const handleConfirmClearChat = () => {
    if (onClearAllChatSessions) {
      onClearAllChatSessions();
      setConfirmClearData(false);
      triggerToast('已成功清空所有历史对话数据');
    }
  };

  const handleConfirmResetSamples = () => {
    if (onResetSampleSessions) {
      onResetSampleSessions();
      triggerToast('已恢复预设示例对话');
    }
  };

  const totalMessagesCount = sessions.reduce((acc, s) => acc + (s.messages?.length || 0), 0);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl transition-all flex flex-col max-h-[90vh] overflow-hidden ${
          mode === 'dark'
            ? 'bg-slate-900 border-slate-700/80 text-slate-100'
            : 'bg-white border-slate-300 text-slate-950'
        }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-3.5 border-b border-inherit shrink-0 ${
          mode === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Settings className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">系统设置</h3>
          </div>
          <button
            id="btn-close-settings"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className={`flex items-center px-6 border-b border-inherit gap-3 shrink-0 overflow-x-auto scrollbar-none ${
          mode === 'dark' ? 'bg-slate-950/20' : 'bg-white'
        }`}>
          <button
            id="tab-btn-projects-settings"
            onClick={() => {
              setActiveTab('projects');
              setIsEditingModel(false);
              setIsEditingProject(false);
              setIsEditingCategory(false);
            }}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span>受控项目</span>
          </button>

          <button
            id="tab-btn-categories-settings"
            onClick={() => {
              setActiveTab('categories');
              setIsEditingModel(false);
              setIsEditingProject(false);
              setIsEditingCategory(false);
            }}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>资产分类</span>
          </button>

          <button
            id="tab-btn-model-settings"
            onClick={() => {
              setActiveTab('model');
              setIsEditingModel(false);
              setIsEditingProject(false);
              setIsEditingCategory(false);
            }}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'model'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>AI 模型基座</span>
          </button>

          <button
            id="tab-btn-appearance-settings"
            onClick={() => {
              setActiveTab('appearance');
              setIsEditingModel(false);
              setIsEditingProject(false);
            }}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'appearance'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span>界面外观</span>
          </button>

          <button
            id="tab-btn-data-settings"
            onClick={() => {
              setActiveTab('data');
              setIsEditingModel(false);
              setIsEditingProject(false);
            }}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'data'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span>存储数据</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* TAB 0: PROJECT MANAGEMENT */}
          {activeTab === 'projects' && (
            <div className="space-y-3">
              {isEditingProject ? (
                /* Project Creation / Editing Form */
                <div
                  id="project-edit-form"
                  className={`p-4 rounded-xl border space-y-3 ${
                    mode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-inherit">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {projectFormMode === 'create' ? '新建受控工程项目' : `修改项目：${projectFormData.name}`}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setIsEditingProject(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      取消
                    </button>
                  </div>

                  {projectFormError && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                      {projectFormError}
                    </div>
                  )}

                  <form onSubmit={handleSaveProject} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          项目名称 *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectFormData.name}
                          onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                          placeholder="例如：全自动生化分析仪"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          项目代号 / 型号 *
                        </label>
                        <input
                          type="text"
                          required
                          value={projectFormData.code}
                          onChange={(e) => setProjectFormData({ ...projectFormData, code: e.target.value })}
                          placeholder="例如：BIO-200"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          版本编号
                        </label>
                        <input
                          type="text"
                          value={projectFormData.version}
                          onChange={(e) => setProjectFormData({ ...projectFormData, version: e.target.value })}
                          placeholder="例如：V1.0"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          合规与质量标准
                        </label>
                        <input
                          type="text"
                          value={projectFormData.standard}
                          onChange={(e) => setProjectFormData({ ...projectFormData, standard: e.target.value })}
                          placeholder="例如：IEC 62304 / ISO 14971"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        项目描述
                      </label>
                      <textarea
                        rows={2}
                        value={projectFormData.description}
                        onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                        placeholder="描述该受控项目的核心功能与应用范围..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-inherit">
                      <button
                        type="button"
                        onClick={() => setIsEditingProject(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        取消
                      </button>
                      <button
                        type="submit"
                        id="btn-save-project-form"
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
                      >
                        {projectFormMode === 'create' ? '创建项目' : '保存'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Projects List */
                <div className="space-y-2.5">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-1">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      受控项目清单 ({projects.length})
                    </span>
                    <button
                      type="button"
                      id="btn-settings-create-project"
                      onClick={handleOpenCreateProject}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>新建项目</span>
                    </button>
                  </div>

                  {/* Projects Rows */}
                  <div className="space-y-2">
                    {projects.map((proj) => {
                      const isActive = proj.id === activeProjectId;
                      const isConfirmingDelete = deletingProjectId === proj.id;

                      return (
                        <div
                          key={proj.id}
                          id={`project-card-${proj.id}`}
                          className={`p-3 rounded-xl border transition-all ${
                            isActive
                              ? mode === 'dark'
                                ? 'bg-slate-900 border-indigo-500'
                                : 'bg-indigo-50/50 border-indigo-400'
                              : mode === 'dark'
                              ? 'bg-slate-900/60 border-slate-800'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-xs text-slate-950 dark:text-white">
                                  {proj.name}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                  [{proj.code}]
                                </span>
                                {isActive && (
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    ✓ 当前项目
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-1">
                                {proj.description || '暂无描述'}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                <span>{proj.standard}</span>
                                <span>·</span>
                                <span>{proj.documents?.length || 0} 份文档</span>
                                <span>·</span>
                                <span>{proj.testDraft?.cases?.length || 0} 条用例</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 self-center">
                              {!isActive && (
                                <button
                                  type="button"
                                  id={`btn-activate-proj-${proj.id}`}
                                  onClick={() => {
                                    onSelectProject?.(proj.id);
                                    triggerToast(`已切换至项目：${proj.name}`);
                                  }}
                                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  设为当前
                                </button>
                              )}
                              <button
                                type="button"
                                id={`btn-edit-proj-${proj.id}`}
                                onClick={() => handleOpenEditProject(proj)}
                                title="编辑项目"
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                id={`btn-delete-proj-${proj.id}`}
                                onClick={() => {
                                  if (projects.length <= 1) {
                                    triggerToast('系统至少需保留一个项目');
                                    return;
                                  }
                                  setDeletingProjectId(isConfirmingDelete ? null : proj.id);
                                }}
                                disabled={projects.length <= 1}
                                title="删除项目"
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  projects.length <= 1
                                    ? 'opacity-30 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:border-rose-300'
                                }`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Delete Confirmation */}
                          {isConfirmingDelete && (
                            <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400">
                              <span>确定删除「{proj.name}」及其中所有文档与会话吗？</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setDeletingProjectId(null)}
                                  className="px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                  取消
                                </button>
                                <button
                                  type="button"
                                  id={`btn-confirm-delete-proj-${proj.id}`}
                                  onClick={() => handleConfirmDeleteProject(proj.id)}
                                  className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500"
                                >
                                  确认删除
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Controlled Document Category Management Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-3">
              {/* Category Top Action Bar */}
              <div className="flex items-center justify-between pb-1">
                <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                  资产分类规范 ({categories.length})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-reset-categories-default"
                    onClick={handleResetDefaultCategories}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    恢复默认
                  </button>
                  <button
                    id="btn-create-category-top"
                    onClick={handleOpenCreateCategory}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>新建分类</span>
                  </button>
                </div>
              </div>

              {/* Create / Edit Category Form */}
              {isEditingCategory && (
                <form
                  onSubmit={handleSaveCategoryForm}
                  className={`p-4 rounded-xl border space-y-3 ${
                    mode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-inherit">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {editingCategoryId ? '编辑分类' : '新建分类'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingCategory(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      取消
                    </button>
                  </div>

                  {categoryFormError && (
                    <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                      {categoryFormError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        分类名称 *
                      </label>
                      <input
                        type="text"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        placeholder="例如：临床评价、接口协议"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        色彩标识
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {CATEGORY_COLOR_OPTIONS.map((c) => (
                          <button
                            type="button"
                            key={c.key}
                            onClick={() => setCategoryFormData({ ...categoryFormData, color: c.key })}
                            className={`px-2 py-0.5 rounded text-[11px] border transition-colors ${
                              categoryFormData.color === c.key
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      分类说明
                    </label>
                    <input
                      type="text"
                      value={categoryFormData.description}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                      placeholder="简述该分类容纳的工程文档范围..."
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-inherit">
                    <button
                      type="button"
                      onClick={() => setIsEditingCategory(false)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      保存
                    </button>
                  </div>
                </form>
              )}

              {/* Categories Simple Rows */}
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const activeProjDocs = projects.find(p => p.id === activeProjectId)?.documents?.filter(d => d.category === cat.name) || [];
                  const isDeleting = deletingCategoryId === cat.id;
                  const otherCategories = categories.filter(c => c.id !== cat.id);

                  return (
                    <div
                      key={cat.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                        mode === 'dark'
                          ? 'bg-slate-900/60 border-slate-800'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-950 dark:text-white">
                            {cat.name}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {cat.description || '无具体说明'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({activeProjDocs.length} 份文档)
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            id={`btn-edit-category-${cat.id}`}
                            onClick={() => handleOpenEditCategory(cat)}
                            title="编辑"
                            className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`btn-delete-category-${cat.id}`}
                            onClick={() => {
                              setDeletingCategoryId(cat.id);
                              setReassignTargetCategory(otherCategories[0]?.name || '');
                            }}
                            title="删除"
                            disabled={categories.length <= 1}
                            className={`p-1 rounded ${
                              categories.length <= 1 ? 'opacity-30 cursor-not-allowed' : 'text-slate-500 hover:text-rose-600'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Delete Confirmation */}
                      {isDeleting && (
                        <div className="mt-1 pt-1.5 border-t border-rose-200 dark:border-rose-900/50 flex flex-wrap items-center justify-between gap-2 text-xs text-rose-600 dark:text-rose-400">
                          <span>
                            删除分类「{cat.name}」？关联文档将归入：
                            <select
                              value={reassignTargetCategory}
                              onChange={(e) => setReassignTargetCategory(e.target.value)}
                              className="ml-1 px-1.5 py-0.5 rounded border text-xs font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            >
                              {otherCategories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setDeletingCategoryId(null)}
                              className="px-2 py-0.5 rounded text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              取消
                            </button>
                            <button
                              id={`btn-confirm-delete-category-${cat.id}`}
                              onClick={() => handleConfirmDeleteCategory(cat.id)}
                              className="px-2.5 py-0.5 rounded text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500"
                            >
                              确认删除
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AI MODEL BASE */}
          {activeTab === 'model' && (
            <div className="space-y-4">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>AI 模型基座 ({models.length})</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                      当前使用：{formConfig.modelName.split(' ')[0]}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    选择或配置用于测试用例推导与规范解析的底层大语言模型
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    id="btn-reset-default-models"
                    type="button"
                    onClick={handleResetToDefaultModels}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                      mode === 'dark'
                        ? 'border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50'
                    }`}
                    title="重置为默认官方预设"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>恢复默认</span>
                  </button>

                  <button
                    id="btn-add-custom-model"
                    type="button"
                    onClick={handleOpenAddModel}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>添加基座</span>
                  </button>
                </div>
              </div>

              {/* Add / Edit Form Panel */}
              {isEditingModel && (
                <form
                  onSubmit={handleSaveModelForm}
                  className={`p-3.5 rounded-xl border space-y-3 ${
                    mode === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-inherit">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {editingModelId ? '编辑模型基座配置' : '添加新的 AI 模型基座'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsEditingModel(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    >
                      取消
                    </button>
                  </div>

                  {modelFormError && (
                    <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs">
                      {modelFormError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        模型全称 * (例如: Qwen-2.5-72B / Llama-3.3)
                      </label>
                      <input
                        type="text"
                        value={modelFormData.name}
                        onChange={(e) => setModelFormData({ ...modelFormData, name: e.target.value })}
                        placeholder="输入模型名称与规格"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        特性标签 (例如: 私有部署 / 高精推理)
                      </label>
                      <input
                        type="text"
                        value={modelFormData.badge}
                        onChange={(e) => setModelFormData({ ...modelFormData, badge: e.target.value })}
                        placeholder="输入特性标签"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        API 接入地址 / Endpoint URL *
                      </label>
                      <input
                        type="text"
                        value={modelFormData.defaultEndpoint}
                        onChange={(e) => setModelFormData({ ...modelFormData, defaultEndpoint: e.target.value })}
                        placeholder="https://ai-gateway.internal/v1/..."
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        上下文窗口规格
                      </label>
                      <input
                        type="text"
                        value={modelFormData.contextWindow}
                        onChange={(e) => setModelFormData({ ...modelFormData, contextWindow: e.target.value })}
                        placeholder="例如：128K Tokens"
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        简述说明
                      </label>
                      <input
                        type="text"
                        value={modelFormData.desc}
                        onChange={(e) => setModelFormData({ ...modelFormData, desc: e.target.value })}
                        placeholder="该模型适用的工程任务..."
                        className="w-full px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-inherit">
                    <button
                      type="button"
                      onClick={() => setIsEditingModel(false)}
                      className="px-3 py-1.5 rounded-lg text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      取消
                    </button>
                    <button
                      id="btn-submit-model-form"
                      type="submit"
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      {editingModelId ? '保存修改' : '确认添加'}
                    </button>
                  </div>
                </form>
              )}

              {/* Models List - Clean Table/List View */}
              <div className="space-y-1.5">
                {models.map((preset) => {
                  const isSelected = formConfig.provider === preset.id;
                  const isDeleting = deletingModelId === preset.id;

                  // High-contrast, semantic badge styling for crystal clear readability in both light & dark modes
                  const getPresetBadgeStyle = (presetId: string, isDark: boolean) => {
                    if (presetId === 'private_medllm') {
                      return isDark
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-medium';
                    }
                    if (presetId === 'deepseek') {
                      return isDark
                        ? 'bg-blue-950/50 text-blue-300 border-blue-800/60'
                        : 'bg-blue-50 text-blue-800 border-blue-200/90 font-medium';
                    }
                    if (presetId === 'gemini') {
                      return isDark
                        ? 'bg-cyan-950/50 text-cyan-300 border-cyan-800/60'
                        : 'bg-cyan-50 text-cyan-800 border-cyan-200/90 font-medium';
                    }
                    if (presetId === 'claude') {
                      return isDark
                        ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                        : 'bg-amber-50 text-amber-800 border-amber-200/90 font-medium';
                    }
                    if (presetId === 'gpt4o') {
                      return isDark
                        ? 'bg-purple-950/50 text-purple-300 border-purple-800/60'
                        : 'bg-purple-50 text-purple-800 border-purple-200/90 font-medium';
                    }
                    return isDark
                      ? 'bg-slate-800 text-slate-300 border-slate-700/60'
                      : 'bg-slate-100 text-slate-800 border-slate-200/90 font-medium';
                  };

                  return (
                    <div
                      key={preset.id}
                      id={`card-model-${preset.id}`}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`relative p-3 rounded-xl border cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        isSelected
                          ? mode === 'dark'
                            ? 'border-indigo-500 bg-indigo-950/20'
                            : 'border-indigo-600 bg-indigo-50/70'
                          : mode === 'dark'
                          ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Radio & Model Information */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : mode === 'dark'
                              ? 'border-slate-600 bg-slate-800/50'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-xs ${mode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                              {preset.name}
                            </span>
                            {preset.badge && (
                              <span className={`px-2 py-0.5 rounded text-[10px] border ${getPresetBadgeStyle(preset.id, mode === 'dark')}`}>
                                {preset.badge}
                              </span>
                            )}
                            {preset.contextWindow && (
                              <span className={`text-[10px] font-mono ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                                {preset.contextWindow}
                              </span>
                            )}
                            {isSelected && (
                              <span className={`text-[10px] font-semibold ${mode === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                ● 生效中
                              </span>
                            )}
                          </div>
                          <div className={`text-[11px] truncate mt-0.5 ${mode === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                            {preset.desc || preset.defaultEndpoint}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div
                        className="flex items-center gap-1 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModel(e, preset)}
                          title="编辑基座"
                          className="p-1 rounded text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingModelId(preset.id)}
                          title="删除基座"
                          className="p-1 rounded text-slate-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Inline Delete Confirmation */}
                      {isDeleting && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute inset-0 rounded-xl flex items-center justify-between px-4 z-10 ${
                            mode === 'dark'
                              ? 'bg-slate-950/90 text-white'
                              : 'bg-white/95 text-slate-900 border border-rose-300 shadow-md'
                          }`}
                        >
                          <span className="text-xs">
                            确认删除基座「{preset.name}」？
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDeletingModelId(null)}
                              className="px-2 py-1 rounded text-xs text-slate-300 hover:text-white"
                            >
                              取消
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteModel(e, preset.id)}
                              className="px-2.5 py-1 rounded text-xs bg-rose-600 hover:bg-rose-500 text-white font-medium"
                            >
                              确认删除
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Advanced Parameters: Clean and Direct */}
              <div
                className={`p-3.5 rounded-xl border space-y-3 ${
                  mode === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                      推理严格度 / Temperature：
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 ml-1">
                        {formConfig.temperature}
                      </span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formConfig.temperature <= 0.2 ? '高严谨·零幻觉 (推荐)' : '探索发散'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.1"
                    value={formConfig.temperature}
                    onChange={(e) => {
                      const temp = parseFloat(e.target.value);
                      const updated = { ...formConfig, temperature: temp };
                      setFormConfig(updated);
                      onSaveConfig(updated);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>严格受控对齐 (0.0 - 0.2，适合医疗规范)</span>
                    <span>发散探索用例 (0.6 - 0.8)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2.5 border-t border-inherit">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-xs">
                      安全联锁与风险审计校验 (ISO 14971)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      生成用例时自动关联急停、防夹与溶血异常风险校验
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formConfig.strictSafetyAudit}
                    onChange={(e) => {
                      const updated = { ...formConfig, strictSafetyAudit: e.target.checked };
                      setFormConfig(updated);
                      onSaveConfig(updated);
                    }}
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer shrink-0 ml-3"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              {/* Theme Color Selection */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-2">
                  界面主色调
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {themes.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => onSelectTheme(t.id)}
                        className={`p-2.5 rounded-lg border text-left transition-colors flex items-center justify-between ${
                          isSelected
                            ? mode === 'dark'
                              ? 'border-indigo-500 bg-indigo-950/30 text-white font-bold'
                              : 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                            : mode === 'dark'
                            ? 'border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="text-xs">{t.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal mt-0.5">{t.desc}</div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {t.colors.map((c, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 rounded-full border border-black/10"
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
                <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-2">
                  明暗色彩模式
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectMode('dark')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      mode === 'dark'
                        ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 font-bold'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>暗夜工程模式 (深色)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectMode('light')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      mode === 'light'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>明亮日间模式 (浅色)</span>
                  </button>
                </div>
              </div>

              {/* Navigation Layout */}
              <div>
                <label className="text-xs font-bold text-slate-900 dark:text-slate-200 block mb-2">
                  侧边导航栏宽度
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectNavLayout('full')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      navLayout === 'full'
                        ? mode === 'dark'
                          ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 font-bold'
                          : 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                        : mode === 'dark'
                        ? 'border-slate-800 bg-slate-900/50 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5" />
                    <span>完整展开 (显示名称)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectNavLayout('compact')}
                    className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-colors ${
                      navLayout === 'compact'
                        ? mode === 'dark'
                          ? 'border-indigo-500 bg-indigo-950/30 text-indigo-300 font-bold'
                          : 'border-indigo-600 bg-indigo-50 text-indigo-950 font-bold'
                        : mode === 'dark'
                        ? 'border-slate-800 bg-slate-900/50 text-slate-400'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <Layout className="w-3.5 h-3.5 rotate-90" />
                    <span>紧凑折叠 (仅显示图标)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATA & STORAGE */}
          {activeTab === 'data' && (
            <div className="space-y-3.5">
              {/* Storage Overview */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  mode === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className="font-bold text-xs text-slate-900 dark:text-white block">
                    本地问答会话缓存
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    存储在浏览器本地存储中的历史对话记录与引用证据索引
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {sessions.length}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">个会话</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {totalMessagesCount}
                  </span>
                  <span className="text-[11px] text-slate-500 ml-1">条记录</span>
                </div>
              </div>

              {/* Chat History Management */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  mode === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    清空历史对话记录
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    清空全部已保存的问答会话，重置为一个新的空白会话
                  </span>
                </div>

                {!confirmClearData ? (
                  <button
                    id="btn-trigger-clear-chat-history"
                    type="button"
                    onClick={() => setConfirmClearData(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0 transition-colors"
                  >
                    清空记录
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setConfirmClearData(false)}
                      className="px-2.5 py-1 rounded-lg text-xs border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      取消
                    </button>
                    <button
                      id="btn-confirm-clear-chat-history"
                      type="button"
                      onClick={handleConfirmClearChat}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
                    >
                      确认清空
                    </button>
                  </div>
                )}
              </div>

              {/* Restore Sample Data */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  mode === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                    恢复系统预设示例数据
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    重新载入包含《通信中断规约》、《急诊标本插队》等经典医疗设备测试用例的示例会话
                  </span>
                </div>

                <button
                  id="btn-reset-sample-sessions"
                  type="button"
                  onClick={handleConfirmResetSamples}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors"
                >
                  恢复示例
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t border-inherit flex items-center justify-between shrink-0 ${
          mode === 'dark' ? 'bg-slate-950/20' : 'bg-slate-50'
        }`}>
          <button
            type="button"
            onClick={handleResetDefault}
            className={`flex items-center gap-1.5 text-[11px] font-bold transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置推理参数</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                mode === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              关闭
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>保存并生效</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
