import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, X, Eye, EyeOff, Settings } from 'lucide-react';

interface TitleBarProps {
  overlayVisible?: boolean;
  onToggleOverlay?: () => void;
  onOpenSettings?: () => void;
}

export function TitleBar({
  overlayVisible = true,
  onToggleOverlay,
  onOpenSettings,
}: TitleBarProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="h-[36px] flex items-center justify-between bg-[#0e0e16]/95 backdrop-blur-xl border-b border-white/[0.06] select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left section - App info */}
      <div className="flex items-center gap-2 pl-3">
        {/* App icon */}
        <div className="w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-500">
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="8" />
            <line x1="12" y1="16" x2="12" y2="22" />
            <line x1="2" y1="12" x2="8" y2="12" />
            <line x1="16" y1="12" x2="22" y2="12" />
          </svg>
        </div>

        {/* App name */}
        <span className="text-sm font-semibold text-white/90 tracking-tight">
          CrosshairOverlay
        </span>
      </div>

      {/* Center section - Controls */}
      <div
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Overlay toggle */}
        <motion.button
          className={`
            p-1.5 rounded-md transition-colors
            ${overlayVisible
              ? 'bg-accent-500/20 text-accent-400 hover:bg-accent-500/30'
              : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }
          `}
          onMouseEnter={() => setHovered('overlay')}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleOverlay}
          title={overlayVisible ? 'Hide overlay' : 'Show overlay'}
        >
          {overlayVisible ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </motion.button>

        {/* Settings */}
        <motion.button
          className="p-1.5 rounded-md text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          onMouseEnter={() => setHovered('settings')}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Right section - Window controls */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Minimize */}
        <motion.button
          className="h-[36px] w-[46px] flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          onMouseEnter={() => setHovered('minimize')}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electronAPI?.app?.minimize()}
          title="Minimize"
        >
          <Minus className="w-4 h-4" />
        </motion.button>

        {/* Maximize */}
        <motion.button
          className="h-[36px] w-[46px] flex items-center justify-center text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          onMouseEnter={() => setHovered('maximize')}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electronAPI?.app?.maximize()}
          title="Maximize"
        >
          <Square className="w-3.5 h-3.5" />
        </motion.button>

        {/* Close */}
        <motion.button
          className="h-[36px] w-[46px] flex items-center justify-center text-white/40 hover:bg-red-500 hover:text-white transition-colors"
          onMouseEnter={() => setHovered('close')}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ backgroundColor: 'rgb(239, 68, 68)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electronAPI?.app?.quit()}
          title="Close"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
