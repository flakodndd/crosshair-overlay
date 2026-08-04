import { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Grid3x3, Lock, Unlock, Info } from 'lucide-react';
import { CrosshairRenderer } from './CrosshairRenderer';
import { useCrosshairStore } from '../stores/crosshairStore';

type BackgroundType = 'dark' | 'light' | 'gradient' | 'cs' | 'valorant';

const backgrounds: Record<BackgroundType, string> = {
  dark: '#12121f',
  light: '#e8e8f0',
  gradient: '#1a1a2e',
  cs: '#2a3a2a',
  valorant: '#1a1a2e',
};

const backgroundLabels: Record<BackgroundType, string> = {
  dark: 'Dark',
  light: 'Light',
  gradient: 'Gradient',
  cs: 'CS',
  valorant: 'Val',
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-white/60">Preview</span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-lg px-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            <motion.button
              className="p-1 rounded text-white/35 hover:text-white/60 transition-colors"
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </motion.button>
            <span className="text-[10px] text-white/40 w-10 text-center font-mono">{zoom.toFixed(1)}x</span>
            <motion.button
              className="p-1 rounded text-white/35 hover:text-white/60 transition-colors"
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              disabled={zoom >= 3}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <motion.button
            className={`p-1 rounded transition-colors ${
              showGrid ? 'bg-accent-500/15 text-accent-400' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid3x3 className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            className={`p-1 rounded transition-colors ${
              locked ? 'bg-green-500/15 text-green-400' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
            }`}
            whileTap={{ scale: 0.9 }}
            onClick={() => setLocked(!locked)}
          >
            {locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </motion.button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <motion.div
          className="relative rounded-xl overflow-hidden"
          style={{
            width: Math.max(240, effectiveSize + 80),
            height: Math.max(240, effectiveSize + 80),
            backgroundColor: backgrounds[background],
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
          layout
          transition={{ duration: 0.3 }}
        >
          {showGrid && (
            <div className="absolute inset-0 opacity-[0.06]">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
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
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.06]" />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.06]" />
            </>
          )}
        </motion.div>
      </div>

      {/* Background selector */}
      <div className="px-4 py-2.5 border-t border-white/[0.04]">
        <div className="flex gap-1.5">
          {(Object.keys(backgrounds) as BackgroundType[]).map((bg) => (
            <motion.button
              key={bg}
              className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                background === bg
                  ? 'bg-accent-500/15 text-accent-400 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                  : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
              }`}
              style={background !== bg ? {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
              } : { border: '1px solid rgba(99,102,241,0.2)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setBackground(bg)}
            >
              {backgroundLabels[bg]}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Info bar */}
      <div className="px-4 py-2.5 border-t border-white/[0.04]"
        style={{ background: 'rgba(255,255,255,0.01)' }}
      >
        <div className="grid grid-cols-4 gap-3 text-[10px]">
          <div>
            <span className="text-white/20 block mb-0.5">Color</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: crosshair.hex || crosshair.color }} />
              <span className="text-white/45 font-mono uppercase">{(crosshair.hex || crosshair.color || '#00ff00').slice(0, 7)}</span>
            </div>
          </div>
          <div>
            <span className="text-white/20 block mb-0.5">Lines</span>
            <span className="text-white/45">{crosshair.horizontalWidth}x{crosshair.verticalHeight}</span>
          </div>
          <div>
            <span className="text-white/20 block mb-0.5">Thick</span>
            <span className="text-white/45">{crosshair.thickness}px</span>
          </div>
          <div>
            <span className="text-white/20 block mb-0.5">Gap</span>
            <span className="text-white/45">{crosshair.gap}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}
