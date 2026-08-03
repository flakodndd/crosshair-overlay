import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Grid3x3, Lock, Unlock, Info } from 'lucide-react';
import { CrosshairRenderer } from './CrosshairRenderer';
import { useCrosshairStore } from '../stores/crosshairStore';

type BackgroundType = 'dark' | 'light' | 'gradient' | 'cs' | 'valorant';

const backgrounds: Record<BackgroundType, string> = {
  dark: 'bg-[#12121f]',
  light: 'bg-[#e8e8f0]',
  gradient: 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
  cs: 'bg-[#2a3a2a]',
  valorant: 'bg-[#1a1a2e]',
};

const backgroundLabels: Record<BackgroundType, string> = {
  dark: 'Dark',
  light: 'Light',
  gradient: 'Gradient',
  cs: 'CS-like',
  valorant: 'Valorant',
};

export function Preview({ size = 200 }: { size?: number }) {
  const [background, setBackground] = useState<BackgroundType>('dark');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [showGuides, setShowGuides] = useState(false);
  const [locked, setLocked] = useState(false);

  const crosshair = useCrosshairStore((s) => s.activeCrosshair);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const effectiveSize = size * zoom;

  if (!crosshair) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-white/30">
        <Info className="w-8 h-8 mb-2" />
        <p className="text-sm">Select a crosshair to preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-white/40" />
          <span className="text-sm font-medium text-white/70">Preview</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <motion.button
              className="p-1.5 rounded-md text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>
            <span className="text-xs text-white/50 w-12 text-center">{zoom.toFixed(2)}x</span>
            <motion.button
              className="p-1.5 rounded-md text-white/40 hover:bg-white/5 hover:text-white/60 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>
          </div>

          <motion.button
            className={`p-1.5 rounded-md transition-colors ${
              showGrid ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3x3 className="w-4 h-4" />
          </motion.button>

          <motion.button
            className={`p-1.5 rounded-md transition-colors ${
              locked ? 'bg-green-500/20 text-green-400' : 'text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocked(!locked)}
          >
            {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <motion.div
          className={`relative ${backgrounds[background]} rounded-2xl border border-white/10 overflow-hidden`}
          style={{ width: Math.max(300, effectiveSize + 100), height: Math.max(300, effectiveSize + 100) }}
          layout
          transition={{ duration: 0.3 }}
        >
          {showGrid && (
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            </div>
          )}

          <div className="absolute inset-0 flex items-center justify-center">
            <CrosshairRenderer config={crosshair} size={effectiveSize} />
          </div>

          {showGuides && (
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
            </>
          )}
        </motion.div>
      </div>

      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-white/40">Background</span>
        </div>
        <div className="flex gap-2">
          {(Object.keys(backgrounds) as BackgroundType[]).map((bg) => (
            <motion.button
              key={bg}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                background === bg
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-transparent'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBackground(bg)}
            >
              {backgroundLabels[bg]}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
        <div className="grid grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-white/30 block">Color</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: crosshair.hex || crosshair.color }} />
              <span className="text-white/60">{crosshair.hex || crosshair.color}</span>
            </div>
          </div>
          <div>
            <span className="text-white/30 block">Size</span>
            <span className="text-white/60 mt-1 block">
              {crosshair.width}x{crosshair.height}
            </span>
          </div>
          <div>
            <span className="text-white/30 block">Thickness</span>
            <span className="text-white/60 mt-1 block">{crosshair.thickness}px</span>
          </div>
          <div>
            <span className="text-white/30 block">Gap</span>
            <span className="text-white/60 mt-1 block">{crosshair.gap}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
