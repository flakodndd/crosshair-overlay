import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Copy,
  Trash2,
  Edit3,
  Crosshair,
  Triangle,
  Shield,
  Target,
  Star,
  Diamond,
  Glasses,
  Check,
  X,
  Move,
  Maximize2,
  Eye,
} from 'lucide-react';
import { useProfileStore } from '../stores/profileStore';
import { usePresetStore } from '../stores/presetStore';
import { useOverlayStore } from '../stores/overlayStore';
import { CrosshairRenderer } from './CrosshairRenderer';
import type { GameProfile } from '../types';

const GAME_ICONS: Record<string, React.ReactNode> = {
  cs2: <Crosshair className="w-5 h-5" />,
  valorant: <Triangle className="w-5 h-5" />,
  r6: <Shield className="w-5 h-5" />,
  bloodstrike: <Target className="w-5 h-5" />,
  fortnite: <Star className="w-5 h-5" />,
  apex: <Diamond className="w-5 h-5" />,
  pubg: <Glasses className="w-5 h-5" />,
};

const ICON_OPTIONS = ['cs2', 'valorant', 'r6', 'bloodstrike', 'fortnite', 'apex', 'pubg', '🎮'];

interface ProfileSettingsModalProps {
  profile: GameProfile;
  onClose: () => void;
}

function ProfileSettingsModal({ profile, onClose }: ProfileSettingsModalProps) {
  const { updateProfileSettings, renameProfile } = useProfileStore();
  const presets = usePresetStore((s) => s.presets);

  const [name, setName] = useState(profile.name);
  const [icon, setIcon] = useState(profile.icon);
  const [presetId, setPresetId] = useState(profile.crosshairPresetId);
  const [size, setSize] = useState(profile.size);
  const [opacity, setOpacity] = useState(profile.opacity);
  const [overlayOpacity, setOverlayOpacity] = useState(profile.overlayOpacity);
  const [posX, setPosX] = useState(profile.position.x);
  const [posY, setPosY] = useState(profile.position.y);
  const [showPresetPicker, setShowPresetPicker] = useState(false);

  const selectedPreset = presets.find((p) => p.id === presetId);

  const handleSave = () => {
    renameProfile(profile.id, name);
    updateProfileSettings(profile.id, {
      icon,
      crosshairPresetId: presetId,
      size,
      opacity,
      overlayOpacity,
      position: { x: posX, y: posY },
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white/90">Profile Settings</h2>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Icon selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-white/50 mb-2">Icon</label>
          <div className="flex gap-2 flex-wrap">
            {ICON_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setIcon(opt.length <= 2 ? opt : opt)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all text-lg ${
                  icon === opt
                    ? 'border-accent-500 bg-accent-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                {opt.length <= 2 ? opt : (GAME_ICONS[opt] || '🎮')}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-white/50 mb-2">Profile Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Crosshair picker */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-white/50 mb-2">Crosshair</label>
          <button
            onClick={() => setShowPresetPicker(!showPresetPicker)}
            className="w-full flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 transition-colors"
          >
            {selectedPreset ? (
              <>
                <div className="w-10 h-10 flex items-center justify-center bg-[#0a0a14] rounded-lg">
                  <CrosshairRenderer config={selectedPreset.crosshair} size={28} />
                </div>
                <span className="text-sm text-white/80">{selectedPreset.name}</span>
              </>
            ) : (
              <span className="text-sm text-white/30">Select a crosshair preset...</span>
            )}
            <Edit3 className="w-4 h-4 text-white/30 ml-auto" />
          </button>

          <AnimatePresence>
            {showPresetPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 bg-[#12121f] border border-white/10 rounded-lg overflow-hidden"
              >
                <div className="max-h-48 overflow-y-auto p-2 space-y-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setPresetId(preset.id);
                        setShowPresetPicker(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        presetId === preset.id ? 'bg-accent-500/10 text-accent-400' : 'hover:bg-white/5 text-white/60'
                      }`}
                    >
                      <div className="w-8 h-8 flex items-center justify-center bg-[#0a0a14] rounded">
                        <CrosshairRenderer config={preset.crosshair} size={22} />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Size slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white/50">Size</label>
            <span className="text-xs text-white/40">{size.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={size}
            onChange={(e) => setSize(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-500"
          />
        </div>

        {/* Color picker placeholder / Opacity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white/50">Crosshair Opacity</label>
            <span className="text-xs text-white/40">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-500"
          />
        </div>

        {/* Overlay opacity */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-white/50">Overlay Opacity</label>
            <span className="text-xs text-white/40">{Math.round(overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-accent-500"
          />
        </div>

        {/* Position */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-white/50 mb-2">Overlay Position</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/30 mb-1 block">X</label>
              <input
                type="number"
                value={posX}
                onChange={(e) => setPosX(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-white/30 mb-1 block">Y</label>
              <input
                type="number"
                value={posY}
                onChange={(e) => setPosY(parseInt(e.target.value) || 0)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 text-sm bg-accent-500 hover:bg-accent-600 rounded-lg text-white font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProfileManager() {
  const {
    profiles,
    activeProfileId,
    setActiveProfile,
    createProfile,
    deleteProfile,
    duplicateProfile,
    updateProfileSettings,
  } = useProfileStore();

  const presets = usePresetStore((s) => s.presets);

  const [editingProfile, setEditingProfile] = useState<GameProfile | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const getPresetById = useCallback(
    (id: string) => presets.find((p) => p.id === id),
    [presets]
  );

  const handleActivate = (profile: GameProfile) => {
    setActiveProfile(profile.id);
    usePresetStore.getState().setActivePreset(profile.crosshairPresetId || null);
    useOverlayStore.getState().setSize(
      profile.overlaySettings.size.w,
      profile.overlaySettings.size.h
    );
    useOverlayStore.getState().setOpacity(profile.overlaySettings.opacity);
    useOverlayStore.getState().setPosition(
      profile.overlaySettings.position.x,
      profile.overlaySettings.position.y
    );
    useOverlayStore.getState().setVisible(profile.overlaySettings.visible);
    useOverlayStore.getState().setAlwaysOnTop(profile.overlaySettings.alwaysOnTop);
  };

  const handleDuplicate = (id: string) => {
    duplicateProfile(id);
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    setDeleteConfirmId(null);
  };

  const handleNewProfile = () => {
    const id = createProfile('New Profile', '🎮');
    const profile = useProfileStore.getState().profiles.find((p) => p.id === id);
    if (profile) setEditingProfile(profile);
  };

  const renderGameIcon = (icon: string) => {
    if (icon.length <= 2) return <span className="text-lg">{icon}</span>;
    return GAME_ICONS[icon] || <span className="text-lg">{icon}</span>;
  };

  return (
    <div className="h-full bg-[#0a0a12] p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-white/90">Game Profiles</h1>
        <button
          onClick={handleNewProfile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent-500 hover:bg-accent-600 rounded-lg text-white font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Profile
        </button>
      </div>

      {/* Profiles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {profiles.map((profile) => {
            const preset = getPresetById(profile.crosshairPresetId);
            const isActive = activeProfileId === profile.id;
            const isDeleteConfirm = deleteConfirmId === profile.id;

            return (
              <motion.div
                key={profile.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -2 }}
                className={`
                  relative group rounded-xl border bg-[#12121f] transition-all cursor-pointer
                  ${isActive
                    ? 'border-accent-500 ring-2 ring-accent-500/30 shadow-lg shadow-accent-500/10'
                    : 'border-white/5 hover:border-white/10'
                  }
                `}
                onClick={() => handleActivate(profile)}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-500 to-accent-400" />
                )}

                <div className="p-4">
                  {/* Top row: icon + name + actions */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isActive ? 'bg-accent-500/20 text-accent-400' : 'bg-white/5 text-white/50'
                        }`}
                      >
                        {renderGameIcon(profile.icon)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white/90">{profile.name}</h3>
                        <p className="text-xs text-white/40 mt-0.5">
                          {preset ? preset.name : 'No crosshair linked'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProfile(profile);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(profile.id);
                        }}
                        className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {isDeleteConfirm ? (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(profile.id);
                            }}
                            className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="p-1.5 rounded bg-white/10 text-white/60 hover:text-white transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(profile.id);
                          }}
                          className="p-1.5 rounded hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Crosshair preview */}
                  <div className="flex items-center justify-center h-20 bg-[#0a0a14] rounded-lg mb-3 border border-white/5">
                    {preset ? (
                      <CrosshairRenderer config={preset.crosshair} size={48} />
                    ) : (
                      <span className="text-xs text-white/20">No crosshair</span>
                    )}
                  </div>

                  {/* Quick settings */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-white/30 mb-0.5">
                        <Maximize2 className="w-2.5 h-2.5" />
                        Size
                      </div>
                      <span className="text-xs text-white/70">{profile.size.toFixed(1)}x</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-white/30 mb-0.5">
                        <Eye className="w-2.5 h-2.5" />
                        Opacity
                      </div>
                      <span className="text-xs text-white/70">{Math.round(profile.opacity * 100)}%</span>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2 text-center">
                      <div className="flex items-center justify-center gap-1 text-[10px] text-white/30 mb-0.5">
                        <Move className="w-2.5 h-2.5" />
                        Position
                      </div>
                      <span className="text-xs text-white/70">
                        {profile.position.x},{profile.position.y}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active badge */}
                {isActive && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                      Active
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Settings modal */}
      <AnimatePresence>
        {editingProfile && (
          <ProfileSettingsModal
            profile={editingProfile}
            onClose={() => setEditingProfile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
