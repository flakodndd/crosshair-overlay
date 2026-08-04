import { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Square, X, Eye, EyeOff } from 'lucide-react';

interface TitleBarProps {
  overlayVisible?: boolean;
  onToggleOverlay?: () => void;
  onOpenSettings?: () => void;
}

export function TitleBar({
  overlayVisible = true,
  onToggleOverlay,
}: TitleBarProps) {
  return (
    <div
      className="h-[38px] flex items-center justify-between bg-[#0a0a12]/90 backdrop-blur-2xl border-b border-white/[0.06] select-none relative"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Subtle top highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      {/* Left section - App info */}
      <div className="flex items-center gap-2.5 pl-4">
        <div className="relative w-5 h-5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="text-accent-400">
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="12" y1="2.5" x2="12" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="16.5" x2="12" y2="21.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2.5" y1="12" x2="7.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16.5" y1="12" x2="21.5" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </svg>
        </div>
        <span className="text-[13px] font-semibold text-white/80 tracking-tight">
          CrosshairOverlay
        </span>
        <span className="text-[10px] text-white/20 font-medium tracking-widest uppercase ml-0.5">Pro</span>
      </div>

      {/* Center section - Controls */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* Overlay toggle */}
        <motion.button
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all
            ${overlayVisible
              ? 'bg-accent-500/15 text-accent-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
              : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onToggleOverlay}
          title={overlayVisible ? 'Hide overlay' : 'Show overlay'}
        >
          {overlayVisible ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Overlay On</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Overlay Off</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Right section - Window controls */}
      <div
        className="flex items-center"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <motion.button
          className="h-[38px] w-[44px] flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-colors"
          whileTap={{ scale: 0.9 }}
          onClick={() => window.electronAPI?.app?.minimize()}
          title="Minimize"
        >
          <Minus className="w-3.5 h-3.5" />
        </motion.button>
        <motion.button
          className="h-[38px] w-[44px] flex items-center justify-center text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-colors"
          whileTap={{ scale: 0.9 }}
          onClick={() => window.electronAPI?.app?.maximize()}
          title="Maximize"
        >
          <Square className="w-3 h-3" />
        </motion.button>
        <motion.button
          className="h-[38px] w-[44px] flex items-center justify-center text-white/30 hover:bg-red-500/90 hover:text-white transition-colors rounded-tr-lg"
          whileTap={{ scale: 0.9 }}
          onClick={() => window.electronAPI?.app?.quit()}
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </div>
  );
}
