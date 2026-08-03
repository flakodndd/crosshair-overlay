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
        bg-[#13131d] border transition-all duration-200
        ${selected
          ? 'border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10'
          : 'border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20'
        }
      `}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(crosshair)}
      layout
    >
      {/* Preview area */}
      <div className="relative h-32 flex items-center justify-center bg-gradient-to-b from-[#0e0e18] to-[#111119]">
        <CrosshairRenderer
          config={crosshair}
          size={64}
        />

        {/* Category badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
          {categoryLabels[crosshair.category] || crosshair.category}
        </span>

        {/* Favorite button */}
        <motion.button
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(crosshair.id);
          }}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorited
                ? 'fill-pink-500 text-pink-500'
                : 'text-white/40 hover:text-white/60'
            }`}
          />
        </motion.button>
      </div>

      {/* Info area */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-white/90 truncate">
          {crosshair.name || 'Unnamed Crosshair'}
        </h3>
        <p className="text-xs text-white/40 mt-0.5">
          {crosshair.color || '#00ff00'}
        </p>
      </div>

      {/* Hover overlay */}
      <motion.div
        className="absolute inset-0 bg-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      />
    </motion.div>
  );
}
