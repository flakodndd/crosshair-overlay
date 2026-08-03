import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Sliders,
  Play,
  Power,
  Database,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
  Copy,
  HardDrive,
  Cpu,
  Timer,
  Save,
  ArrowLeftRight,
  Eye,
  Maximize,
  Crosshair,
  Gamepad2,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useOverlayStore } from '../stores/overlayStore';
import type { ThemeMode } from '../types';

interface SettingsProps {
  onNavigateAbout?: () => void;
}

const ACCENT_COLORS = [
  { name: 'indigo', hex: '#6366f1' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'green', hex: '#22c55e' },
  { name: 'red', hex: '#ef4444' },
  { name: 'orange', hex: '#f97316' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'pink', hex: '#ec4899' },
  { name: 'teal', hex: '#14b8a6' },
  { name: 'cyan', hex: '#06b6d4' },
  { name: 'yellow', hex: '#eab308' },
];

const AUTO_SAVE_OPTIONS = [
  { label: '10 seconds', value: 10 },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: 'Manual only', value: 0 },
];

function Toggle({
  enabled,
  onToggle,
  disabled,
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`
        relative w-11 h-6 rounded-full transition-colors duration-200
        ${enabled ? 'bg-accent-500' : 'bg-white/10'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={onToggle}
      disabled={disabled}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  displayValue?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:bg-accent-500 [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md
          [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
      />
      <span className="text-sm text-white/60 min-w-[3rem] text-right">
        {displayValue || value}
      </span>
    </div>
  );
}

function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs
              bg-[#1a1a2e] text-white/80 rounded-md whitespace-nowrap z-50 shadow-lg border border-white/10"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5 text-accent-400" />
        <h2 className="text-lg font-semibold text-white/90">{title}</h2>
      </div>
      <p className="text-sm text-white/40 ml-7">{description}</p>
      <div className="mt-3 border-b border-white/5" />
    </div>
  );
}

function SettingRow({
  label,
  description,
  tooltip,
  children,
}: {
  label: string;
  description?: string;
  tooltip?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3 group">
      <div className="flex-1 mr-4">
        <div className="flex items-center gap-1.5">
          <span className="text-sm text-white/80">{label}</span>
          {tooltip && (
            <Tooltip text={tooltip}>
              <Info className="w-3.5 h-3.5 text-white/30 hover:text-white/50 cursor-help" />
            </Tooltip>
          )}
        </div>
        {description && (
          <p className="text-xs text-white/30 mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export function Settings({ onNavigateAbout }: SettingsProps) {
  const {
    theme,
    accentColor,
    uiScale,
    highContrast,
    startupWithWindows,
    minimizeToTray,
    showNotifications,
    autoSave,
    sidebarPosition,
    setTheme,
    setAccentColor,
    setUiScale,
    setHighContrast,
    toggleStartup,
    toggleMinimizeToTray,
    toggleNotifications,
    toggleAutoSave,
    setSidebarPosition,
  } = useSettingsStore();

  const {
    opacity,
    alwaysOnTop,
    multiMonitor,
    selectedMonitor,
    setOpacity,
    setAlwaysOnTop,
    setMultiMonitor,
    setSelectedMonitor,
  } = useOverlayStore();

  const [customHex, setCustomHex] = useState(accentColor);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [clickThrough, setClickThrough] = useState(false);
  const [autoCenter, setAutoCenter] = useState(true);
  const [hwAcceleration, setHwAcceleration] = useState(true);
  const [lowCpuMode, setLowCpuMode] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState(30);
  const [startMinimized, setStartMinimized] = useState(false);
  const [autoShowOverlay, setAutoShowOverlay] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<{ state: string; version?: string; message?: string } | null>(null);

  // Listen for update events
  useEffect(() => {
    const unsubStatus = window.electronAPI?.update?.onStatus?.((info) => {
      setUpdateStatus(info);
      if (info.state === 'downloaded') {
        window.electronAPI?.update?.install?.();
      }
    });
    const unsubProgress = window.electronAPI?.update?.onProgress?.((_p) => {});
    return () => { unsubStatus?.(); unsubProgress?.(); };
  }, []);

  const memoryUsage = 128;

  const handleExportSettings = () => {
    const allData: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try { allData[key] = JSON.parse(localStorage.getItem(key) || ''); }
        catch { allData[key] = localStorage.getItem(key); }
      }
    }
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crosshair-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (jsonStr: string) => {
    try {
      const data = JSON.parse(jsonStr);
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, JSON.stringify(value));
      }
      window.location.reload();
    } catch {
      alert('Invalid settings file');
    }
  };

  const handleResetSettings = () => {
    localStorage.removeItem('settings-store');
    localStorage.removeItem('overlay-store');
    localStorage.removeItem('crosshair-store');
    window.location.reload();
  };

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8">
      {/* Appearance */}
      <section>
        <SectionHeader
          icon={Palette}
          title="Appearance"
          description="Customize the look and feel of the application"
        />

        <div className="space-y-1 ml-7">
          <SettingRow label="Theme" description="Choose your preferred color theme">
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              {([
                { value: 'light' as ThemeMode, icon: Sun, label: 'Light' },
                { value: 'dark' as ThemeMode, icon: Moon, label: 'Dark' },
                { value: 'system' as ThemeMode, icon: Monitor, label: 'System' },
              ]).map((t) => (
                <motion.button
                  key={t.value}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                    ${theme === t.value
                      ? 'bg-accent-500/20 text-accent-400'
                      : 'text-white/50 hover:text-white/70'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(t.value)}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </motion.button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Accent Color" description="Choose your accent color">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                {ACCENT_COLORS.map((color) => (
                  <motion.button
                    key={color.name}
                    className={`
                      w-6 h-6 rounded-full border-2 transition-all
                      ${accentColor === color.hex
                        ? 'border-white scale-110'
                        : 'border-transparent hover:border-white/30'
                      }
                    `}
                    style={{ backgroundColor: color.hex }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setAccentColor(color.hex);
                      setCustomHex(color.hex);
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <div
                  className="w-6 h-6 rounded border border-white/10"
                  style={{ backgroundColor: customHex }}
                />
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHex(val);
                    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                      setAccentColor(val);
                    }
                  }}
                  className="w-20 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded
                    text-white/80 font-mono focus:outline-none focus:border-accent-500/50"
                  placeholder="#000000"
                />
              </div>
            </div>
          </SettingRow>

          <SettingRow label="UI Scale" description="Adjust the size of the interface">
            <div className="w-48">
              <Slider
                value={uiScale}
                min={0.75}
                max={1.5}
                step={0.05}
                onChange={setUiScale}
                displayValue={`${Math.round(uiScale * 100)}%`}
              />
            </div>
          </SettingRow>

          <SettingRow
            label="High Contrast"
            description="Increase contrast for better visibility"
          >
            <Toggle enabled={highContrast} onToggle={() => setHighContrast(!highContrast)} />
          </SettingRow>

          <SettingRow
            label="Animations"
            description="Enable or disable UI animations"
          >
            <Toggle enabled={animationsEnabled} onToggle={() => setAnimationsEnabled(!animationsEnabled)} />
          </SettingRow>

          <SettingRow label="Sidebar Position" description="Position the sidebar on left or right">
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <motion.button
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                  ${sidebarPosition === 'left'
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-white/50 hover:text-white/70'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSidebarPosition('left')}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Left
              </motion.button>
              <motion.button
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                  ${sidebarPosition === 'right'
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-white/50 hover:text-white/70'
                  }
                `}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSidebarPosition('right')}
              >
                <ArrowLeftRight className="w-3.5 h-3.5 rotate-180" />
                Right
              </motion.button>
            </div>
          </SettingRow>
        </div>
      </section>

      {/* Overlay */}
      <section>
        <SectionHeader
          icon={Crosshair}
          title="Overlay"
          description="Configure the crosshair overlay behavior"
        />

        <div className="space-y-1 ml-7">
          <SettingRow label="Default Opacity" description="Set the default overlay opacity">
            <div className="w-48">
              <Slider
                value={opacity}
                min={0.1}
                max={1}
                step={0.05}
                onChange={setOpacity}
                displayValue={`${Math.round(opacity * 100)}%`}
              />
            </div>
          </SettingRow>

          <SettingRow
            label="Always on Top"
            description="Keep overlay above other windows"
          >
            <Toggle enabled={alwaysOnTop} onToggle={() => setAlwaysOnTop(!alwaysOnTop)} />
          </SettingRow>

          <SettingRow
            label="Click-through"
            description="Overlay will not capture mouse input"
            tooltip="When enabled, mouse clicks pass through the overlay to windows behind it"
          >
            <Toggle enabled={clickThrough} onToggle={() => setClickThrough(!clickThrough)} />
          </SettingRow>

          <SettingRow
            label="Multi-Monitor Support"
            description="Enable overlay on multiple displays"
          >
            <Toggle
              enabled={multiMonitor}
              onToggle={() => setMultiMonitor(!multiMonitor)}
            />
          </SettingRow>

          {multiMonitor && (
            <SettingRow label="Monitor" description="Select which monitor to display overlay">
              <div className="relative">
                <select
                  value={selectedMonitor}
                  onChange={(e) => setSelectedMonitor(Number(e.target.value))}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5
                    text-sm text-white/80 pr-8 focus:outline-none focus:border-accent-500/50 cursor-pointer"
                >
                  <option value={0}>Primary Monitor</option>
                  <option value={1}>Secondary Monitor</option>
                  <option value={2}>Third Monitor</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </SettingRow>
          )}

          <SettingRow
            label="Auto-Center on Screen"
            description="Center the overlay on screen at startup"
          >
            <Toggle enabled={autoCenter} onToggle={() => setAutoCenter(!autoCenter)} />
          </SettingRow>

          <div className="flex items-center gap-2 py-3 ml-0">
            <Info className="w-4 h-4 text-white/30 flex-shrink-0" />
            <p className="text-xs text-white/40">
              Borderless fullscreen compatibility: The overlay works with borderless fullscreen
              mode. For exclusive fullscreen, run the game in borderless windowed mode.
            </p>
          </div>
        </div>
      </section>

      {/* Performance */}
      <section>
        <SectionHeader
          icon={Cpu}
          title="Performance"
          description="Optimize application performance"
        />

        <div className="space-y-1 ml-7">
          <SettingRow
            label="Hardware Acceleration"
            description="Use GPU for rendering"
            tooltip="Enabling may improve performance but uses more GPU memory"
          >
            <Toggle enabled={hwAcceleration} onToggle={() => setHwAcceleration(!hwAcceleration)} />
          </SettingRow>

          <SettingRow
            label="Low CPU Mode"
            description="Reduce CPU usage when overlay is idle"
          >
            <Toggle enabled={lowCpuMode} onToggle={() => setLowCpuMode(!lowCpuMode)} />
          </SettingRow>

          <SettingRow label="Auto-Save Interval" description="How often to save settings">
            <div className="relative">
              <select
                value={autoSaveInterval}
                onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5
                  text-sm text-white/80 pr-8 focus:outline-none focus:border-accent-500/50 cursor-pointer"
              >
                {AUTO_SAVE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </SettingRow>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-white/40" />
              <span className="text-sm text-white/60">Memory Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(memoryUsage / 512) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs text-white/50 min-w-[3rem] text-right">
                {memoryUsage} MB
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Startup */}
      <section>
        <SectionHeader
          icon={Power}
          title="Startup"
          description="Configure application startup behavior"
        />

        <div className="space-y-1 ml-7">
          <SettingRow
            label="Start with Windows"
            description="Launch application when Windows starts"
          >
            <Toggle enabled={startupWithWindows} onToggle={toggleStartup} />
          </SettingRow>

          <SettingRow
            label="Minimize to System Tray"
            description="Keep running in the system tray when closed"
          >
            <Toggle enabled={minimizeToTray} onToggle={toggleMinimizeToTray} />
          </SettingRow>

          <SettingRow
            label="Auto-Show Overlay on Startup"
            description="Automatically show the crosshair overlay when the app starts"
          >
            <Toggle enabled={autoShowOverlay} onToggle={() => setAutoShowOverlay(!autoShowOverlay)} />
          </SettingRow>

          <SettingRow
            label="Start Minimized"
            description="Start the application minimized to the system tray"
          >
            <Toggle enabled={startMinimized} onToggle={() => setStartMinimized(!startMinimized)} />
          </SettingRow>
        </div>
      </section>

      {/* Data */}
      <section>
        <SectionHeader
          icon={Database}
          title="Data"
          description="Manage your settings and data"
        />

        <div className="space-y-3 ml-7">
          <div className="flex gap-3">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10
                rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportSettings}
            >
              <Download className="w-4 h-4" />
              Export Settings
            </motion.button>

            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10
                rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      handleImportSettings(ev.target?.result as string);
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
            >
              <Upload className="w-4 h-4" />
              Import Settings
            </motion.button>
          </div>

          <div className="flex gap-3">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10
                rounded-lg text-sm text-white/70 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowResetDialog(true)}
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Settings
            </motion.button>

            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20
                rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </motion.button>
          </div>

          <div className="flex items-center gap-2 py-2">
            <Save className="w-4 h-4 text-white/30" />
            <span className="text-xs text-white/40">
              Backup location: ~/CrosshairOverlay/backups/
            </span>
          </div>
        </div>
      </section>

      {/* About Link */}
      <section>
        <SectionHeader
          icon={Info}
          title="About"
          description="Application information"
        />

        <div className="ml-7 space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-white/60">Current Version</span>
            <span className="text-sm text-white/80 font-mono">v{window.electronAPI?.app?.getVersion?.() || '1.0.0'}</span>
          </div>

          <motion.button
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm transition-colors ${
              updateStatus?.state === 'checking'
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                : updateStatus?.state === 'available'
                  ? 'bg-accent-500/10 border-accent-500/20 text-accent-400'
                  : updateStatus?.state === 'downloaded'
                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                    : updateStatus?.state === 'error'
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.electronAPI?.update?.check?.()}
          >
            <Download className="w-4 h-4" />
            {updateStatus?.state === 'checking' && 'Checking...'}
            {updateStatus?.state === 'available' && `Update v${updateStatus.version} available`}
            {updateStatus?.state === 'downloaded' && `Restarting to update v${updateStatus.version}...`}
            {updateStatus?.state === 'error' && `Update error: ${updateStatus.message}`}
            {(!updateStatus || updateStatus.state === 'not-available') && 'Check for Updates'}
          </motion.button>

          <motion.button
            className="flex items-center gap-2 px-4 py-2 text-sm text-accent-400 hover:text-accent-300 transition-colors"
            whileHover={{ x: 2 }}
            onClick={onNavigateAbout}
          >
            View About Page
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </motion.button>
        </div>
      </section>

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowResetDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90">Reset Settings</h3>
                  <p className="text-xs text-white/40">This cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-6">
                Are you sure you want to reset all settings to their default values?
              </p>
              <div className="flex justify-end gap-2">
                <motion.button
                  className="px-4 py-2 text-sm text-white/60 hover:text-white/80 transition-colors"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetDialog(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className="px-4 py-2 text-sm bg-yellow-500/20 text-yellow-400 rounded-lg
                    hover:bg-yellow-500/30 transition-colors"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { handleResetSettings(); setShowResetDialog(false); }}
                >
                  Reset
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Data Confirmation Dialog */}
      <AnimatePresence>
        {showClearDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setShowClearDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90">Clear All Data</h3>
                  <p className="text-xs text-red-400/60">Permanent action</p>
                </div>
              </div>
              <p className="text-sm text-white/60 mb-2">
                This will permanently delete all your settings, presets, and profiles.
              </p>
              <p className="text-sm text-white/60 mb-6">
                Type <span className="font-mono text-red-400">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg
                  text-sm text-white/80 mb-4 focus:outline-none focus:border-red-500/50"
                placeholder="Type DELETE"
                value={clearConfirmText}
                onChange={(e) => setClearConfirmText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <motion.button
                  className="px-4 py-2 text-sm text-white/60 hover:text-white/80 transition-colors"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowClearDialog(false); setClearConfirmText(''); }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    clearConfirmText === 'DELETE'
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                  whileTap={clearConfirmText === 'DELETE' ? { scale: 0.98 } : undefined}
                  onClick={() => {
                    if (clearConfirmText === 'DELETE') {
                      handleClearAllData();
                      setShowClearDialog(false);
                      setClearConfirmText('');
                    }
                  }}
                  disabled={clearConfirmText !== 'DELETE'}
                >
                  Clear All Data
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
