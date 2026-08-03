import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pipette, Copy, Check, RotateCcw } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7',
  '#ec4899', '#f43f5e', '#78716c', '#64748b', '#ffffff',
  '#f8fafc', '#e2e8f0', '#94a3b8', '#475569', '#0f172a',
];

const RECENT_COLORS_KEY = 'color-picker-recent';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => {
        const hex = Math.max(0, Math.min(255, Math.round(v))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  v /= 100;
  let r = 0;
  let g = 0;
  let b = 0;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hexInput, setHexInput] = useState(value);
  const [recentColors, setRecentColors] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_COLORS_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [copied, setCopied] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const rgb = hexToRgb(value);
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

  const [saturation, setSaturation] = useState(hsv.s);
  const [brightness, setBrightness] = useState(hsv.v);
  const [hue, setHue] = useState(hsv.h);

  useEffect(() => {
    const newRgb = hsvToRgb(hue, saturation, brightness);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHexInput(newHex);
  }, [hue, saturation, brightness]);

  useEffect(() => {
    const newRgb = hexToRgb(value);
    const newHsv = rgbToHsv(newRgb.r, newRgb.g, newRgb.b);
    setHue(newHsv.h);
    setSaturation(newHsv.s);
    setBrightness(newHsv.v);
    setHexInput(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addRecentColor = useCallback(
    (color: string) => {
      setRecentColors((prev) => {
        const updated = [color, ...prev.filter((c) => c !== color)].slice(0, 10);
        localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const handleHexSubmit = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput)) {
      onChange(hexInput);
      addRecentColor(hexInput);
    }
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaturationBrightnessChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setSaturation(x * 100);
      setBrightness((1 - y) * 100);
      const newRgb = hsvToRgb(hue, x * 100, (1 - y) * 100);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onChange(newHex);
    },
    [hue, onChange]
  );

  const handleHueChange = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newHue = x * 360;
      setHue(newHue);
      const newRgb = hsvToRgb(newHue, saturation, brightness);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      onChange(newHex);
    },
    [saturation, brightness, onChange]
  );

  const hueColor = rgbToHex(...Object.values(hsvToRgb(hue, 100, 100)));

  return (
    <div className={`relative inline-flex ${className || ''}`}>
      <button
        ref={buttonRef}
        className="w-8 h-8 rounded-lg border-2 border-white/10 hover:border-white/20
          transition-colors shadow-sm cursor-pointer overflow-hidden"
        style={{ backgroundColor: value }}
        onClick={() => setIsOpen(!isOpen)}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a2e] border border-white/10
              rounded-xl shadow-2xl p-4 z-50"
          >
            {/* Saturation/Brightness picker */}
            <div
              className="w-full h-40 rounded-lg cursor-crosshair relative overflow-hidden mb-3"
              style={{
                background: `
                  linear-gradient(to top, #000, transparent),
                  linear-gradient(to right, #fff, ${hueColor})
                `,
              }}
              onMouseDown={(e) => {
                handleSaturationBrightnessChange(e);
                const onMove = (ev: MouseEvent) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                  const y = Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height));
                  setSaturation(x * 100);
                  setBrightness((1 - y) * 100);
                  const newRgb = hsvToRgb(hue, x * 100, (1 - y) * 100);
                  onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            >
              <div
                className="absolute w-3.5 h-3.5 border-2 border-white rounded-full shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - brightness}%`,
                }}
              />
            </div>

            {/* Hue slider */}
            <div
              className="w-full h-3 rounded-full cursor-pointer relative mb-3"
              style={{
                background:
                  'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
              }}
              onMouseDown={(e) => {
                handleHueChange(e);
                const onMove = (ev: MouseEvent) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const x = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
                  const newHue = x * 360;
                  setHue(newHue);
                  const newRgb = hsvToRgb(newHue, saturation, brightness);
                  onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
                };
                const onUp = () => {
                  document.removeEventListener('mousemove', onMove);
                  document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
              }}
            >
              <div
                className="absolute w-3.5 h-3.5 border-2 border-white rounded-full shadow-md -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${(hue / 360) * 100}%`,
                  backgroundColor: hueColor,
                }}
              />
            </div>

            {/* Hex input and RGB */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-[10px] text-white/30 mb-1 block">HEX</label>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onBlur={handleHexSubmit}
                  onKeyDown={(e) => e.key === 'Enter' && handleHexSubmit()}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg
                    text-xs text-white/80 font-mono focus:outline-none focus:border-accent-500/50"
                />
              </div>
              <div className="w-14">
                <label className="text-[10px] text-white/30 mb-1 block">R</label>
                <input
                  type="number"
                  value={rgb.r}
                  min={0}
                  max={255}
                  onChange={(e) => {
                    const newHex = rgbToHex(Number(e.target.value), rgb.g, rgb.b);
                    onChange(newHex);
                  }}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg
                    text-xs text-white/80 font-mono focus:outline-none focus:border-accent-500/50"
                />
              </div>
              <div className="w-14">
                <label className="text-[10px] text-white/30 mb-1 block">G</label>
                <input
                  type="number"
                  value={rgb.g}
                  min={0}
                  max={255}
                  onChange={(e) => {
                    const newHex = rgbToHex(rgb.r, Number(e.target.value), rgb.b);
                    onChange(newHex);
                  }}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg
                    text-xs text-white/80 font-mono focus:outline-none focus:border-accent-500/50"
                />
              </div>
              <div className="w-14">
                <label className="text-[10px] text-white/30 mb-1 block">B</label>
                <input
                  type="number"
                  value={rgb.b}
                  min={0}
                  max={255}
                  onChange={(e) => {
                    const newHex = rgbToHex(rgb.r, rgb.g, Number(e.target.value));
                    onChange(newHex);
                  }}
                  className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg
                    text-xs text-white/80 font-mono focus:outline-none focus:border-accent-500/50"
                />
              </div>
            </div>

            {/* Copy hex button */}
            <motion.button
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/5
                border border-white/10 rounded-lg text-xs text-white/60 hover:bg-white/10
                transition-colors mb-3"
              whileTap={{ scale: 0.98 }}
              onClick={handleCopyHex}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy hex
                </>
              )}
            </motion.button>

            {/* Preset colors */}
            <div className="mb-2">
              <label className="text-[10px] text-white/30 mb-1.5 block">Presets</label>
              <div className="grid grid-cols-10 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`
                      w-5 h-5 rounded border transition-all
                      ${value === color ? 'border-white scale-110' : 'border-white/10 hover:border-white/30'}
                    `}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color);
                      addRecentColor(color);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Recent colors */}
            {recentColors.length > 0 && (
              <div>
                <label className="text-[10px] text-white/30 mb-1.5 block">Recent</label>
                <div className="flex gap-1.5 flex-wrap">
                  {recentColors.map((color, i) => (
                    <button
                      key={`${color}-${i}`}
                      className={`
                        w-5 h-5 rounded border transition-all
                        ${value === color ? 'border-white scale-110' : 'border-white/10 hover:border-white/30'}
                      `}
                      style={{ backgroundColor: color }}
                      onClick={() => onChange(color)}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
