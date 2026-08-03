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
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/50 w-16 shrink-0">{label}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-500
            [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(99,102,241,0.5)]
            [&::-webkit-slider-thumb]:hover:bg-accent-400 [&::-webkit-slider-thumb]:transition-colors
            [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>
      <span className="text-xs text-white/70 w-10 text-right tabular-nums">
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
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-white/50">{label}</span>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          enabled ? 'bg-accent-500' : 'bg-white/10'
        }`}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
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
    <div className="space-y-2">
      <span className="text-xs text-white/50">{label}</span>
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer">
          <div
            className="w-8 h-8 rounded-lg border-2 border-white/10 hover:border-white/20 transition-colors"
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
          className="flex-1 px-2.5 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80
            font-mono focus:outline-none focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/20 transition-all"
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
    <div className="border-b border-white/5 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-accent-400">{icon}</span>
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-white/30" />
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
            <div className="px-4 pb-4 space-y-3">
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
    <div className="flex h-full">
      {/* LEFT SIDE - Preview */}
      <div className="flex-1 flex flex-col border-r border-white/5">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-white/80">Live Preview</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-lg transition-colors ${
                showGrid ? 'bg-accent-500/20 text-accent-400' : 'text-white/30 hover:text-white/50 hover:bg-white/5'
              }`}
              title="Toggle grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/40 w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div
            ref={previewRef}
            className="relative"
            style={{
              width: previewSize,
              height: previewSize,
              backgroundColor: '#1a1a2e',
              borderRadius: 12,
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
      <div className="w-[380px] flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-white/80">Editor</span>
          </div>
        </div>

        {/* Scrollable Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Basic Properties */}
          <Section title="Basic Properties" icon={<Crosshair className="w-4 h-4" />} defaultOpen>
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
            <div className="space-y-2">
              <span className="text-xs text-white/50">Animation Type</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['none', 'pulse', 'breathe', 'fade', 'rotate', 'scale'] as AnimationType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateCrosshair({ animation: type })}
                    className={`px-2 py-1.5 rounded-lg text-xs capitalize transition-colors ${
                      crosshair.animation === type
                        ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                        : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                    }`}
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
        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={handleSaveAsPreset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600
              rounded-xl text-sm font-medium text-white transition-colors"
          >
            <Save className="w-4 h-4" />
            Save as Preset
          </button>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleExportPNG}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10
                rounded-xl text-xs text-white/60 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export PNG
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10
                rounded-xl text-xs text-white/60 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              onClick={handleImportPNG}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10
                rounded-xl text-xs text-white/60 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import PNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
