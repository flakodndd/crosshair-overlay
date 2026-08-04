import { useEffect, useCallback, Component, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { CrosshairLibrary } from './components/CrosshairLibrary';
import { Preview } from './components/Preview';
import { CrosshairCreator } from './components/CrosshairCreator';
import { PresetManager } from './components/PresetManager';
import { Builder } from './components/Builder';
import { BackgroundImage } from './components/BackgroundImage';
import { Settings } from './components/Settings';
import { About } from './components/About';
import { HotkeyEditor } from './components/HotkeyEditor';
import { Tutorial } from './components/Tutorial';
import { NotificationSystem } from './components/NotificationSystem';
import { useUIStore } from './stores/uiStore';
import { useCrosshairStore } from './stores/crosshairStore';
import { useOverlayStore } from './stores/overlayStore';
import { useSettingsStore } from './stores/settingsStore';

function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function generateAccentShades(hex: string) {
  const { h, s } = hexToHSL(hex);
  const shades: Record<number, string> = {};
  const lightnesses: Record<number, number> = {
    50: 97, 100: 94, 200: 86, 300: 74, 400: 62,
    500: 50, 600: 42, 700: 34, 800: 26, 900: 20, 950: 13,
  };
  for (const [key, l] of Object.entries(lightnesses)) {
    shades[Number(key)] = `hsl(${h}, ${s}%, ${l}%)`;
  }
  return shades;
}

function applyAccentColor(hex: string) {
  const shades = generateAccentShades(hex);
  const root = document.documentElement;
  for (const [key, value] of Object.entries(shades)) {
    root.style.setProperty(`--accent-${key}`, value);
  }
  const { h, s } = hexToHSL(hex);
  root.style.setProperty('--accent-500-rgb', `${Math.round(hslToRgb(h, s, 50).join(', '))}`);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(error: Error) {
    return { error: error.message + '\n' + error.stack };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: '#ff4444', fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', overflow: 'auto', height: '100%' }}>
          <b>Render Error:</b>{'\n'}{this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const { activeView, showTutorial, setShowTutorial } = useUIStore();
  const activeCrosshair = useCrosshairStore((s) => s.activeCrosshair);
  const editingCrosshair = useCrosshairStore((s) => s.editingCrosshair);
  const { visible, toggleVisible } = useOverlayStore();
  const { theme, accentColor, uiScale, highContrast, startupWithWindows, sidebarPosition, backgroundImage } = useSettingsStore();

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      if (theme === 'system') {
        const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', dark);
        root.classList.toggle('light', !dark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
        root.classList.toggle('light', theme === 'light');
      }
    };
    applyTheme();
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', applyTheme);
      return () => mq.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  // Apply accent color
  useEffect(() => {
    if (accentColor && /^#[0-9A-Fa-f]{6}$/.test(accentColor)) {
      applyAccentColor(accentColor);
    }
  }, [accentColor]);

  // Apply UI scale
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.transform = `scale(${uiScale})`;
      root.style.transformOrigin = 'top left';
      root.style.width = `${100 / uiScale}vw`;
      root.style.height = `${100 / uiScale}vh`;
    }
  }, [uiScale]);

  // Apply high contrast
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  // Sync startup setting to main process
  useEffect(() => {
    window.electronAPI?.app?.setStartup?.(startupWithWindows);
  }, [startupWithWindows]);

  useEffect(() => {
    const firstVisit = !localStorage.getItem('crosshair-overlay-visited');
    if (firstVisit) {
      setShowTutorial(true);
      localStorage.setItem('crosshair-overlay-visited', 'true');
    }
  }, [setShowTutorial]);

  // Send crosshair to overlay
  const setEditingCrosshair = useCrosshairStore((s) => s.setEditingCrosshair);
  useEffect(() => {
    const crosshair = editingCrosshair || activeCrosshair;
    if (crosshair && window.electronAPI?.crosshair) {
      window.electronAPI.crosshair.set(crosshair as any);
    }
  }, [activeCrosshair, editingCrosshair]);

  const handleToggleOverlay = useCallback(() => {
    toggleVisible();
    if (window.electronAPI?.overlay) {
      if (visible) {
        window.electronAPI.overlay.hide();
      } else {
        window.electronAPI.overlay.show();
      }
    }
  }, [visible, toggleVisible]);

  const renderView = () => {
    switch (activeView) {
      case 'library':
        return (
          <motion.div
            key="library"
            className="flex-1 flex overflow-hidden"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            <CrosshairLibrary />
            {activeCrosshair && (
              <motion.div
                className="w-[380px] border-l border-white/5 bg-[#0f0f14] hidden lg:block"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Preview />
              </motion.div>
            )}
          </motion.div>
        );
      case 'creator':
        return (
          <motion.div key="creator" className="flex-1 overflow-hidden" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <CrosshairCreator />
          </motion.div>
        );
      case 'presets':
        return (
          <motion.div key="presets" className="flex-1 overflow-hidden" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <PresetManager />
          </motion.div>
        );
      case 'builder':
        return (
          <motion.div key="builder" className="flex-1 overflow-hidden" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <Builder />
          </motion.div>
        );
      case 'background':
        return (
          <motion.div key="background" className="flex-1 overflow-hidden" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <BackgroundImage />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div key="settings" className="flex-1 overflow-y-auto" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <Settings />
            <div className="border-t border-white/5 mt-8">
              <HotkeyEditor />
            </div>
          </motion.div>
        );
      case 'about':
        return (
          <motion.div key="about" className="flex-1 overflow-y-auto" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
            <About />
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="h-screen flex flex-col text-white overflow-hidden select-none relative"
      style={{
        ...(backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {}),
      }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/70 -z-10" />
      )}
      {!backgroundImage && (
        <div className="absolute inset-0 -z-10" style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 50%), linear-gradient(180deg, #0c0c14 0%, #08080e 100%)',
        }} />
      )}
      <TitleBar overlayVisible={visible} onToggleOverlay={handleToggleOverlay} />
      <div className="flex-1 flex overflow-hidden" style={{ flexDirection: sidebarPosition === 'right' ? 'row-reverse' : 'row' }}>
        <Sidebar activeView={activeView} onViewChange={(v) => useUIStore.getState().setActiveView(v as any)} currentCrosshair={activeCrosshair || undefined} />
        <main className="flex-1 flex overflow-hidden">
          <ErrorBoundary key={activeView}>
            <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
          </ErrorBoundary>
        </main>
      </div>
      <AnimatePresence>{showTutorial && <Tutorial />}</AnimatePresence>
      <NotificationSystem />
    </div>
  );
}

export default App;
