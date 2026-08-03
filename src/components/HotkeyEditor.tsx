import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Keyboard,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
  Monitor,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Eye,
  Lock,
  Camera,
  Power,
  Circle,
} from 'lucide-react';
import { useHotkeyStore } from '../stores/hotkeyStore';
import type { HotkeyConfig } from '../types';

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  'toggle-overlay': {
    label: 'Toggle Overlay',
    icon: <Monitor className="w-4 h-4" />,
    description: 'Show or hide the crosshair overlay',
  },
  'next-preset': {
    label: 'Next Preset',
    icon: <ArrowRight className="w-4 h-4" />,
    description: 'Switch to the next crosshair preset',
  },
  'prev-preset': {
    label: 'Previous Preset',
    icon: <ArrowLeft className="w-4 h-4" />,
    description: 'Switch to the previous crosshair preset',
  },
  'increase-size': {
    label: 'Increase Size',
    icon: <ArrowUp className="w-4 h-4" />,
    description: 'Increase the crosshair size',
  },
  'decrease-size': {
    label: 'Decrease Size',
    icon: <ArrowDown className="w-4 h-4" />,
    description: 'Decrease the crosshair size',
  },
  'toggle-visibility': {
    label: 'Toggle Visibility',
    icon: <Eye className="w-4 h-4" />,
    description: 'Toggle overlay visibility in-game',
  },
  'lock-overlay': {
    label: 'Lock Overlay',
    icon: <Lock className="w-4 h-4" />,
    description: 'Lock/unlock the overlay position',
  },
  'open-app': {
    label: 'Open Application',
    icon: <Power className="w-4 h-4" />,
    description: 'Bring the application window to focus',
  },
  'screenshot-crosshair': {
    label: 'Screenshot Crosshair',
    icon: <Camera className="w-4 h-4" />,
    description: 'Capture the current crosshair as an image',
  },
};

const SPECIAL_KEY_MAP: Record<string, string> = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  ' ': 'Space',
  Control: 'Ctrl',
  Shift: 'Shift',
  Alt: 'Alt',
  Meta: 'Win',
  Escape: 'Esc',
  Backspace: 'Bksp',
  Delete: 'Del',
  Enter: 'Enter',
  Tab: 'Tab',
};

function formatKey(key: string): string {
  return SPECIAL_KEY_MAP[key] || key.toUpperCase();
}

function formatShortcut(config: HotkeyConfig): string {
  const parts: string[] = [];
  if (config.ctrl) parts.push('Ctrl');
  if (config.shift) parts.push('Shift');
  if (config.alt) parts.push('Alt');
  parts.push(formatKey(config.key));
  return parts.join(' + ');
}

interface RecordingState {
  action: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  key: string | null;
}

export function HotkeyEditor() {
  const { hotkeys, recordingHotkey, setHotkey, resetHotkeys, startRecording, stopRecording } =
    useHotkeyStore();

  const [recording, setRecording] = useState<RecordingState | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, string>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const recordingRef = useRef<RecordingState | null>(null);

  const getHotkeyForAction = useCallback(
    (action: string): HotkeyConfig | undefined => hotkeys.find((h) => h.action === action),
    [hotkeys]
  );

  const checkConflict = useCallback(
    (action: string, key: string, ctrl: boolean, shift: boolean, alt: boolean): string | null => {
      const combo = `${ctrl ? 'C' : ''}${shift ? 'S' : ''}${alt ? 'A' : ''}${key}`;
      for (const h of hotkeys) {
        if (h.action === action) continue;
        const existing = `${h.ctrl ? 'C' : ''}${h.shift ? 'S' : ''}${h.alt ? 'A' : ''}${h.key}`;
        if (combo === existing) return h.action;
      }
      return null;
    },
    [hotkeys]
  );

  const handleStartRecording = (action: string) => {
    if (recording) return;
    const initial: RecordingState = { action, ctrl: false, shift: false, alt: false, key: null };
    recordingRef.current = initial;
    setRecording(initial);
    startRecording(action);
  };

  const handleSaveRecording = () => {
    if (recording?.key) {
      setHotkey(recording.action, recording.key, recording.ctrl, recording.shift, recording.alt);
      const conflict = checkConflict(recording.action, recording.key, recording.ctrl, recording.shift, recording.alt);
      setConflicts((prev) => {
        const next = { ...prev };
        if (conflict) next[recording.action] = conflict;
        else delete next[recording.action];
        return next;
      });
    }
    setRecording(null);
    recordingRef.current = null;
    stopRecording();
  };

  const handleCancelRecording = () => {
    setRecording(null);
    recordingRef.current = null;
    stopRecording();
  };

  const handleResetDefault = (action: string) => {
    const defaults: Record<string, HotkeyConfig> = {
      'toggle-overlay': { action: 'toggle-overlay', key: 'X', ctrl: true, shift: true, alt: false },
      'next-preset': { action: 'next-preset', key: 'ArrowRight', ctrl: true, shift: true, alt: false },
      'prev-preset': { action: 'prev-preset', key: 'ArrowLeft', ctrl: true, shift: true, alt: false },
      'increase-size': { action: 'increase-size', key: 'ArrowUp', ctrl: true, shift: true, alt: false },
      'decrease-size': { action: 'decrease-size', key: 'ArrowDown', ctrl: true, shift: true, alt: false },
      'toggle-visibility': { action: 'toggle-visibility', key: 'H', ctrl: true, shift: true, alt: false },
      'lock-overlay': { action: 'lock-overlay', key: 'L', ctrl: true, shift: true, alt: false },
      'open-app': { action: 'open-app', key: 'O', ctrl: true, shift: true, alt: false },
      'screenshot-crosshair': { action: 'screenshot-crosshair', key: 'P', ctrl: true, shift: true, alt: false },
    };
    const def = defaults[action];
    if (def) {
      setHotkey(action, def.key, def.ctrl, def.shift, def.alt);
      setConflicts((prev) => {
        const next = { ...prev };
        delete next[action];
        return next;
      });
    }
  };

  useEffect(() => {
    if (!recording) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        handleCancelRecording();
        return;
      }

      // Skip modifier-only presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return;

      const updated: RecordingState = {
        ...recordingRef.current!,
        ctrl: e.ctrlKey,
        shift: e.shiftKey,
        alt: e.altKey,
        key: e.key,
      };
      recordingRef.current = updated;
      setRecording(updated);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [recording]);

  const actions = Object.keys(ACTION_META);

  return (
    <div className="h-full bg-[#0a0a12] p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-semibold text-white/90">Keyboard Shortcuts</h1>
          <p className="text-xs text-white/40 mt-1">
            Global shortcuts work across all applications while the overlay is active
          </p>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg text-white/60 hover:bg-white/10 hover:text-white/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All
        </button>
      </div>

      {/* Hotkey list */}
      <div className="space-y-2">
        {actions.map((action) => {
          const meta = ACTION_META[action];
          const hotkey = getHotkeyForAction(action);
          const isRecording = recording?.action === action;
          const hasConflict = conflicts[action];

          return (
            <motion.div
              key={action}
              layout
              className={`
                flex items-center gap-4 p-3 rounded-xl border transition-all
                ${isRecording
                  ? 'bg-accent-500/10 border-accent-500/30'
                  : hasConflict
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-[#12121f] border-white/5 hover:border-white/10'
                }
              `}
            >
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isRecording ? 'bg-accent-500/20 text-accent-400' : 'bg-white/5 text-white/50'
                }`}
              >
                {meta.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-white/90">{meta.label}</h3>
                <p className="text-xs text-white/30 truncate">{meta.description}</p>
              </div>

              {/* Shortcut display / recording */}
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-2.5 h-2.5 rounded-full bg-accent-500"
                    />
                    <div className="flex items-center gap-1.5 bg-accent-500/10 border border-accent-500/30 rounded-lg px-3 py-1.5">
                      {recording?.ctrl && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-300 rounded">
                          Ctrl
                        </span>
                      )}
                      {recording?.shift && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-300 rounded">
                          Shift
                        </span>
                      )}
                      {recording?.alt && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-300 rounded">
                          Alt
                        </span>
                      )}
                      {recording?.key && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-accent-500/30 text-accent-200 rounded">
                          {formatKey(recording.key)}
                        </span>
                      )}
                      {!recording?.key && (
                        <span className="text-xs text-white/40">Press keys...</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    {hotkey && (
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                        {hotkey.ctrl && (
                          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-white/10 text-white/70 rounded">
                            Ctrl
                          </span>
                        )}
                        {hotkey.shift && (
                          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-white/10 text-white/70 rounded">
                            Shift
                          </span>
                        )}
                        {hotkey.alt && (
                          <span className="px-1.5 py-0.5 text-[11px] font-medium bg-white/10 text-white/70 rounded">
                            Alt
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 text-[11px] font-medium bg-white/10 text-white/70 rounded">
                          {formatKey(hotkey.key)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Conflict warning */}
                {hasConflict && !isRecording && (
                  <div className="flex items-center gap-1 text-[10px] text-red-400" title={`Conflicts with: ${ACTION_META[hasConflict]?.label}`}>
                    <AlertTriangle className="w-3 h-3" />
                    <span>Conflict</span>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {isRecording ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSaveRecording}
                      disabled={!recording?.key}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancelRecording}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white/5 text-white/50 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white/70 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStartRecording(action)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-white/5 text-white/50 border border-white/10 rounded-lg hover:bg-accent-500/10 hover:text-accent-400 hover:border-accent-500/30 transition-colors"
                    >
                      <Circle className="w-3 h-3" />
                      Record
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleResetDefault(action)}
                      className="p-1.5 text-white/30 hover:text-white/60 transition-colors"
                      title="Reset to default"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info footer */}
      <div className="mt-6 p-4 bg-[#12121f] border border-white/5 rounded-xl">
        <div className="flex items-start gap-3">
          <Keyboard className="w-5 h-5 text-accent-400 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-1">About Global Shortcuts</h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Global shortcuts work across all applications while the overlay is active.
              These shortcuts are captured at the system level and will function even when the
              application is in the background. Press <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">Esc</kbd> while
              recording to cancel. Shortcuts require at least one modifier key (Ctrl, Shift, or Alt).
            </p>
          </div>
        </div>
      </div>

      {/* Reset all confirmation modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/90">Reset All Shortcuts</h3>
                  <p className="text-xs text-white/50">Restore default key bindings</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-4">
                This will reset all keyboard shortcuts to their default values. Custom bindings will be lost.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetHotkeys();
                    setConflicts({});
                    setShowResetConfirm(false);
                  }}
                  className="flex-1 py-2 text-sm bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-500/30 transition-colors"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
