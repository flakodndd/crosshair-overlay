import React from 'react';
import ReactDOM from 'react-dom/client';
import { useOverlayStore } from './stores/overlayStore';
import type { CrosshairConfig } from './types';

const ANIMATIONS: Record<string, string> = {
  pulse: 'overlay-pulse 1.5s ease-in-out infinite',
  breathe: 'overlay-breathe 3s ease-in-out infinite',
  fade: 'overlay-fade 2s ease-in-out infinite',
  rotate: 'overlay-rotate 3s linear infinite',
  scale: 'overlay-scale 2s ease-in-out infinite',
};

function StaticCrosshair({ config }: { config: CrosshairConfig }) {
  const size = 200;
  const half = size / 2;

  if (config.customImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: config.opacity ?? 1,
        }}
      >
        <img
          src={config.customImage}
          alt="custom crosshair"
          style={{
            width: size * 0.7,
            height: size * 0.7,
            objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    );
  }

  const hLength = config.horizontalWidth ?? config.width ?? 6;
  const hThickness = config.horizontalHeight ?? config.thickness ?? 2;
  const vLength = config.verticalHeight ?? config.height ?? 6;
  const vThickness = config.verticalWidth ?? config.thickness ?? 2;
  const effectiveGap = config.gap ?? 4;
  const cx = half;
  const cy = half;

  const baseColor = config.hex || config.color || '#00ff00';
  const opacity = config.opacity ?? 1;
  const lineCap = config.roundedEdges ? 'round' : 'butt';

  const useGradient = config.gradient && config.gradientColors && config.gradientColors.length >= 2;
  const useRainbow = config.rainbowMode;
  const rainbowId = `rainbow-overlay`;
  const gradientId = `grad-overlay`;
  const strokeRef = useGradient ? `url(#${gradientId})` : useRainbow ? `url(#${rainbowId})` : baseColor;

  const animStyle: React.CSSProperties = {};
  if (config.animation && config.animation !== 'none' && ANIMATIONS[config.animation]) {
    animStyle.animation = ANIMATIONS[config.animation];
    if (config.animationSpeed) {
      animStyle.animationDuration = `${config.animationSpeed}s`;
    }
  }

  const rotation = config.rotation || 0;
  const offsetX = config.offsetX || 0;
  const offsetY = config.offsetY || 0;
  const filterAttr = config.glow ? 'url(#glow)' : config.shadow ? 'url(#shadow)' : undefined;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible', ...animStyle }}
    >
      <defs>
        {useGradient && (
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={size} y2={size}>
            {config.gradientColors!.map((c, i) => (
              <stop key={i} offset={`${(i / (config.gradientColors!.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        )}
        {useRainbow && (
          <linearGradient id={rainbowId} gradientUnits="userSpaceOnUse" x1={cx - hLength - effectiveGap} y1={cy - vLength - effectiveGap} x2={cx + hLength + effectiveGap} y2={cy + vLength + effectiveGap}>
            <stop offset="0%" stopColor="#ff0000">
              <animate attributeName="stop-color" values="#ff0000;#ff7f00;#ffff00;#00ff00;#0000ff;#8b00ff;#ff0000" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#00ff00">
              <animate attributeName="stop-color" values="#00ff00;#0000ff;#8b00ff;#ff0000;#ff7f00;#ffff00;#00ff00" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#0000ff">
              <animate attributeName="stop-color" values="#0000ff;#8b00ff;#ff0000;#ff7f00;#ffff00;#00ff00;#0000ff" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )}
        {config.glow && (
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={config.glowIntensity || 3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        {config.shadow && (
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation={config.shadowBlur || 4} floodColor={baseColor} floodOpacity="0.6" />
          </filter>
        )}
      </defs>

      <g filter={filterAttr} transform={`translate(${offsetX}, ${offsetY}) rotate(${rotation} ${cx} ${cy})`}>
        {config.outline && (
          <>
            <line x1={cx - hLength - effectiveGap} y1={cy} x2={cx - effectiveGap} y2={cy} stroke="#000000" strokeWidth={hThickness + (config.outlineThickness || 2)} strokeOpacity={opacity} strokeLinecap={lineCap} />
            <line x1={cx + effectiveGap} y1={cy} x2={cx + hLength + effectiveGap} y2={cy} stroke="#000000" strokeWidth={hThickness + (config.outlineThickness || 2)} strokeOpacity={opacity} strokeLinecap={lineCap} />
            <line x1={cx} y1={cy - vLength - effectiveGap} x2={cx} y2={cy - effectiveGap} stroke="#000000" strokeWidth={vThickness + (config.outlineThickness || 2)} strokeOpacity={opacity} strokeLinecap={lineCap} />
            <line x1={cx} y1={cy + effectiveGap} x2={cx} y2={cy + vLength + effectiveGap} stroke="#000000" strokeWidth={vThickness + (config.outlineThickness || 2)} strokeOpacity={opacity} strokeLinecap={lineCap} />
          </>
        )}
        <line x1={cx - hLength - effectiveGap} y1={cy} x2={cx - effectiveGap} y2={cy} stroke={strokeRef} strokeWidth={hThickness} strokeOpacity={opacity} strokeLinecap={lineCap} />
        <line x1={cx + effectiveGap} y1={cy} x2={cx + hLength + effectiveGap} y2={cy} stroke={strokeRef} strokeWidth={hThickness} strokeOpacity={opacity} strokeLinecap={lineCap} />
        <line x1={cx} y1={cy - vLength - effectiveGap} x2={cx} y2={cy - effectiveGap} stroke={strokeRef} strokeWidth={vThickness} strokeOpacity={opacity} strokeLinecap={lineCap} />
        <line x1={cx} y1={cy + effectiveGap} x2={cx} y2={cy + vLength + effectiveGap} stroke={strokeRef} strokeWidth={vThickness} strokeOpacity={opacity} strokeLinecap={lineCap} />
        {config.centerDot && (
          <circle cx={cx} cy={cy} r={(config.centerDotSize || 4) / 2} fill={config.centerDotColor || strokeRef} stroke={config.outline ? '#000000' : undefined} strokeWidth={config.outline ? config.outlineThickness || 1 : 0} strokeOpacity={opacity} />
        )}
        {config.circle && (
          <circle cx={cx} cy={cy} r={config.circleRadius || 10} fill="none" stroke={config.circleColor || strokeRef} strokeWidth={config.circleThickness || 1} strokeOpacity={opacity} strokeDasharray={config.circleRadius ? config.circleRadius * 2 * Math.PI : undefined} strokeDashoffset={config.offset || 0} />
        )}
      </g>
    </svg>
  );
}

function OverlayApp() {
  const { opacity } = useOverlayStore();
  const [crosshair, setCrosshair] = React.useState<CrosshairConfig | null>(null);

  React.useEffect(() => {
    const handler = (config: any) => {
      setCrosshair(config);
    };

    if (window.electronAPI?.onCrosshairUpdate) {
      window.electronAPI.onCrosshairUpdate(handler);
    }

    if (window.electronAPI?.crosshair?.request) {
      window.electronAPI.crosshair.request();
    }

    return () => {};
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: opacity ?? 1,
        background: 'transparent',
      }}
    >
      {crosshair ? (
        <StaticCrosshair config={crosshair} />
      ) : (
        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,0,0,0.8)' }} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <OverlayApp />
);
