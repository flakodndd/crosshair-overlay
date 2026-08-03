import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  Search,
  Plus,
  Grid3X3,
  List,
  Star,
  Folder,
  FolderOpen,
  ChevronRight,
  Copy,
  Trash2,
  Download,
  Upload,
  X,
  Check,
  MoreHorizontal,
  FolderPlus,
  FileDown,
  AlertTriangle,
  MousePointer2,
  Package,
} from 'lucide-react';
import { usePresetStore } from '../stores/presetStore';
import { useProfileStore } from '../stores/profileStore';
import { useCrosshairStore } from '../stores/crosshairStore';
import { CrosshairRenderer } from './CrosshairRenderer';
import type { CrosshairPreset } from '../types';

export function PresetManager() {
  const {
    presets,
    activePresetId,
    folders,
    setActivePreset,
    deletePreset,
    renamePreset,
    duplicatePreset,
    toggleFavoritePreset,
    createFolder,
    moveToFolder,
    exportPreset,
    importPreset,
    reorderPresets,
    createPreset,
  } = usePresetStore();

  const profiles = useProfileStore((s) => s.profiles);
  const setActiveCrosshair = useCrosshairStore((s) => s.setActiveCrosshair);
  const activeCrosshair = useCrosshairStore((s) => s.activeCrosshair);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveTargetFolder, setMoveTargetFolder] = useState<string | null>(null);
  const [showMoveDropdown, setShowMoveDropdown] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  const getLinkedProfile = useCallback(
    (presetId: string) => profiles.find((p) => p.crosshairPresetId === presetId),
    [profiles]
  );

  const filteredPresets = useMemo(() => {
    let result = presets;
    if (selectedFolder === 'Favorites') {
      result = result.filter((p) => p.favorite);
    } else if (selectedFolder && selectedFolder !== 'All Presets') {
      result = result.filter((p) => p.folder === selectedFolder);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [presets, selectedFolder, searchQuery]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = { All: presets.length, Favorites: presets.filter((p) => p.favorite).length };
    folders.forEach((f) => {
      counts[f] = presets.filter((p) => p.folder === f).length;
    });
    return counts;
  }, [presets, folders]);

  const handleRenameStart = (preset: CrosshairPreset) => {
    setEditingPresetId(preset.id);
    setEditingName(preset.name);
    setTimeout(() => nameInputRef.current?.select(), 0);
  };

  const handleRenameSave = () => {
    if (editingPresetId && editingName.trim()) {
      renamePreset(editingPresetId, editingName.trim());
    }
    setEditingPresetId(null);
  };

  const handleDelete = (id: string) => {
    deletePreset(id);
    setDeleteConfirmId(null);
  };

  const handleBulkDelete = () => {
    selectedPresets.forEach((id) => deletePreset(id));
    setSelectedPresets(new Set());
    setBulkDeleteConfirm(false);
  };

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        importPreset(content);
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [importPreset]
  );

  const handleExport = (presetId: string) => {
    const json = exportPreset(presetId);
    if (!json) return;
    const preset = presets.find((p) => p.id === presetId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${preset?.name || 'preset'}.crosshair`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const togglePresetSelection = (id: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedPresets.size === filteredPresets.length) {
      setSelectedPresets(new Set());
    } else {
      setSelectedPresets(new Set(filteredPresets.map((p) => p.id)));
    }
  };

  const handleMoveToFolder = (presetId: string, folder: string) => {
    moveToFolder(presetId, folder);
    setShowMoveDropdown(null);
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };
  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      reorderPresets(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -4 },
    visible: { opacity: 1, scale: 1, y: 0 },
  };

  return (
    <div className="flex h-full bg-[#0a0a12] text-white">
      <input
        ref={fileInputRef}
        type="file"
        accept=".crosshair,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Folder sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-white/5 flex flex-col bg-[#0e0e1a]">
        <div className="p-3 border-b border-white/5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Folders</h2>
          <button
            onClick={() => setShowNewFolderInput(true)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            New Folder
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {showNewFolderInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-2 py-1"
            >
              <div className="flex items-center gap-1">
                <input
                  ref={newFolderInputRef}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateFolder();
                    if (e.key === 'Escape') {
                      setShowNewFolderInput(false);
                      setNewFolderName('');
                    }
                  }}
                  placeholder="Folder name..."
                  autoFocus
                  className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-white/30 outline-none focus:border-accent-500"
                />
                <button onClick={handleCreateFolder} className="p-1 text-green-400 hover:text-green-300">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setShowNewFolderInput(false); setNewFolderName(''); }}
                  className="p-1 text-white/40 hover:text-white/60"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
              selectedFolder === null ? 'bg-accent-500/10 text-accent-400' : 'text-white/60 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="flex-1 text-left">All Presets</span>
            <span className="text-xs text-white/30">{folderCounts.All}</span>
          </button>

          <button
            onClick={() => setSelectedFolder('Favorites')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
              selectedFolder === 'Favorites' ? 'bg-accent-500/10 text-accent-400' : 'text-white/60 hover:bg-white/5 hover:text-white/80'
            }`}
          >
            <Star className="w-4 h-4" />
            <span className="flex-1 text-left">Favorites</span>
            <span className="text-xs text-white/30">{folderCounts.Favorites}</span>
          </button>

          <div className="my-1 border-t border-white/5" />

          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                selectedFolder === folder ? 'bg-accent-500/10 text-accent-400' : 'text-white/60 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              {selectedFolder === folder ? (
                <FolderOpen className="w-4 h-4" />
              ) : (
                <Folder className="w-4 h-4" />
              )}
              <span className="flex-1 text-left truncate">{folder}</span>
              <span className="text-xs text-white/30">{folderCounts[folder] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#0e0e1a]/50">
          <h1 className="text-lg font-semibold text-white/90">Presets</h1>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search presets..."
              className="w-48 bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-sm text-white placeholder-white/30 outline-none focus:border-accent-500 transition-colors"
            />
          </div>

          <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-l-lg transition-colors ${viewMode === 'grid' ? 'bg-accent-500/20 text-accent-400' : 'text-white/40 hover:text-white/60'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-r-lg transition-colors ${viewMode === 'list' ? 'bg-accent-500/20 text-accent-400' : 'text-white/40 hover:text-white/60'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import
          </button>

          <button
            onClick={() => {
              if (activeCrosshair) {
                createPreset(activeCrosshair.name || 'New Preset', activeCrosshair);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent-500 hover:bg-accent-600 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Preset
          </button>
        </div>

        {/* Bulk actions bar */}
        <AnimatePresence>
          {selectedPresets.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 px-4 py-2 bg-accent-500/10 border-b border-accent-500/20"
            >
              <span className="text-sm text-accent-400">{selectedPresets.size} selected</span>
              <button onClick={selectAll} className="text-xs text-white/50 hover:text-white/70">
                {selectedPresets.size === filteredPresets.length ? 'Deselect all' : 'Select all'}
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete selected
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preset grid/list */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/30">
              <Package className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">No presets found</p>
              <p className="text-sm">
                {searchQuery ? 'Try a different search term' : 'Create a new preset or import one'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <LayoutGroup>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <AnimatePresence mode="popLayout">
                  {filteredPresets.map((preset, index) => {
                    const linkedProfile = getLinkedProfile(preset.id);
                    const isActive = activePresetId === preset.id;
                    const isEditing = editingPresetId === preset.id;
                    const isSelected = selectedPresets.has(preset.id);
                    const isDeleteConfirm = deleteConfirmId === preset.id;

                    return (
                      <motion.div
                        key={preset.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`
                          group relative rounded-xl overflow-hidden border transition-all cursor-pointer
                          ${isActive
                            ? 'border-accent-500 ring-2 ring-accent-500/30 shadow-lg shadow-accent-500/10'
                            : isSelected
                              ? 'border-accent-500/40 bg-accent-500/5'
                              : 'border-white/5 hover:border-white/10 bg-[#12121f]'
                          }
                          ${dragOverIndex === index ? 'border-t-2 border-t-accent-500' : ''}
                        `}
                        onClick={() => {
                          if (isEditing) return;
                          if (window.event && (window.event as MouseEvent).ctrlKey) {
                            togglePresetSelection(preset.id);
                          } else {
                            setActivePreset(preset.id);
                            setActiveCrosshair(preset.crosshair);
                          }
                        }}
                      >
                        {/* Selection checkbox */}
                        <div
                          className={`absolute top-2 left-2 z-10 w-5 h-5 rounded border transition-all flex items-center justify-center ${
                            isSelected
                              ? 'bg-accent-500 border-accent-500'
                              : 'border-white/20 bg-black/30 opacity-0 group-hover:opacity-100'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePresetSelection(preset.id);
                          }}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        {/* Preview */}
                        <div className="relative h-28 flex items-center justify-center bg-[#0a0a14]">
                          <CrosshairRenderer config={preset.crosshair} size={56} />

                          {/* Favorite star */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavoritePreset(preset.id);
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                preset.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white/30 hover:text-white/50'
                              }`}
                            />
                          </button>

                          {/* Profile badge */}
                          {linkedProfile && (
                            <span className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-full bg-accent-500/20 text-accent-300 border border-accent-500/30">
                              {linkedProfile.icon} {linkedProfile.name}
                            </span>
                          )}

                          {isActive && (
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              Active
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3">
                          {isEditing ? (
                            <input
                              ref={nameInputRef}
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onBlur={handleRenameSave}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSave();
                                if (e.key === 'Escape') setEditingPresetId(null);
                              }}
                              className="w-full bg-white/5 border border-accent-500 rounded px-2 py-0.5 text-sm text-white outline-none"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <h3
                              className="text-sm font-medium text-white/90 truncate"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(preset);
                              }}
                            >
                              {preset.name}
                            </h3>
                          )}
                          <p className="text-xs text-white/30 mt-0.5">{formatDate(preset.createdAt)}</p>
                        </div>

                        {/* Actions toolbar */}
                        <div className="absolute bottom-0 left-0 right-0 flex items-center gap-1 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicatePreset(preset.id);
                            }}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExport(preset.id);
                            }}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                            title="Export"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMoveDropdown(showMoveDropdown === preset.id ? null : preset.id);
                              }}
                              className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
                              title="Move to folder"
                            >
                              <Folder className="w-3.5 h-3.5" />
                            </button>
                            <AnimatePresence>
                              {showMoveDropdown === preset.id && (
                                <motion.div
                                  variants={menuVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className="absolute bottom-full left-0 mb-1 w-36 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-xl overflow-hidden z-20"
                                >
                                  {folders.map((folder) => (
                                    <button
                                      key={folder}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveToFolder(preset.id, folder);
                                      }}
                                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors ${
                                        preset.folder === folder ? 'text-accent-400' : 'text-white/60'
                                      }`}
                                    >
                                      <Folder className="w-3 h-3" />
                                      {folder}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {isDeleteConfirm ? (
                            <div className="flex items-center gap-1 ml-auto">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(preset.id);
                                }}
                                className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className="p-1 rounded bg-white/10 text-white/60 hover:text-white transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(preset.id);
                              }}
                              className="p-1 rounded bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors ml-auto"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </LayoutGroup>
          ) : (
            /* List view */
            <div className="space-y-1">
              <AnimatePresence mode="popLayout">
                {filteredPresets.map((preset, index) => {
                  const linkedProfile = getLinkedProfile(preset.id);
                  const isActive = activePresetId === preset.id;
                  const isEditing = editingPresetId === preset.id;
                  const isSelected = selectedPresets.has(preset.id);
                  const isDeleteConfirm = deleteConfirmId === preset.id;

                  return (
                    <motion.div
                      key={preset.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`
                        group flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-all
                        ${isActive
                          ? 'border-accent-500/50 bg-accent-500/5'
                          : isSelected
                            ? 'border-accent-500/30 bg-accent-500/5'
                            : 'border-transparent hover:bg-white/5'
                        }
                      `}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      onClick={() => {
                        if (isEditing) return;
                        if (window.event && (window.event as MouseEvent).ctrlKey) {
                          togglePresetSelection(preset.id);
                        } else {
                          setActivePreset(preset.id);
                          setActiveCrosshair(preset.crosshair);
                        }
                      }}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                          isSelected ? 'bg-accent-500 border-accent-500' : 'border-white/20 group-hover:border-white/30'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePresetSelection(preset.id);
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>

                      {/* Preview */}
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#0a0a14] rounded-lg border border-white/5">
                        <CrosshairRenderer config={preset.crosshair} size={28} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            ref={nameInputRef}
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={handleRenameSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameSave();
                              if (e.key === 'Escape') setEditingPresetId(null);
                            }}
                            className="w-full bg-white/5 border border-accent-500 rounded px-2 py-0.5 text-sm text-white outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium text-white/90 truncate"
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleRenameStart(preset);
                              }}
                            >
                              {preset.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                Active
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-white/30">{formatDate(preset.createdAt)}</span>
                          {linkedProfile && (
                            <span className="text-[10px] text-accent-400">
                              {linkedProfile.icon} {linkedProfile.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavoritePreset(preset.id);
                        }}
                        className="p-1"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            preset.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-white/20 hover:text-white/40'
                          }`}
                        />
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicatePreset(preset.id); }}
                          className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleExport(preset.id); }}
                          className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                          title="Export"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                        {isDeleteConfirm ? (
                          <>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(preset.id); }}
                              className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }}
                              className="p-1.5 rounded bg-white/10 text-white/60 hover:text-white transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(preset.id); }}
                            className="p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Bulk delete confirmation modal */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setBulkDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Delete Presets</h3>
                  <p className="text-xs text-white/50">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-4">
                Delete {selectedPresets.size} selected preset{selectedPresets.size > 1 ? 's' : ''}?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  className="flex-1 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 py-2 text-sm bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
