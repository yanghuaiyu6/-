import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode2,
  FileSpreadsheet,
  ShieldCheck,
  Search,
  Plus,
  Edit3,
  ChevronRight,
  ChevronDown,
  Layers,
  AlertTriangle,
  FileJson,
  Info,
  Settings,
  SlidersHorizontal,
  Bookmark,
  Check,
  LayoutGrid,
  ListFilter
} from 'lucide-react';
import { ProjectDocument, DocCategoryConfig, ThemeType, ModeType } from '../types';
import {
  DEFAULT_DOC_CATEGORIES,
  CATEGORY_ICON_OPTIONS,
  getCategoryVisualTheme
} from '../data/mockCategories';

interface DocumentsViewProps {
  documents: ProjectDocument[];
  selectedDocId: string;
  onSelectDoc: (id: string) => void;
  onAskKnowledgeAboutDoc: (doc: ProjectDocument) => void;
  onGenerateTestForDoc: (doc: ProjectDocument) => void;
  onNavigateToGraphNode: (nodeName: string) => void;
  onOpenImport?: () => void;
  onOpenCategorySettings?: () => void;
  onUpdateDocument?: (doc: ProjectDocument) => void;
  categories?: DocCategoryConfig[];
  projectName?: string;
  theme: ThemeType;
  mode: ModeType;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onAskKnowledgeAboutDoc,
  onGenerateTestForDoc,
  onNavigateToGraphNode,
  onOpenImport,
  onOpenCategorySettings,
  onUpdateDocument,
  categories: externalCategories,
  projectName = '受控工程',
  theme,
  mode
}) => {
  const categories = externalCategories && externalCategories.length > 0 ? externalCategories : DEFAULT_DOC_CATEGORIES;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('全部');
  const [explorerMode, setExplorerMode] = useState<'grouped' | 'list'>('grouped');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [customTitle, setCustomTitle] = useState('');

  const currentDoc = useMemo(() => {
    return documents.find((d) => d.id === selectedDocId) || documents[0];
  }, [documents, selectedDocId]);

  // Find category config for current document
  const currentDocCategoryConfig = useMemo(() => {
    if (!currentDoc) return categories[0];
    return categories.find((c) => c.name === currentDoc.category) || {
      id: 'default',
      name: currentDoc.category,
      description: '受控知识资产',
      color: 'indigo',
      icon: 'FileText'
    };
  }, [categories, currentDoc]);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCat = selectedCategoryFilter === '全部' || doc.category === selectedCategoryFilter;
      const matchesQuery =
        !searchQuery ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.path.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesQuery;
    });
  }, [documents, selectedCategoryFilter, searchQuery]);

  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories((prev) => {
      const isCurrentlyCollapsed =
        prev[catId] !== undefined ? prev[catId] : !searchQuery.trim();
      return {
        ...prev,
        [catId]: !isCurrentlyCollapsed
      };
    });
  };

  const getDocIconComponent = (categoryName: string) => {
    const matchedCategory = categories.find((c) => c.name === categoryName);
    const iconKey = matchedCategory?.icon || 'FileText';
    const found = CATEGORY_ICON_OPTIONS.find((item) => item.key === iconKey);
    return found?.icon || FileText;
  };

  return (
    <div id="qflow-documents-view" className="h-full w-full flex flex-col md:flex-row gap-3 lg:gap-4 max-w-[1920px] mx-auto min-h-0">
      {/* Left Sidebar: Explorer & Controlled Categories */}
      <div
        className={`w-full md:w-64 lg:w-72 xl:w-80 shrink-0 flex flex-col rounded-2xl border overflow-hidden transition-all shadow-sm ${
          mode === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-300'
        }`}
      >
        {/* Explorer Header */}
        <div className={`p-3 border-b border-inherit flex items-center justify-between gap-2 ${
          mode === 'dark' ? 'bg-slate-950/40' : 'bg-slate-50'
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs tracking-wider uppercase text-slate-950 dark:text-slate-300">
              受控资产资源
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-800 dark:text-indigo-400 font-mono font-bold">
              {documents.length} 份
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* View Mode Switcher (Grouped vs List) */}
            <div className={`flex items-center rounded-lg p-0.5 border ${
              mode === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <button
                onClick={() => setExplorerMode('grouped')}
                title="分类层级分组展示"
                className={`p-1 rounded text-xs transition-colors ${
                  explorerMode === 'grouped'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
              </button>
              <button
                onClick={() => setExplorerMode('list')}
                title="综合筛选列表展示"
                className={`p-1 rounded text-xs transition-colors ${
                  explorerMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <ListFilter className="w-3 h-3" />
              </button>
            </div>

            {/* Import Action */}
            {onOpenImport && (
              <button
                id="btn-doc-import-plus"
                onClick={onOpenImport}
                title="导入受控资料"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="text-[11px]">导入</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="p-2.5 border-b border-inherit">
          <div
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs ${
              mode === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-300 focus-within:border-indigo-600'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              id="input-doc-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索文档名称、协议、风险..."
              className="w-full bg-transparent border-0 outline-none text-xs text-slate-950 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Mode A: Categorized Hierarchical Tree Groups */}
        {explorerMode === 'grouped' ? (
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {categories.map((cat) => {
              const themeConfig = getCategoryVisualTheme(cat.color);
              const IconComp = CATEGORY_ICON_OPTIONS.find((i) => i.key === cat.icon)?.icon || FileText;

              // Filter documents in this category
              const catDocs = documents.filter((doc) => {
                const matchesCat = doc.category === cat.name;
                const matchesQuery =
                  !searchQuery ||
                  doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  doc.path.toLowerCase().includes(searchQuery.toLowerCase());
                return matchesCat && matchesQuery;
              });

              // Categories are collapsed by default unless explicitly toggled or actively searching
              const isCollapsed =
                collapsedCategories[cat.id] !== undefined
                  ? collapsedCategories[cat.id]
                  : !searchQuery.trim();

              return (
                <div
                  key={cat.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    mode === 'dark'
                      ? 'border-slate-800/80 bg-slate-950/30'
                      : 'border-slate-200 bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  {/* Category Section Header */}
                  <div
                    onClick={() => toggleCategoryCollapse(cat.id)}
                    className={`w-full px-2.5 py-2 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors ${
                      mode === 'dark' ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="text-slate-400">
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>

                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 ${themeConfig.bg} ${themeConfig.text} ${themeConfig.border}`}>
                        <IconComp className="w-3 h-3" />
                      </div>

                      <span className="font-extrabold text-xs text-slate-900 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold border ${themeConfig.badge}`}>
                        {catDocs.length}
                      </span>
                    </div>
                  </div>

                  {/* Category Description Tooltip Bar */}
                  {!isCollapsed && cat.description && (
                    <div className={`px-3 py-1 text-[10px] border-t border-b border-inherit font-medium leading-tight truncate ${
                      mode === 'dark' ? 'text-slate-400 bg-slate-950/60' : 'text-slate-600 bg-slate-100/60'
                    }`}>
                      {cat.description}
                    </div>
                  )}

                  {/* Documents in Category */}
                  {!isCollapsed && (
                    <div className="p-1 space-y-1">
                      {catDocs.length === 0 ? (
                        <div className="py-3 px-2 text-center text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          <span>暂无此类文档</span>
                          {onOpenImport && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenImport();
                              }}
                              className="ml-2 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                            >
                              + 导入
                            </button>
                          )}
                        </div>
                      ) : (
                        catDocs.map((doc) => {
                          const isSelected = doc.id === currentDoc.id;
                          return (
                            <button
                              key={doc.id}
                              id={`doc-item-${doc.id}`}
                              onClick={() => onSelectDoc(doc.id)}
                              className={`w-full text-left p-2 rounded-lg border transition-all flex items-start gap-2 group ${
                                isSelected
                                  ? theme === 'spruce'
                                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-950 dark:text-emerald-300 shadow-xs'
                                    : theme === 'amber'
                                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-950 dark:text-amber-300 shadow-xs'
                                    : 'bg-indigo-500/15 border-indigo-500/50 text-indigo-950 dark:text-indigo-300 shadow-xs'
                                  : mode === 'dark'
                                  ? 'border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                                  : 'border-transparent text-slate-900 hover:bg-white hover:border-slate-300 hover:text-black'
                              }`}
                            >
                              <div
                                className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-transparent'
                                    : `${themeConfig.bg} ${themeConfig.text} ${themeConfig.border}`
                                }`}
                              >
                                <IconComp className="w-3 h-3" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs truncate flex items-center justify-between">
                                  <span className="truncate text-slate-950 dark:text-inherit">{doc.title}</span>
                                  <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1 font-bold">{doc.version}</span>
                                </div>
                                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                                  {doc.summary}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                                  <span>{doc.relationsCount} 项关联</span>
                                  <span>·</span>
                                  <span>{doc.testCoverageCount} 条用例</span>
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Mode B: Filtered List Mode with Category Chips */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Category Filter Chips */}
            <div className="p-2 border-b border-inherit flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              <button
                onClick={() => setSelectedCategoryFilter('全部')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1 ${
                  selectedCategoryFilter === '全部'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : mode === 'dark'
                    ? 'text-slate-400 hover:bg-slate-800'
                    : 'text-slate-700 hover:bg-slate-100 border border-slate-300'
                }`}
              >
                <span>全部</span>
                <span className="text-[10px] opacity-80">({documents.length})</span>
              </button>

              {categories.map((cat) => {
                const count = documents.filter((d) => d.category === cat.name).length;
                const themeConfig = getCategoryVisualTheme(cat.color);
                const isSelected = selectedCategoryFilter === cat.name;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.name)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? `${themeConfig.badge} border shadow-xs`
                        : mode === 'dark'
                        ? 'text-slate-400 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${themeConfig.dot}`} />
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-80">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Filtered Document List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredDocs.map((doc) => {
                const Icon = getDocIconComponent(doc.category);
                const isSelected = doc.id === currentDoc.id;
                const docCategory = categories.find((c) => c.name === doc.category);
                const themeConfig = getCategoryVisualTheme(docCategory?.color);

                return (
                  <button
                    key={doc.id}
                    id={`doc-item-${doc.id}`}
                    onClick={() => onSelectDoc(doc.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 group ${
                      isSelected
                        ? theme === 'spruce'
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-950 dark:text-emerald-300 shadow-xs'
                          : theme === 'amber'
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-950 dark:text-amber-300 shadow-xs'
                          : 'bg-indigo-500/15 border-indigo-500/50 text-indigo-950 dark:text-indigo-300 shadow-xs'
                        : mode === 'dark'
                        ? 'border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        : 'border-transparent text-slate-950 hover:bg-slate-100 hover:text-black'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-transparent'
                          : `${themeConfig.bg} ${themeConfig.text} ${themeConfig.border}`
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs truncate flex items-center justify-between">
                        <span className="truncate text-slate-950 dark:text-inherit">{doc.title}</span>
                        <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1 font-bold">{doc.version}</span>
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">{doc.summary}</div>
                      <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500 dark:text-slate-400 font-mono font-semibold">
                        <span className={`px-1.5 py-0.2 rounded-full border ${themeConfig.badge}`}>
                          {doc.category}
                        </span>
                        <span>{doc.relationsCount} 项关联</span>
                        <span>·</span>
                        <span>{doc.owner.split(' ')[0]}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Explorer Bottom Category Summary Strip */}
        <div className={`p-2.5 border-t border-inherit flex items-center justify-between text-[11px] font-medium ${
          mode === 'dark' ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>受控分类体系</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
            共 {categories.length} 类
          </span>
        </div>
      </div>

      {/* Right Main Pane: Rich Document Viewer & Traceability */}
      <div
        className={`flex-1 min-w-0 min-h-0 flex flex-col rounded-2xl border overflow-hidden shadow-sm transition-all ${
          mode === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-300'
        }`}
      >
        {/* Document Top Bar & Actions */}
        <div className={`p-3.5 sm:p-4 border-b border-inherit flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          mode === 'dark' ? 'bg-slate-950/20' : 'bg-slate-50'
        }`}>
          <div className="min-w-0 flex-1">
            {/* Project & Category Breadcrumb with Reclassifier Dropdown */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1.5 flex-wrap">
              <span className="font-bold text-slate-900 dark:text-slate-200">{projectName}</span>
              <ChevronRight className="w-3 h-3 shrink-0 text-slate-400" />
              
              {/* Interactive Category Selector Dropdown */}
              <div className="relative inline-block">
                {(() => {
                  const catTheme = getCategoryVisualTheme(currentDocCategoryConfig.color);
                  return (
                    <button
                      id="btn-doc-change-category"
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold font-mono border transition-all ${catTheme.badge} hover:ring-1 hover:ring-indigo-400 cursor-pointer`}
                      title="点击可修改此文档所属的受控分类"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${catTheme.dot}`} />
                      <span>{currentDoc.category}</span>
                      <ChevronDown className="w-3 h-3 opacity-60" />
                    </button>
                  );
                })()}

                {/* Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div
                    className={`absolute left-0 top-full mt-1 w-56 rounded-xl border p-1.5 z-30 shadow-xl ${
                      mode === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-500 uppercase px-2 py-1">
                      选择归属受控分类
                    </div>
                    {categories.map((cat) => {
                      const isCurrent = cat.name === currentDoc.category;
                      const catTheme = getCategoryVisualTheme(cat.color);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            if (onUpdateDocument) {
                              onUpdateDocument({ ...currentDoc, category: cat.name });
                            } else {
                              currentDoc.category = cat.name;
                            }
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                            isCurrent
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full ${catTheme.dot}`} />
                            <span className="truncate">{cat.name}</span>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                        </button>
                      );
                    })}

                    {onOpenCategorySettings && (
                      <div className="pt-1.5 mt-1 border-t border-inherit">
                        <button
                          onClick={() => {
                            setIsCategoryDropdownOpen(false);
                            onOpenCategorySettings();
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Settings className="w-3 h-3" />
                          <span>在设置中管理分类...</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <ChevronRight className="w-3 h-3 shrink-0 text-slate-400" />
              <span className="font-mono text-slate-500 truncate max-w-xs">{currentDoc.path}</span>
            </div>

            {/* Document Title & Category Definition Banner */}
            <div className="flex items-center gap-3">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={currentDoc.title}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="text-base font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-400 dark:border-slate-700 text-slate-950 dark:text-white"
                  />
                  <button
                    onClick={() => {
                      if (customTitle.trim()) {
                        if (onUpdateDocument) {
                          onUpdateDocument({ ...currentDoc, title: customTitle.trim() });
                        } else {
                          currentDoc.title = customTitle.trim();
                        }
                      }
                      setIsEditingTitle(false);
                    }}
                    className="px-2.5 py-1 text-xs bg-indigo-600 rounded text-white font-bold"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <h2 className="text-lg font-extrabold text-slate-950 dark:text-white truncate flex items-center gap-2">
                  <span>{currentDoc.title}</span>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    title="重命名文档"
                    className="text-slate-400 hover:text-black dark:hover:text-slate-200"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </h2>
              )}

              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                {currentDoc.version}
              </span>
            </div>

            {/* Subtitle: Display Category Official Scope & Role */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-indigo-700 dark:text-indigo-400">
                [{currentDocCategoryConfig.name}范畴]
              </span>
              <span className="truncate">
                {currentDocCategoryConfig.description || '受控生命周期合规工程文档'}
              </span>
            </div>
          </div>

          {/* Right-aligned Document Meta */}
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 shrink-0">
            <span>负责人：{currentDoc.owner}</span>
            <span>·</span>
            <span>更新时间：{currentDoc.updated}</span>
          </div>
        </div>

        {/* Document Content View - Direct, clean display of imported file content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10">
          <article className="max-w-4xl xl:max-w-5xl mx-auto space-y-6 lg:space-y-8 text-slate-900 dark:text-slate-100">
            {/* Document Overview / Summary */}
            {currentDoc.summary && (
              <div className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-300 pb-6 border-b border-inherit font-normal">
                {currentDoc.summary}
              </div>
            )}

            {/* Document Body Sections */}
            <div className="space-y-8">
              {currentDoc.sections && currentDoc.sections.length > 0 ? (
                currentDoc.sections.map((sec, idx) => (
                  <section key={idx} className="space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-base sm:text-lg font-bold text-slate-950 dark:text-white">
                        {sec.heading}
                      </h3>
                      {sec.safetyLevel === 'critical' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30 shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          安全核心约束 (Critical)
                        </span>
                      )}
                      {sec.safetyLevel === 'warning' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 shrink-0">
                          <Info className="w-3.5 h-3.5" />
                          操作员确认
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-[15px] text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>

                    {sec.codeSnippet && (
                      <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto shadow-xs">
                        <pre>{sec.codeSnippet}</pre>
                      </div>
                    )}
                  </section>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  暂无正文段落
                </div>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
