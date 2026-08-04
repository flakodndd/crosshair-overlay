import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { CrosshairConfig } from '../types';
import { CrosshairRenderer } from './CrosshairRenderer';
import { useCrosshairStore } from '../stores/crosshairStore';

interface CrosshairCardProps {
  crosshair: CrosshairConfig;
  selected?: boolean;
  onSelect: (crosshair: CrosshairConfig) => void;
  onFavorite: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
  dot: 'Dot',
  classic: 'Classic',
  tactical: 'Tactical',
  circle: 'Circle',
  dynamic: 'Dynamic',
  tshape: 'T-Shape',
  sniper: 'Sniper',
  hollow: 'Hollow',
  minimal: 'Minimal',
  esports: 'Esports',
  fps: 'FPS',
  retro: 'Retro',
  custom: 'Custom',
};

export function CrosshairCard({ crosshair, selected = false, onSelect, onFavorite }: CrosshairCardProps) {
  const favorites = useCrosshairStore((s) => s.favorites);
  const isFavorited = favorites.includes(crosshair.id);

  return (
    <motion.div
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden
        transition-all duration-200
        ${selected
          ? 'ring-2 ring-accent-500/50 shadow-lg shadow-accent-500/10'
          : 'hover:shadow-lg hover:shadow-black/30'
        }
      `}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.03) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
        border: `1px solid ${selected ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)'}`,
      }}
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(crosshair)}
      layout
    >
      {/* Preview area */}
      <div className="relative h-28 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
        }}
      >
        {/* Subtle radial glow behind crosshair */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-accent-500/10 blur-xl" />
        </div>

        <CrosshairRenderer config={crosshair} size={56} />

        {/* Category badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-white/[0.06] text-white/40 backdrop-blur-sm"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {categoryLabels[crosshair.category] || crosshair.category}
        </span>

        {/* Favorite button */}
        <motion.button
          className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200"
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(crosshair.id);
          }}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isFavorited
                ? 'fill-pink-500 text-pink-500'
                : 'text-white/40 hover:text-white/70'
            }`}
          />
        </motion.button>
      </div>

      {/* Info area */}
      <div className="px-3 py-2.5">
        <h3 className="text-[12px] font-semibold text-white/80 truncate">
          {crosshair.name || 'Unnamed'}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-2 h-2 rounded-full ring-1 ring-white/10" style={{ backgroundColor: crosshair.hex || crosshair.color }} />
          <span className="text-[10px] text-white/30 font-mono uppercase">{crosshair.hex || crosshair.color}</span>
        </div>
      </div>
    </motion.div>
  );
}
