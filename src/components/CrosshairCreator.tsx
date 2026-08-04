import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Crosshair,
  Palette,
  Sparkles,
  Circle,
  Settings,
  Play,
  Save,
  Download,
  RotateCcw,
  Upload,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { CrosshairConfig, AnimationType } from '../types';
import { useCrosshairStore } from '../stores/crosshairStore';
import { usePresetStore } from '../stores/presetStore';
import { CrosshairRenderer } from './CrosshairRenderer';

const DEFAULT_CROSSHAIR: CrosshairConfig = {
  id: 'custom-new',
  name: 'Custom Crosshair',
  category: 'custom',
  width: 20,
  height: 20,
  thickness: 2,
  gap: 4,
  opacity: 1,
  color: '#ffffff',
  hex: '#ffffff',
  glow: false,
  glowIntensity: 3,
  outline: false,
  outlineThickness: 1,
  rotation: 0,
  shadow: false,
  shadowBlur: 4,
  roundedEdges: false,
  horizontalWidth: 20,
  horizontalHeight: 2,
  verticalWidth: 2,
  verticalHeight: 20,
  centerDot: false,
  centerDotSize: 4,
  centerDotColor: '#ffffff',
  circle: false,
  circleRadius: 12,
  circleThickness: 2,
  circleColor: '#ffffff',
  offset: 0,
  offsetX: 0,
  offsetY: 0,
  transparency: 0,
  animation: 'none',
  animationSpeed: 1,
  gradient: false,
  gradientColors: ['#6366f1', '#ec4899'],
  rainbowMode: false,
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

function Slider({ label, value, min, max, step = 1, onChange, unit = '' }: SliderProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="text-[11px] text-white/40 w-16 shrink-0 font-medium">{label}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1 bg-white/[0.06] rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500
            [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_0_8px_rgba(99,102,241,0.3)]
            [&::-webkit-slider-thumb]:hover:bg-accent-400 [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
      <span className="text-[11px] text-white/50 w-10 text-right tabular-nums font-mono">
        {typeof value === 'number' ? (step < 1 ? value.toFixed(1) : value) : value}{unit}
      </span>
    </div>
  );
}

interface ToggleProps {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ReactNode;
}

function Toggle({ label, enabled, onChange, icon }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[11px] text-white/45 font-medium">{label}</span>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-8 h-[18px] rounded-full transition-all duration-200 ${
          enabled
            ? 'bg-accent-500 shadow-[0_0_8px_rgba(99,102,241,0.3)]'
            : 'bg-white/[0.08]'
        }`}
      >
        <motion.div
          className="absolute top-[2px] left-[2px] w-[14px] h-[14px] rounded-full bg-white shadow-sm"
          animate={{ x: enabled ? 16 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

function ColorPicker({ label, color, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(color);

  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-1.5 py-1">
      <span className="text-[11px] text-white/40 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer group">
          <div
            className="w-7 h-7 rounded-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => {
              onChange(e.target.value);
              setHexInput(e.target.value);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <input
          type="text"
          value={hexInput}
          onChange={(e) => handleHexChange(e.target.value)}
          onBlur={() => setHexInput(color)}
          className="flex-1 px-2 py-1 rounded-lg text-[11px] text-white/70 font-mono"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
          }}
          onBlurCapture={() => {}}
          placeholder="#ffffff"
        />
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, icon, defaultOpen = false, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-white/[0.04] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-accent-400/70">{icon}</span>
          <span className="text-[12px] font-semibold text-white/65">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-white/25" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CrosshairCreator() {
  const { editingCrosshair, activeCrosshair, setEditingCrosshair, addCustomCrosshair } = useCrosshairStore();
  const { createPreset } = usePresetStore();
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);

  const crosshair = editingCrosshair || activeCrosshair || DEFAULT_CROSSHAIR;

  const updateCrosshair = useCallback((updates: Partial<CrosshairConfig>) => {
    const updated = { ...crosshair, ...updates };
    setEditingCrosshair(updated);
  }, [crosshair, setEditingCrosshair]);

  const handleSaveAsPreset = useCallback(() => {
    createPreset(crosshair.name || 'Custom Crosshair', crosshair);
  }, [crosshair, createPreset]);

  const handleExportPNG = useCallback(() => {
    if (!previewRef.current) return;
    const svg = previewRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = 256;
      canvas.height = 256;
      ctx.drawImage(img, 0, 0, 256, 256);
      const link = document.createElement('a');
      link.download = `${crosshair.name || 'crosshair'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }, [crosshair.name]);

  const handleReset = useCallback(() => {
    setEditingCrosshair({ ...DEFAULT_CROSSHAIR, id: crosshair.id, name: crosshair.name });
  }, [crosshair.id, crosshair.name, setEditingCrosshair]);

  const handleImportPNG = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        console.log('Imported PNG:', dataUrl);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, []);

  const previewSize = useMemo(() => Math.min(320, 200 * zoom), [zoom]);

  return (
    <div className="flex h-full bg-[#0f0f1a]">
      {/* LEFT SIDE - Preview */}
      <div className="flex-1 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-accent-400/70" />
            <span className="text-[12px] font-semibold text-white/65">Live Preview</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg transition-all ${
                showGrid ? 'bg-accent-500/15 text-accent-400' : 'text-white/25 hover:text-white/50 hover:bg-white/[0.04]'
              }`}
              title="Toggle grid"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-white/30 w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04] transition-all"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.01)' }}
        >
          <div
            ref={previewRef}
            className="relative rounded-xl overflow-hidden"
            style={{
              width: previewSize,
              height: previewSize,
              background: 'linear-gradient(135deg, #16162a 0%, #12121f 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            {showGrid && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <CrosshairRenderer config={crosshair} size={previewSize * 0.7} />
            </div>

            {/* Settings Overlay */}
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
              {[
                crosshair.horizontalWidth && `H:${crosshair.horizontalWidth}`,
                crosshair.verticalHeight && `V:${crosshair.verticalHeight}`,
                crosshair.thickness && `T:${crosshair.thickness}`,
                crosshair.gap !== undefined && `G:${crosshair.gap}`,
                crosshair.rotation !== 0 && `R:${crosshair.rotation}°`,
                crosshair.glow && 'Glow',
                crosshair.outline && 'Outline',
                crosshair.shadow && 'Shadow',
                crosshair.centerDot && 'Dot',
                crosshair.circle && 'Circle',
                crosshair.rainbowMode && 'Rainbow',
                crosshair.gradient && 'Gradient',
                crosshair.animation !== 'none' && crosshair.animation,
              ]
                .filter(Boolean)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[9px] text-white/50"
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Editor Panel */}
      <div className="w-[360px] flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(14,14,22,0.98) 0%, rgba(10,10,16,1) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Editor Header */}
        <div className="px-4 py-2.5 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Settings className="w-3.5 h-3.5 text-accent-400/70" />
            <span className="text-[12px] font-semibold text-white/65">Editor</span>
          </div>
        </div>

        {/* Scrollable Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Basic Properties */}
          <Section title="Basic Properties" icon={<Crosshair className="w-4 h-4" />} defaultOpen>
            <Slider label="Size" value={crosshair.size ?? 1} min={0.1} max={5} step={0.1} onChange={(v) => updateCrosshair({ size: v })} />
            <Slider label="Gap" value={crosshair.gap} min={0} max={50} onChange={(v) => updateCrosshair({ gap: v })} />
            <Slider label="Opacity" value={Math.round(crosshair.opacity * 100)} min={0} max={100} unit="%" onChange={(v) => updateCrosshair({ opacity: v / 100 })} />
            <Slider label="Rotation" value={crosshair.rotation} min={0} max={360} unit="°" onChange={(v) => updateCrosshair({ rotation: v })} />
            <Toggle label="Rounded edges" enabled={crosshair.roundedEdges} onChange={(v) => updateCrosshair({ roundedEdges: v })} />
          </Section>

          {/* Color */}
          <Section title="Color" icon={<Palette className="w-4 h-4" />} defaultOpen>
            <ColorPicker label="Main Color" color={crosshair.hex} onChange={(v) => updateCrosshair({ hex: v, color: v })} />
            <Slider
              label="Color Opacity"
              value={Math.round(crosshair.opacity * 100)}
              min={0}
              max={100}
              unit="%"
              onChange={(v) => updateCrosshair({ opacity: v / 100 })}
            />
            <Toggle label="Rainbow Mode" enabled={crosshair.rainbowMode} onChange={(v) => updateCrosshair({ rainbowMode: v })} />
            <Toggle
              label="Gradient"
              enabled={crosshair.gradient}
              onChange={(v) => updateCrosshair({ gradient: v })}
            />
            {crosshair.gradient && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 pl-2 border-l-2 border-accent-500/20"
              >
                <ColorPicker
                  label="Gradient End"
                  color={crosshair.gradientColors?.[1] || '#ec4899'}
                  onChange={(v) => updateCrosshair({ gradientColors: [crosshair.gradientColors?.[0] || '#6366f1', v] })}
                />
              </motion.div>
            )}
          </Section>

          {/* Effects */}
          <Section title="Effects" icon={<Sparkles className="w-4 h-4" />}>
            <Toggle
              label="Glow"
              enabled={crosshair.glow}
              onChange={(v) => updateCrosshair({ glow: v })}
              icon={crosshair.glow ? <Eye className="w-3 h-3 text-accent-400" /> : <EyeOff className="w-3 h-3" />}
            />
            {crosshair.glow && (
              <Slider
                label="Intensity"
                value={crosshair.glowIntensity}
                min={0}
                max={20}
                step={0.5}
                onChange={(v) => updateCrosshair({ glowIntensity: v })}
              />
            )}

            <Toggle
              label="Outline"
              enabled={crosshair.outline}
              onChange={(v) => updateCrosshair({ outline: v })}
              icon={crosshair.outline ? <Eye className="w-3 h-3 text-accent-400" /> : <EyeOff className="w-3 h-3" />}
            />
            {crosshair.outline && (
              <Slider
                label="Thickness"
                value={crosshair.outlineThickness}
                min={1}
                max={5}
                onChange={(v) => updateCrosshair({ outlineThickness: v })}
              />
            )}

            <Toggle
              label="Shadow"
              enabled={crosshair.shadow}
              onChange={(v) => updateCrosshair({ shadow: v })}
              icon={crosshair.shadow ? <Eye className="w-3 h-3 text-accent-400" /> : <EyeOff className="w-3 h-3" />}
            />
            {crosshair.shadow && (
              <Slider
                label="Blur"
                value={crosshair.shadowBlur}
                min={0}
                max={20}
                onChange={(v) => updateCrosshair({ shadowBlur: v })}
              />
            )}
          </Section>

          {/* Center Dot */}
          <Section title="Center Dot" icon={<Circle className="w-4 h-4" />}>
            <Toggle
              label="Enable Center Dot"
              enabled={crosshair.centerDot}
              onChange={(v) => updateCrosshair({ centerDot: v })}
            />
            {crosshair.centerDot && (
              <>
                <Slider
                  label="Size"
                  value={crosshair.centerDotSize}
                  min={1}
                  max={20}
                  onChange={(v) => updateCrosshair({ centerDotSize: v })}
                />
                <ColorPicker
                  label="Dot Color"
                  color={crosshair.centerDotColor}
                  onChange={(v) => updateCrosshair({ centerDotColor: v })}
                />
              </>
            )}
          </Section>

          {/* Circle */}
          <Section title="Circle" icon={<Circle className="w-4 h-4" />}>
            <Toggle
              label="Enable Circle"
              enabled={crosshair.circle}
              onChange={(v) => updateCrosshair({ circle: v })}
            />
            {crosshair.circle && (
              <>
                <Slider
                  label="Radius"
                  value={crosshair.circleRadius}
                  min={5}
                  max={100}
                  onChange={(v) => updateCrosshair({ circleRadius: v })}
                />
                <Slider
                  label="Thickness"
                  value={crosshair.circleThickness}
                  min={1}
                  max={5}
                  onChange={(v) => updateCrosshair({ circleThickness: v })}
                />
                <ColorPicker
                  label="Circle Color"
                  color={crosshair.circleColor}
                  onChange={(v) => updateCrosshair({ circleColor: v })}
                />
              </>
            )}
          </Section>

          {/* Advanced */}
          <Section title="Advanced" icon={<Settings className="w-4 h-4" />}>
            <Slider
              label="H. Length"
              value={crosshair.horizontalWidth}
              min={0}
              max={100}
              onChange={(v) => updateCrosshair({ horizontalWidth: v })}
            />
            <Slider
              label="H. Thickness"
              value={crosshair.horizontalHeight}
              min={0}
              max={20}
              onChange={(v) => updateCrosshair({ horizontalHeight: v })}
            />
            <Slider
              label="V. Length"
              value={crosshair.verticalHeight}
              min={0}
              max={100}
              onChange={(v) => updateCrosshair({ verticalHeight: v })}
            />
            <Slider
              label="V. Thickness"
              value={crosshair.verticalWidth}
              min={0}
              max={20}
              onChange={(v) => updateCrosshair({ verticalWidth: v })}
            />
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs text-white/30 mb-2 block">Offset</span>
              <Slider
                label="X"
                value={crosshair.offsetX}
                min={-50}
                max={50}
                onChange={(v) => updateCrosshair({ offsetX: v })}
              />
              <Slider
                label="Y"
                value={crosshair.offsetY}
                min={-50}
                max={50}
                onChange={(v) => updateCrosshair({ offsetY: v })}
              />
            </div>
          </Section>

          {/* Animation */}
          <Section title="Animation" icon={<Play className="w-4 h-4" />}>
            <div className="space-y-1.5">
              <span className="text-[11px] text-white/40 font-medium">Animation Type</span>
              <div className="grid grid-cols-3 gap-1">
                {(['none', 'pulse', 'breathe', 'fade', 'rotate', 'scale'] as AnimationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateCrosshair({ animation: type })}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                      crosshair.animation === type
                        ? 'bg-accent-500/15 text-accent-400 shadow-[0_0_8px_rgba(99,102,241,0.15)]'
                        : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'
                    }`}
                    style={crosshair.animation !== type ? {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    } : { border: '1px solid rgba(99,102,241,0.2)' }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            {crosshair.animation !== 'none' && (
              <Slider
                label="Speed"
                value={crosshair.animationSpeed}
                min={0.1}
                max={3}
                step={0.1}
                unit="s"
                onChange={(v) => updateCrosshair({ animationSpeed: v })}
              />
            )}
          </Section>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/[0.04] space-y-2"
          style={{ background: 'rgba(255,255,255,0.01)' }}
        >
          <button
            onClick={handleSaveAsPreset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
              boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
            }}
          >
            <Save className="w-3.5 h-3.5" />
            Save as Preset
          </button>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handleExportPNG}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-white/45 transition-all hover:text-white/65"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-white/45 transition-all hover:text-white/65"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
            <button
              onClick={handleImportPNG}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] text-white/45 transition-all hover:text-white/65"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <Upload className="w-3 h-3" />
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
