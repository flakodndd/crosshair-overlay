import React from 'react';
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
  premium: 'Premium',
  custom: 'Custom',
};

export const CrosshairCard = React.memo(function CrosshairCard({ crosshair, selected = false, onSelect, onFavorite }: CrosshairCardProps) {
  const favorites = useCrosshairStore((s) => s.favorites);
  const isFavorited = favorites.includes(crosshair.id);
  const isPremium = crosshair.category === 'premium';

  return (
    <div
      className={`
        relative group cursor-pointer rounded-xl
        transition-all duration-200 ease-out
        ${selected
          ? 'ring-2 ring-accent-500/60 shadow-lg shadow-accent-500/15'
          : 'hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5 hover:scale-[1.02]'
        }
        active:scale-[0.97]
      `}
      style={{
        background: selected
          ? 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
        border: `1px solid ${selected ? 'rgba(99,102,241,0.35)' : isPremium ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)'}`,
        boxShadow: isPremium && !selected ? '0 0 20px rgba(245,158,11,0.05)' : undefined,
      }}
      onClick={() => onSelect(crosshair)}
    >
      {/* Preview area */}
      <div className="relative h-28 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
          overflow: 'visible',
        }}
      >
        {/* Subtle radial glow behind crosshair */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 rounded-full bg-accent-500/10 blur-xl" />
        </div>

        <CrosshairRenderer config={crosshair} size={56} />

        {/* Category badge */}
        <span className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md backdrop-blur-sm ${
          isPremium ? 'premium-badge' : 'bg-white/[0.06] text-white/40'
        }`}
          style={!isPremium ? { border: '1px solid rgba(255,255,255,0.06)' } : undefined}
        >
          {isPremium ? 'Premium' : categoryLabels[crosshair.category] || crosshair.category}
        </span>

        {/* Favorite button */}
        <button
          className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-90"
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
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
        </button>
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
    </div>
  );
});
