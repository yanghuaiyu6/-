import {
  FileText,
  FileCode2,
  FileJson,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Bookmark,
  Folder,
  LucideIcon
} from 'lucide-react';
import { DocCategoryConfig } from '../types';

export const DEFAULT_DOC_CATEGORIES: DocCategoryConfig[] = [
  {
    id: 'cat-req',
    name: '需求',
    description: '软件需求规格说明书(SRS)、用户需求(URD)与临床功能边界定义',
    color: 'indigo',
    icon: 'FileText',
    isDefault: true
  },
  {
    id: 'cat-design',
    name: '设计',
    description: '系统架构设计说明(SDD)、硬件驱动接口与状态机互锁模型',
    color: 'purple',
    icon: 'FileCode2',
    isDefault: true
  },
  {
    id: 'cat-proto',
    name: '协议',
    description: '上下位机双工通信协议、CAN-FD总线报文与LIS数据格式规范',
    color: 'cyan',
    icon: 'FileJson',
    isDefault: true
  },
  {
    id: 'cat-risk',
    name: '风险',
    description: 'ISO 14971风险控制追溯表、失效模式(FMEA)与安全联锁降级规范',
    color: 'amber',
    icon: 'ShieldCheck',
    isDefault: true
  },
  {
    id: 'cat-test',
    name: '测试',
    description: '自动化验证规程、测试计划大纲、边界验证用例与回归基准集',
    color: 'emerald',
    icon: 'FileSpreadsheet',
    isDefault: true
  }
];

export interface CategoryColorOption {
  id: string;
  key: string;
  name: string;
  label: string;
  hex: string;
  colorHex: string;
}

export const CATEGORY_COLOR_OPTIONS: CategoryColorOption[] = [
  { id: 'indigo', key: 'indigo', name: '靛蓝 (需求/核心)', label: '靛蓝 (需求/核心)', hex: '#6366f1', colorHex: '#6366f1' },
  { id: 'purple', key: 'purple', name: '罗兰紫 (架构/设计)', label: '罗兰紫 (架构/设计)', hex: '#a855f7', colorHex: '#a855f7' },
  { id: 'cyan', key: 'cyan', name: '青绿 (协议/接口)', label: '青绿 (协议/接口)', hex: '#06b6d4', colorHex: '#06b6d4' },
  { id: 'amber', key: 'amber', name: '琥珀橙 (风险/安全)', label: '琥珀橙 (风险/安全)', hex: '#f59e0b', colorHex: '#f59e0b' },
  { id: 'emerald', key: 'emerald', name: '翡翠绿 (测试/合规)', label: '翡翠绿 (测试/合规)', hex: '#10b981', colorHex: '#10b981' },
  { id: 'rose', key: 'rose', name: '蔷薇红 (异常/缺陷)', label: '蔷薇红 (异常/缺陷)', hex: '#f43f5e', colorHex: '#f43f5e' },
  { id: 'blue', key: 'blue', name: '深海蓝 (标准/法规)', label: '深海蓝 (标准/法规)', hex: '#3b82f6', colorHex: '#3b82f6' },
  { id: 'teal', key: 'teal', name: '碧青 (临床/试验)', label: '碧青 (临床/试验)', hex: '#14b8a6', colorHex: '#14b8a6' }
];

export interface CategoryIconOption {
  id: string;
  key: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { id: 'FileText', key: 'FileText', label: '文本文档 (SRS/标准)', icon: FileText },
  { id: 'FileCode2', key: 'FileCode2', label: '代码架构 (SDD/驱动)', icon: FileCode2 },
  { id: 'FileJson', key: 'FileJson', label: '数据协议 (JSON/报文)', icon: FileJson },
  { id: 'ShieldCheck', key: 'ShieldCheck', label: '安全风险 (ISO 14971)', icon: ShieldCheck },
  { id: 'FileSpreadsheet', key: 'FileSpreadsheet', label: '测试表格 (用例/规程)', icon: FileSpreadsheet },
  { id: 'Layers', key: 'Layers', label: '层级结构 (模块/体系)', icon: Layers },
  { id: 'Bookmark', key: 'Bookmark', label: '重要规范 (指引/准则)', icon: Bookmark },
  { id: 'Folder', key: 'Folder', label: '综合归档 (通用资料)', icon: Folder }
];

export interface CategoryVisualTheme {
  badge: string;
  dot: string;
  iconBg: string;
  iconText: string;
  bg: string;
  text: string;
  border: string;
  lightBg: string;
  activePill: string;
}

export const CATEGORY_COLOR_MAP: Record<string, CategoryVisualTheme> = {
  indigo: {
    badge: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
    dot: 'bg-indigo-500',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    iconText: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/30',
    lightBg: 'bg-indigo-500/10',
    activePill: 'bg-indigo-600 text-white'
  },
  purple: {
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dot: 'bg-purple-500',
    iconBg: 'bg-purple-50 dark:bg-purple-950/40',
    iconText: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
    lightBg: 'bg-purple-500/10',
    activePill: 'bg-purple-600 text-white'
  },
  cyan: {
    badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    dot: 'bg-cyan-500',
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-500/30',
    lightBg: 'bg-cyan-500/10',
    activePill: 'bg-cyan-600 text-white'
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
    lightBg: 'bg-amber-500/10',
    activePill: 'bg-amber-600 text-white'
  },
  emerald: {
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
    lightBg: 'bg-emerald-500/10',
    activePill: 'bg-emerald-600 text-white'
  },
  rose: {
    badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    dot: 'bg-rose-500',
    iconBg: 'bg-rose-50 dark:bg-rose-950/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-500/30',
    lightBg: 'bg-rose-500/10',
    activePill: 'bg-rose-600 text-white'
  },
  blue: {
    badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    dot: 'bg-blue-500',
    iconBg: 'bg-blue-50 dark:bg-blue-950/40',
    iconText: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
    lightBg: 'bg-blue-500/10',
    activePill: 'bg-blue-600 text-white'
  },
  teal: {
    badge: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
    dot: 'bg-teal-500',
    iconBg: 'bg-teal-50 dark:bg-teal-950/40',
    iconText: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-500/30',
    lightBg: 'bg-teal-500/10',
    activePill: 'bg-teal-600 text-white'
  }
};

export const getCategoryVisualTheme = (color?: string): CategoryVisualTheme => {
  if (color && CATEGORY_COLOR_MAP[color]) {
    return CATEGORY_COLOR_MAP[color];
  }
  return CATEGORY_COLOR_MAP.indigo;
};

export const findCategoryByName = (
  name: string,
  categories: DocCategoryConfig[] = DEFAULT_DOC_CATEGORIES
): DocCategoryConfig | undefined => {
  return categories.find((c) => c.name === name || c.id === name);
};

