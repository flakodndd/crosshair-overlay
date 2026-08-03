import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Square,
  Trash2,
  Upload,
  Download,
  Undo2,
  Move,
  Image,
} from 'lucide-react';
import { useCrosshairStore } from '../stores/crosshairStore';
import type { CrosshairConfig } from '../types';

const CANVAS_SIZE = 400;

interface DrawnRect {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
}

export function Builder() {
  const { editingCrosshair, setEditingCrosshair, addCustomCrosshair } = useCrosshairStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tool, setTool] = useState<'rect' | 'move'>('rect');
  const [drawColor, setDrawColor] = useState('#ffffff');
  const [rects, setRects] = useState<DrawnRect[]>([]);
  const [history, setHistory] = useState<DrawnRect[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);
  const [movingRect, setMovingRect] = useState<number | null>(null);
  const [moveOffset, setMoveOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const saveHistory = (newRects: DrawnRect[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newRects]);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const redraw = useCallback((r: DrawnRect[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    r.forEach((rect) => {
      ctx.fillStyle = rect.color;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    });
  }, []);

  useEffect(() => {
    redraw(rects);
  }, [rects, redraw]);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);

    if (tool === 'move') {
      for (let i = rects.length - 1; i >= 0; i--) {
        const r = rects[i];
        if (coords.x >= r.x && coords.x <= r.x + r.w && coords.y >= r.y && coords.y <= r.y + r.h) {
          setMovingRect(i);
          setMoveOffset({ x: coords.x - r.x, y: coords.y - r.y });
          return;
        }
      }
      return;
    }

    setDragStart(coords);
    setDragCurrent(coords);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);

    if (movingRect !== null) {
      const newRects = [...rects];
      newRects[movingRect] = {
        ...newRects[movingRect],
        x: coords.x - moveOffset.x,
        y: coords.y - moveOffset.y,
      };
      setRects(newRects);
      return;
    }

    if (dragStart) {
      setDragCurrent(coords);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      redraw(rects);
      ctx.fillStyle = drawColor;
      const x = Math.min(dragStart.x, coords.x);
      const y = Math.min(dragStart.y, coords.y);
      const w = Math.abs(coords.x - dragStart.x);
      const h = Math.abs(coords.y - dragStart.y);
      ctx.fillRect(x, y, w, h);
    }
  };

  const handleEnd = () => {
    if (movingRect !== null) {
      saveHistory(rects);
      setMovingRect(null);
      return;
    }

    if (dragStart && dragCurrent) {
      const x = Math.min(dragStart.x, dragCurrent.x);
      const y = Math.min(dragStart.y, dragCurrent.y);
      const w = Math.abs(dragCurrent.x - dragStart.x);
      const h = Math.abs(dragCurrent.y - dragStart.y);
      if (w > 2 && h > 2) {
        const newRects = [...rects, { x, y, w, h, color: drawColor }];
        setRects(newRects);
        saveHistory(newRects);
      }
    }
    setDragStart(null);
    setDragCurrent(null);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setRects([...history[newIndex]]);
  };

  const clearCanvas = () => {
    setRects([]);
    saveHistory([]);
  };

  const handleImportImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const scale = Math.min(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height) * 0.7;
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (CANVAS_SIZE - w) / 2, (CANVAS_SIZE - h) / 2, w, h);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'crosshair.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  const handleUseAsCrosshair = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    const newCrosshair: CrosshairConfig = {
      id: `custom-${Date.now()}`,
      name: 'Custom Drawn',
      category: 'custom',
      width: 0,
      height: 0,
      thickness: 0,
      gap: 0,
      opacity: 1,
      color: drawColor,
      hex: drawColor,
      glow: false,
      glowIntensity: 3,
      outline: false,
      outlineThickness: 1,
      rotation: 0,
      shadow: false,
      shadowBlur: 4,
      roundedEdges: false,
      horizontalWidth: 0,
      horizontalHeight: 0,
      verticalWidth: 0,
      verticalHeight: 0,
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
      customImage: dataUrl,
    };

    setEditingCrosshair(newCrosshair);
    addCustomCrosshair(newCrosshair);
  }, [drawColor, setEditingCrosshair, addCustomCrosshair]);

  return (
    <div className="flex h-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Canvas area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-4 flex items-center gap-2">
          <Square className="w-5 h-5 text-accent-400" />
          <h1 className="text-lg font-semibold text-white/90">Crosshair Builder</h1>
        </div>

        <div
          className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl"
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            background: 'repeating-conic-gradient(#1a1a2e 0% 25%, #111119 0% 50%) 50% / 20px 20px',
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="cursor-crosshair"
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleUseAsCrosshair}
            className="flex items-center gap-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 rounded-lg text-sm font-medium text-white transition-colors"
          >
            Use as Crosshair
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>
        </div>
      </div>

      {/* Tools panel */}
      <div className="w-64 border-l border-white/5 p-4 flex flex-col gap-4 overflow-y-auto">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Tools</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'rect', icon: Square, label: 'Rectangle' },
              { id: 'move', icon: Move, label: 'Move' },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setTool(id as any)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-colors ${
                  tool === id
                    ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30'
                    : 'bg-white/5 text-white/40 hover:bg-white/10 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Color</h3>
          <div className="flex items-center gap-2">
            <label className="relative cursor-pointer">
              <div
                className="w-10 h-10 rounded-lg border-2 border-white/10 hover:border-white/20 transition-colors"
                style={{ backgroundColor: drawColor }}
              />
              <input
                type="color"
                value={drawColor}
                onChange={(e) => setDrawColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <input
              type="text"
              value={drawColor}
              onChange={(e) => {
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
                  setDrawColor(e.target.value);
                }
              }}
              className="flex-1 px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 font-mono outline-none focus:border-accent-500/50"
            />
          </div>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#888888'].map((c) => (
              <button
                key={c}
                onClick={() => setDrawColor(c)}
                className={`w-full aspect-square rounded border-2 transition-colors ${
                  drawColor === c ? 'border-accent-500 scale-110' : 'border-white/10 hover:border-white/20'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors disabled:opacity-30"
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo
            </button>
            <button
              onClick={clearCanvas}
              disabled={rects.length === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors disabled:opacity-30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              onClick={handleImportImage}
              className="col-span-2 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 transition-colors"
            >
              <Image className="w-3.5 h-3.5" />
              Import Image
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">Shapes ({rects.length})</h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {rects.length === 0 ? (
              <p className="text-xs text-white/20">No shapes yet. Click and drag to draw rectangles.</p>
            ) : (
              rects.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-white/5 text-xs text-white/50">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: r.color }} />
                  <span>Rect {i + 1}</span>
                  <button
                    onClick={() => {
                      const newRects = rects.filter((_, idx) => idx !== i);
                      setRects(newRects);
                      saveHistory(newRects);
                    }}
                    className="ml-auto text-white/30 hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
