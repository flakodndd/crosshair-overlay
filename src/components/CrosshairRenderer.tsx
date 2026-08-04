import { motion } from 'framer-motion';
import type { CrosshairConfig } from '../types';

interface CrosshairRendererProps {
  config: CrosshairConfig;
  size: number;
  showGuides?: boolean;
}

export function CrosshairRenderer({ config, size, showGuides = false }: CrosshairRendererProps) {
  if (config.customImage) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: config.transparency || 1,
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

  const half = size / 2;
  const scale = config.size ?? 1;
  const hLength = (config.horizontalWidth ?? config.width ?? 6) * scale;
  const hThickness = (config.horizontalHeight ?? config.thickness ?? 2) * scale;
  const vLength = (config.verticalHeight ?? config.height ?? 6) * scale;
  const vThickness = (config.verticalWidth ?? config.thickness ?? 2) * scale;
  const effectiveGap = (config.gap ?? 4) * scale;

  const cx = half;
  const cy = half;

  const lineCap = config.roundedEdges ? 'round' : 'butt';
  const glowFilterId = `glow-${config.id}`;
  const shadowFilterId = `shadow-${config.id}`;
  const gradientId = `gradient-${config.id}`;
  const rainbowId = `rainbow-${config.id}`;

  const getColor = () => {
    if (config.rainbowMode) return `url(#${rainbowId})`;
    if (config.gradient) return `url(#${gradientId})`;
    return config.hex || config.color || '#00ff00';
  };

  const color = getColor();

  const getAnimationClass = () => {
    switch (config.animation) {
      case 'pulse': return 'animate-pulse';
      case 'breathe': return 'animate-breathe';
      case 'fade': return 'animate-pulse-slow';
      case 'rotate': return 'animate-spin';
      case 'scale': return 'animate-breathe';
      default: return '';
    }
  };

  const animationSpeed = config.animationSpeed || 1;

  const getAnimationStyle = (): React.CSSProperties => {
    if (config.animation === 'none' || !config.animation) return {};
    return {
      animationDuration: `${animationSpeed}s`,
    };
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: 'visible', ...getAnimationStyle() }}
      className={getAnimationClass()}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: config.transparency || 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        {config.glow && (
          <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={config.glowIntensity || 3} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}

        {config.shadow && (
          <filter id={shadowFilterId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation={config.shadowBlur || 4} floodColor={color} floodOpacity="0.6" />
          </filter>
        )}

        {config.gradient && config.gradientColors && config.gradientColors.length >= 2 && (
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={size} y2={size}>
            {config.gradientColors.map((c, i) => (
              <stop key={i} offset={`${(i / (config.gradientColors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
        )}

        {config.rainbowMode && (
          <linearGradient id={rainbowId} gradientUnits="userSpaceOnUse" x1={cx - hLength - effectiveGap} y1={cy - vLength - effectiveGap} x2={cx + hLength + effectiveGap} y2={cy + vLength + effectiveGap}>
            <stop offset="0%" stopColor="#ff0000">
              <animate attributeName="stop-color" values="#ff0000;#ff7f00;#ffff00;#00ff00;#0000ff;#4b0082;#8b00ff;#ff0000" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#00ff00">
              <animate attributeName="stop-color" values="#00ff00;#0000ff;#4b0082;#8b00ff;#ff0000;#ff7f00;#ffff00;#00ff00" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#0000ff">
              <animate attributeName="stop-color" values="#0000ff;#4b0082;#8b00ff;#ff0000;#ff7f00;#ffff00;#00ff00;#0000ff" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        )}
      </defs>

      <g
        filter={config.glow ? `url(#${glowFilterId})` : config.shadow ? `url(#${shadowFilterId})` : undefined}
        transform={`translate(${config.offsetX || 0}, ${config.offsetY || 0}) rotate(${config.rotation || 0} ${cx} ${cy})`}
      >
        {/* Horizontal lines */}
        <line
          x1={cx - hLength - effectiveGap}
          y1={cy}
          x2={cx - effectiveGap}
          y2={cy}
          stroke={color}
          strokeWidth={hThickness}
          strokeOpacity={config.opacity}
          strokeLinecap={lineCap}
        />
        <line
          x1={cx + effectiveGap}
          y1={cy}
          x2={cx + hLength + effectiveGap}
          y2={cy}
          stroke={color}
          strokeWidth={hThickness}
          strokeOpacity={config.opacity}
          strokeLinecap={lineCap}
        />

        {/* Vertical lines */}
        <line
          x1={cx}
          y1={cy - vLength - effectiveGap}
          x2={cx}
          y2={cy - effectiveGap}
          stroke={color}
          strokeWidth={vThickness}
          strokeOpacity={config.opacity}
          strokeLinecap={lineCap}
        />
        <line
          x1={cx}
          y1={cy + effectiveGap}
          x2={cx}
          y2={cy + vLength + effectiveGap}
          stroke={color}
          strokeWidth={vThickness}
          strokeOpacity={config.opacity}
          strokeLinecap={lineCap}
        />

        {/* Outline */}
        {config.outline && (
          <>
            <line
              x1={cx - hLength - effectiveGap}
              y1={cy}
              x2={cx - effectiveGap}
              y2={cy}
              stroke="#000000"
              strokeWidth={hThickness + (config.outlineThickness || 2) * scale}
              strokeOpacity={config.opacity}
              strokeLinecap={lineCap}
              style={{ paintOrder: 'stroke fill' }}
            />
            <line
              x1={cx + effectiveGap}
              y1={cy}
              x2={cx + hLength + effectiveGap}
              y2={cy}
              stroke="#000000"
              strokeWidth={hThickness + (config.outlineThickness || 2) * scale}
              strokeOpacity={config.opacity}
              strokeLinecap={lineCap}
            />
            <line
              x1={cx}
              y1={cy - vLength - effectiveGap}
              x2={cx}
              y2={cy - effectiveGap}
              stroke="#000000"
              strokeWidth={vThickness + (config.outlineThickness || 2) * scale}
              strokeOpacity={config.opacity}
              strokeLinecap={lineCap}
            />
            <line
              x1={cx}
              y1={cy + effectiveGap}
              x2={cx}
              y2={cy + vLength + effectiveGap}
              stroke="#000000"
              strokeWidth={vThickness + (config.outlineThickness || 2) * scale}
              strokeOpacity={config.opacity}
              strokeLinecap={lineCap}
            />
          </>
        )}

        {/* Center dot */}
        {config.centerDot && (
          <circle
            cx={cx}
            cy={cy}
            r={(config.centerDotSize / 2) * scale}
            fill={config.centerDotColor || color}
            stroke={config.outline ? '#000000' : undefined}
            strokeWidth={config.outline ? (config.outlineThickness || 1) * scale : 0}
            strokeOpacity={config.opacity}
          />
        )}

        {/* Circle element */}
        {config.circle && (
          <circle
            cx={cx}
            cy={cy}
            r={config.circleRadius * scale}
            fill="none"
            stroke={config.circleColor || color}
            strokeWidth={config.circleThickness * scale}
            strokeOpacity={config.opacity}
            strokeDasharray={config.circleRadius * scale * 2 * Math.PI}
            strokeDashoffset={config.offset || 0}
          />
        )}

        {/* Guide lines */}
        {showGuides && (
          <>
            <line x1={cx} y1={0} x2={cx} y2={size} stroke="#ffffff33" strokeWidth={0.5} strokeDasharray="4 4" />
            <line x1={0} y1={cy} x2={size} y2={cy} stroke="#ffffff33" strokeWidth={0.5} strokeDasharray="4 4" />
          </>
        )}
      </g>
    </motion.svg>
  );
}
