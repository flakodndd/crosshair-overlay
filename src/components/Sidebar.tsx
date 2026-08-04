import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid3x3,
  Paintbrush,
  Bookmark,
  Wrench,
  Settings,
  Info,
  Image,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CrosshairRenderer } from './CrosshairRenderer';
import type { CrosshairConfig } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  currentCrosshair?: CrosshairConfig;
}

const navItems = [
  { id: 'library', label: 'Crosshair Library', icon: Grid3x3 },
  { id: 'creator', label: 'Creator', icon: Paintbrush },
  { id: 'builder', label: 'Builder', icon: Wrench },
  { id: 'presets', label: 'Presets', icon: Bookmark },
  { id: 'background', label: 'Background', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'about', label: 'About', icon: Info },
];

export function Sidebar({ activeView, onViewChange, currentCrosshair }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const width = collapsed ? 60 : 220;

  return (
    <motion.aside
      className="h-full flex flex-col overflow-hidden relative"
      animate={{ width }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,18,0.99) 0%, rgba(6,6,12,1) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Subtle edge glow */}
      <div className="absolute right-0 inset-y-0 w-px bg-gradient-to-b from-accent-500/10 via-white/[0.03] to-transparent" />

      {/* Logo section */}
      <div className="h-[52px] flex items-center px-4 border-b border-white/[0.04]">
        <motion.div
          className="flex items-center gap-2.5 overflow-hidden"
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.08) 100%)',
              boxShadow: '0 0 12px rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" className="text-accent-400">
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
              <line x1="12" y1="3" x2="12" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="3" y1="12" x2="8" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="16" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-[13px] font-bold text-white/85 tracking-tight whitespace-nowrap">
              Crosshair
            </span>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              className={`
                nav-item w-full flex items-center gap-2.5 px-3 py-2 rounded-lg relative group
                ${isActive
                  ? 'text-accent-400'
                  : 'text-white/40 hover:text-white/60'
                }
              `}
              whileHover={{ x: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.id)}
            >
              {/* Active background */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 nav-item-active rounded-lg"
                  layoutId="activeNavBg"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-accent-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className="w-4 h-4 flex-shrink-0 relative z-10" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="text-[13px] font-medium whitespace-nowrap relative z-10"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </nav>

      {/* Current crosshair preview */}
      {!collapsed && currentCrosshair && (
        <div className="px-2.5 py-3 border-t border-white/[0.04]">
          <div className="text-[10px] text-white/25 mb-2 px-1 uppercase tracking-wider font-medium">Current</div>
          <div className="rounded-xl p-3 flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.04)',
              overflow: 'visible',
            }}
          >
            <CrosshairRenderer config={currentCrosshair} size={44} />
          </div>
          <div className="mt-2 px-1 text-[11px] text-white/45 truncate font-medium">
            {currentCrosshair.name || 'Unnamed'}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-2.5 border-t border-white/[0.04]">
        <motion.button
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-white/30 hover:bg-white/[0.04] hover:text-white/50 transition-colors"
          whileTap={{ scale: 0.97 }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] font-medium">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
