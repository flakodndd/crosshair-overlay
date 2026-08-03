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
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const width = collapsed ? 64 : 240;

  return (
    <motion.aside
      className="h-full bg-[#08080e] border-r border-white/[0.06] flex flex-col overflow-hidden"
      animate={{ width }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Logo section */}
      <div className="h-[52px] flex items-center px-4 border-b border-white/5">
        <motion.div
          className="flex items-center gap-3 overflow-hidden"
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent-500">
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="8" />
              <line x1="12" y1="16" x2="12" y2="22" />
              <line x1="2" y1="12" x2="8" y2="12" />
              <line x1="16" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-white/90 whitespace-nowrap">
              Crosshair
            </span>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative
                ${isActive
                  ? 'bg-accent-500/10 text-accent-400'
                  : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                }
              `}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewChange(item.id)}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-500 rounded-r-full"
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className="w-5 h-5 flex-shrink-0" />

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="text-sm font-medium whitespace-nowrap"
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
        <div className="px-3 py-4 border-t border-white/5">
          <div className="text-xs text-white/30 mb-2 px-1">Current Crosshair</div>
          <div className="bg-[#1a1a2e] rounded-lg p-3 flex items-center justify-center">
            <CrosshairRenderer config={currentCrosshair} size={48} />
          </div>
          <div className="mt-2 px-1 text-xs text-white/50 truncate">
            {currentCrosshair.name || 'Unnamed'}
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="px-2 py-3 border-t border-white/5">
        <motion.button
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.aside>
  );
}
