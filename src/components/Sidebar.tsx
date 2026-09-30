import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquareCode,
  FolderGit2,
  Waypoints,
  FlaskConical,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  Check,
  Plus,
  Briefcase,
  Settings
} from 'lucide-react';
import { ViewType, ThemeType, ModeType, NavLayout, ProjectItem } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  theme: ThemeType;
  mode: ModeType;
  navLayout: NavLayout;
  onToggleNavLayout: () => void;
  onOpenSettings: (tab?: 'projects' | 'model' | 'appearance' | 'data') => void;
  onOpenAppearance?: () => void;
  onOpenAiConfig?: () => void;
  onToggleMode: () => void;
  projects: ProjectItem[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  aiModelName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  theme,
  mode,
  navLayout,
  onToggleNavLayout,
  onOpenSettings,
  onToggleMode,
  projects,
  activeProjectId,
  onSelectProject,
  aiModelName = 'Gemini 2.5 Flash'
}) => {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || {
    id: 'default',
    name: '血液分析仪 V3.2',
    code: 'HEMA-320',
    version: 'V3.2'
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

  const navItems: { key: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'home', label: '工作台首页', icon: LayoutDashboard },
    { key: 'knowledge', label: '知识智能问答', icon: MessageSquareCode },
    { key: 'documents', label: '受控知识资产', icon: FolderGit2 },
    { key: 'graph', label: '业务关系图谱', icon: Waypoints }
  ];

  const isCompact = navLayout === 'compact';

  return (
    <aside
      id="qflow-sidebar"
      className={`relative flex flex-col shrink-0 transition-all duration-300 z-30 select-none border-r ${
        isCompact ? 'w-16' : 'w-56'
      } ${
        mode === 'dark'
          ? 'bg-slate-950/95 border-slate-800/80 text-slate-200'
          : 'bg-white border-slate-300 text-slate-950 shadow-sm'
      } backdrop-blur-xl`}
    >
      {/* Brand Header */}
      {isCompact ? (
        <div className="flex flex-col items-center justify-center py-3 gap-2.5 border-b border-inherit">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              theme === 'spruce'
                ? 'bg-emerald-600 text-white'
                : theme === 'amber'
                ? 'bg-amber-600 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <button
            id="btn-toggle-sidebar"
            onClick={onToggleNavLayout}
            title="展开侧边栏"
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60' : 'text-slate-800 hover:text-black hover:bg-slate-200'
            }`}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3.5 py-3.5 border-b border-inherit">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                theme === 'spruce'
                  ? 'bg-emerald-600 text-white'
                  : theme === 'amber'
                  ? 'bg-amber-600 text-white'
                  : 'bg-indigo-600 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wider text-slate-950 dark:text-white">MACCURA</span>
                <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-800 dark:text-slate-400 font-semibold truncate">测试管控平台</p>
            </div>
          </div>

          <button
            id="btn-toggle-sidebar"
            onClick={onToggleNavLayout}
            title="收起侧边栏"
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              mode === 'dark' ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60' : 'text-slate-700 hover:text-black hover:bg-slate-200'
            }`}
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Project Switcher */}
      {!isCompact ? (
        <div ref={dropdownRef} className="relative px-3 py-2 border-b border-inherit">
          <button
            id="btn-sidebar-project-switcher"
            type="button"
            onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
            className={`w-full px-2.5 py-2 rounded-xl border text-xs flex items-center justify-between text-left transition-all group ${
              isProjectDropdownOpen
                ? mode === 'dark'
                  ? 'bg-slate-900 border-indigo-500/70 ring-1 ring-indigo-500/50'
                  : 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-300'
                : mode === 'dark'
                ? 'bg-slate-900/70 hover:bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-slate-100 hover:bg-slate-200/80 border-slate-300 text-slate-950 font-semibold'
            }`}
          >
            <div className="min-w-0 flex-1 pr-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  受控项目
                </span>
                <span className="px-1 py-0.2 text-[8px] font-mono rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  {activeProject.code || activeProject.version}
                </span>
              </div>
              <div className="font-extrabold text-xs truncate text-slate-950 dark:text-slate-100 mt-0.5">
                {activeProject.name}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover:text-slate-200">
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isProjectDropdownOpen ? 'rotate-180 text-indigo-500' : ''
                }`}
              />
            </div>
          </button>

          {/* Project Switcher Dropdown */}
          {isProjectDropdownOpen && (
            <div
              id="sidebar-project-dropdown"
              className={`absolute left-3 right-3 top-full mt-1.5 rounded-xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                mode === 'dark'
                  ? 'bg-slate-900 border-slate-700/90 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className="p-2 border-b border-inherit flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                  <span>切换项目 ({projects.length})</span>
                </span>
              </div>

              <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                {projects.map((proj) => {
                  const isSelected = proj.id === activeProjectId;
                  return (
                    <button
                      key={proj.id}
                      id={`project-option-${proj.id}`}
                      type="button"
                      onClick={() => {
                        onSelectProject(proj.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? mode === 'dark'
                            ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                            : 'bg-indigo-100 text-indigo-950 font-bold border border-indigo-300'
                          : mode === 'dark'
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs">{proj.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="font-mono">{proj.code || proj.version}</span>
                          <span>·</span>
                          <span className="truncate">{proj.documents?.length || 0} 份文档</span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-1.5 border-t border-inherit bg-slate-50 dark:bg-slate-950/40">
                <button
                  type="button"
                  id="btn-sidebar-manage-projects"
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    onOpenSettings('projects');
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    mode === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-indigo-500" />
                  <span>管理与配置项目</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div ref={dropdownRef} className="relative py-2.5 flex flex-col items-center border-b border-inherit">
          <button
            id="btn-compact-project-switcher"
            type="button"
            title={`当前项目：${activeProject.name} (${activeProject.code || activeProject.version})，点击切换`}
            className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-700 text-xs font-extrabold text-white flex items-center justify-center shadow-sm transition-all hover:scale-105"
            onClick={() => setIsProjectDropdownOpen((prev) => !prev)}
          >
            {activeProject.name.slice(0, 1)}
          </button>

          {/* Compact Popover Dropdown */}
          {isProjectDropdownOpen && (
            <div
              id="compact-project-dropdown"
              className={`absolute left-16 top-2 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                mode === 'dark'
                  ? 'bg-slate-900 border-slate-700 text-slate-200'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <div className="p-2.5 border-b border-inherit text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>切换项目</span>
                <span className="text-[10px] font-mono">{projects.length} 个</span>
              </div>
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
                {projects.map((proj) => {
                  const isSelected = proj.id === activeProjectId;
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        onSelectProject(proj.id);
                        setIsProjectDropdownOpen(false);
                      }}
                      className={`w-full p-2 rounded-lg text-left text-xs transition-all flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? mode === 'dark'
                            ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40'
                            : 'bg-indigo-100 text-indigo-950 font-bold border border-indigo-300'
                          : mode === 'dark'
                          ? 'hover:bg-slate-800 text-slate-300'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold">{proj.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{proj.code || proj.version}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              <div className="p-1.5 border-t border-inherit bg-slate-50 dark:bg-slate-950/40">
                <button
                  type="button"
                  onClick={() => {
                    setIsProjectDropdownOpen(false);
                    onOpenSettings('projects');
                  }}
                  className="w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-200"
                >
                  <Settings className="w-3 h-3 text-indigo-500" />
                  <span>管理项目</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation List */}
      <nav id="qflow-nav" className="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.key;
          return (
            <button
              key={item.key}
              id={`nav-item-${item.key}`}
              onClick={() => onSelectView(item.key)}
              title={item.label}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? mode === 'dark'
                    ? theme === 'spruce'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : theme === 'amber'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                      : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm'
                    : theme === 'spruce'
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 shadow-sm font-bold'
                    : theme === 'amber'
                    ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-sm font-bold'
                    : 'bg-indigo-100 text-indigo-950 border border-indigo-300 shadow-sm font-bold'
                  : mode === 'dark'
                  ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                  : 'text-slate-800 hover:text-black hover:bg-slate-200/80'
              } ${isCompact ? 'justify-center px-1' : ''}`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                  isActive
                    ? mode === 'dark'
                      ? theme === 'spruce'
                        ? 'text-emerald-400'
                        : theme === 'amber'
                        ? 'text-amber-400'
                        : 'text-indigo-400'
                      : theme === 'spruce'
                      ? 'text-emerald-800'
                      : theme === 'amber'
                      ? 'text-amber-800'
                      : 'text-indigo-800'
                    : mode === 'dark'
                    ? 'text-slate-400 group-hover:text-slate-200'
                    : 'text-slate-700 group-hover:text-black'
                }`}
              />
              {!isCompact && <span className="truncate flex-1 text-left">{item.label}</span>}

              {isActive && (
                <span
                  className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full ${
                    theme === 'spruce'
                      ? 'bg-emerald-500'
                      : theme === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-indigo-600'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls: Settings & Quick toggles */}
      {isCompact ? (
        <div className="py-2.5 px-2 border-t border-inherit flex flex-col items-center gap-1.5">
          <button
            id="btn-sidebar-settings"
            onClick={() => onOpenSettings?.('projects')}
            title="系统设置 (含 AI 模型基座切换)"
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70' : 'text-slate-800 hover:text-black hover:bg-slate-200'
            }`}
          >
            <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          </button>

          <button
            id="btn-toggle-dark-mode"
            onClick={onToggleMode}
            title={mode === 'dark' ? '切换为亮色' : '切换为暗色'}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors ${
              mode === 'dark' ? 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70' : 'text-slate-800 hover:text-black hover:bg-slate-200'
            }`}
          >
            {mode === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      ) : (
        <div className="p-2.5 border-t border-inherit space-y-2">
          {/* Main Settings Button */}
          <button
            id="btn-sidebar-settings"
            onClick={() => onOpenSettings?.('projects')}
            title="系统设置与模型基座切换"
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all border font-bold ${
              mode === 'dark'
                ? 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-950'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Settings className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-bold text-xs">系统设置</span>
            </div>
            <span className={`px-1.5 py-0.5 text-[9px] font-mono rounded border truncate max-w-[75px] font-bold ${
              mode === 'dark'
                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
                : 'bg-indigo-100 text-indigo-900 border-indigo-300'
            }`}>
              {aiModelName.split(' ')[0]}
            </span>
          </button>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-800 dark:text-slate-400 font-semibold">
            <span className="text-[10px]">模式切换</span>
            <button
              id="btn-toggle-dark-mode"
              onClick={onToggleMode}
              title={mode === 'dark' ? '切换为亮色' : '切换为暗色'}
              className={`p-1 rounded-lg transition-colors flex items-center gap-1 font-bold ${
                mode === 'dark' ? 'hover:text-slate-100 hover:bg-slate-800/70 text-slate-300' : 'hover:text-black hover:bg-slate-200 text-slate-950'
              }`}
            >
              {mode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px]">暗夜</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[10px]">明亮</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
