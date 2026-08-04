import type { CrosshairConfig } from '../types';

function createGradientFill(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  x: number,
  y: number,
  w: number,
  h: number
): CanvasGradient | string {
  if (!config.gradient || config.gradientColors.length === 0) {
    return config.color;
  }
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  config.gradientColors.forEach((color, i) => {
    gradient.addColorStop(i / Math.max(config.gradientColors.length - 1, 1), color);
  });
  return gradient;
}

function applyGlow(ctx: CanvasRenderingContext2D, config: CrosshairConfig): void {
  if (config.glow) {
    ctx.shadowColor = config.color;
    ctx.shadowBlur = config.glowIntensity;
  }
}

function applyShadow(ctx: CanvasRenderingContext2D, config: CrosshairConfig): void {
  if (config.shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = config.shadowBlur;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
  }
}

function resetEffects(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawCrossLines(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  cx: number,
  cy: number
): void {
  const halfThickness = config.thickness / 2;
  const lineCap = config.roundedEdges ? 'round' : 'butt';

  ctx.lineCap = lineCap;
  ctx.lineJoin = 'round';

  const fill = createGradientFill(
    ctx,
    config,
    cx - config.horizontalWidth / 2,
    cy - halfThickness,
    config.horizontalWidth,
    config.thickness
  );

  // Horizontal line
  ctx.fillStyle = fill;
  ctx.globalAlpha = config.opacity;
  ctx.fillRect(
    cx - config.horizontalWidth / 2,
    cy - halfThickness,
    config.horizontalWidth,
    config.thickness
  );

  // Vertical line
  ctx.fillRect(
    cx - halfThickness,
    cy - config.verticalHeight / 2,
    config.thickness,
    config.verticalHeight
  );

  // Outline
  if (config.outline) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = config.outlineThickness;
    ctx.globalAlpha = config.opacity;

    ctx.beginPath();
    ctx.moveTo(cx - config.horizontalWidth / 2, cy);
    ctx.lineTo(cx + config.horizontalWidth / 2, cy);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy - config.verticalHeight / 2);
    ctx.lineTo(cx, cy + config.verticalHeight / 2);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function drawGapLines(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  cx: number,
  cy: number
): void {
  const halfThickness = config.thickness / 2;

  ctx.clearRect(
    cx - config.horizontalWidth / 2,
    cy - halfThickness,
    config.horizontalWidth,
    config.thickness
  );
  ctx.clearRect(
    cx - halfThickness,
    cy - config.verticalHeight / 2,
    config.thickness,
    config.verticalHeight
  );

  const fill = createGradientFill(
    ctx,
    config,
    cx - config.horizontalWidth / 2,
    cy - halfThickness,
    config.horizontalWidth,
    config.thickness
  );

  ctx.fillStyle = fill;
  ctx.globalAlpha = config.opacity;

  const halfGap = config.gap / 2;

  // Horizontal lines with gap
  const leftX = cx - config.horizontalWidth / 2;
  const rightX = cx + config.horizontalWidth / 2;
  const lineWidth = (config.horizontalWidth / 2) - halfGap;

  if (lineWidth > 0) {
    ctx.fillRect(leftX, cy - halfThickness, lineWidth, config.thickness);
    ctx.fillRect(cx + halfGap, cy - halfThickness, lineWidth, config.thickness);
  }

  // Vertical lines with gap
  const topY = cy - config.verticalHeight / 2;
  const bottomY = cy + config.verticalHeight / 2;
  const lineHeight = (config.verticalHeight / 2) - halfGap;

  if (lineHeight > 0) {
    ctx.fillRect(cx - halfThickness, topY, config.thickness, lineHeight);
    ctx.fillRect(cx - halfThickness, cy + halfGap, config.thickness, lineHeight);
  }

  // Outline with gap
  if (config.outline) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = config.outlineThickness;

    if (lineWidth > 0) {
      ctx.beginPath();
      ctx.moveTo(leftX, cy);
      ctx.lineTo(leftX + lineWidth, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + halfGap, cy);
      ctx.lineTo(rightX, cy);
      ctx.stroke();
    }

    if (lineHeight > 0) {
      ctx.beginPath();
      ctx.moveTo(cx, topY);
      ctx.lineTo(cx, topY + lineHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy + halfGap);
      ctx.lineTo(cx, bottomY);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
}

function drawCenterDot(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  cx: number,
  cy: number
): void {
  if (!config.centerDot) return;

  ctx.globalAlpha = config.opacity;
  ctx.fillStyle = config.centerDotColor || config.color;

  if (config.outline) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = config.outlineThickness;
    ctx.beginPath();
    ctx.arc(cx, cy, config.centerDotSize, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, config.centerDotSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  cx: number,
  cy: number
): void {
  if (!config.circle) return;

  ctx.globalAlpha = config.opacity;

  if (config.outline) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = config.circleThickness + config.outlineThickness * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, config.circleRadius, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.strokeStyle = config.circleColor || config.color;
  ctx.lineWidth = config.circleThickness;
  ctx.beginPath();
  ctx.arc(cx, cy, config.circleRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawOffset(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  cx: number,
  cy: number
): void {
  if (config.offset === 0) return;

  ctx.clearRect(cx - config.offset, cy - 1, config.offset * 2, 2);
}

export function renderCrosshairToCanvas(
  ctx: CanvasRenderingContext2D,
  config: CrosshairConfig,
  size: number
): void {
  ctx.clearRect(0, 0, size, size);

  const scale = config.size ?? 1;
  const cx = size / 2;
  const cy = size / 2;

  const scaledConfig = {
    ...config,
    horizontalWidth: config.horizontalWidth * scale,
    horizontalHeight: config.horizontalHeight * scale,
    verticalHeight: config.verticalHeight * scale,
    verticalWidth: config.verticalWidth * scale,
    thickness: config.thickness * scale,
    gap: config.gap * scale,
    centerDotSize: config.centerDotSize * scale,
    circleRadius: config.circleRadius * scale,
    circleThickness: config.circleThickness * scale,
    outlineThickness: config.outlineThickness * scale,
    glowIntensity: config.glowIntensity,
    shadowBlur: config.shadowBlur,
  };

  ctx.save();

  applyShadow(ctx, scaledConfig);
  applyGlow(ctx, scaledConfig);

  if (config.rotation !== 0) {
    ctx.translate(cx, cy);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  if (scaledConfig.gap > 0) {
    drawGapLines(ctx, scaledConfig, cx, cy);
  } else {
    drawCrossLines(ctx, scaledConfig, cx, cy);
  }

  resetEffects(ctx);
  applyGlow(ctx, scaledConfig);

  drawCircle(ctx, scaledConfig, cx, cy);

  resetEffects(ctx);
  applyGlow(ctx, scaledConfig);

  drawCenterDot(ctx, scaledConfig, cx, cy);

  resetEffects(ctx);

  drawOffset(ctx, config, cx, cy);

  ctx.restore();
}

export function renderCrosshairToDataURL(
  config: CrosshairConfig,
  size: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');
  renderCrosshairToCanvas(ctx, config, size);
  return canvas.toDataURL('image/png');
}

export function renderCrosshairToSVG(
  config: CrosshairConfig,
  size: number
): string {
  const scale = config.size ?? 1;
  const cx = size / 2;
  const cy = size / 2;
  const halfThickness = (config.thickness * scale) / 2;
  const halfGap = (config.gap * scale) / 2;
  const hW = config.horizontalWidth * scale;
  const vH = config.verticalHeight * scale;
  const thickness = config.thickness * scale;
  const outlineThickness = config.outlineThickness * scale;
  const circleRadius = config.circleRadius * scale;
  const circleThickness = config.circleThickness * scale;
  const centerDotSize = config.centerDotSize * scale;

  let elements: string[] = [];

  const glowFilter = config.glow
    ? `<filter id="glow"><feGaussianBlur stdDeviation="${config.glowIntensity / 4}" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    : '';

  const shadowFilter = config.shadow
    ? `<filter id="shadow"><feDropShadow dx="2" dy="2" stdDeviation="${config.shadowBlur / 4}" flood-opacity="0.6"/></filter>`
    : '';

  const filters = [glowFilter, shadowFilter].filter(Boolean).join('');
  const filterAttr = config.glow || config.shadow ? ` filter="url(#${config.glow ? 'glow' : 'shadow'})"` : '';
  const transform = config.rotation !== 0 ? ` transform="rotate(${config.rotation} ${cx} ${cy})"` : '';

  const stroke = config.outline ? ` stroke="#000" stroke-width="${outlineThickness}"` : '';
  const strokeAttr = ` stroke="${config.color}" stroke-width="${thickness}"`;

  let gradientDef = '';
  if (config.gradient && config.gradientColors.length >= 2) {
    gradientDef = `<defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">${config.gradientColors.map((c, i) => `<stop offset="${(i / (config.gradientColors.length - 1)) * 100}%" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
  }

  if (config.gap > 0) {
    const leftW = (hW / 2) - halfGap;
    const rightW = (hW / 2) - halfGap;
    const topH = (vH / 2) - halfGap;
    const bottomH = (vH / 2) - halfGap;

    if (leftW > 0) {
      if (config.outline) elements.push(`<line x1="${cx - hW / 2}" y1="${cy}" x2="${cx - halfGap}" y2="${cy}" stroke="#000" stroke-width="${thickness + outlineThickness * 2}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"/>`);
      elements.push(`<line x1="${cx - hW / 2}" y1="${cy}" x2="${cx - halfGap}" y2="${cy}" stroke="${config.color}" stroke-width="${thickness}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
    }
    if (rightW > 0) {
      if (config.outline) elements.push(`<line x1="${cx + halfGap}" y1="${cy}" x2="${cx + hW / 2}" y2="${cy}" stroke="#000" stroke-width="${thickness + outlineThickness * 2}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"/>`);
      elements.push(`<line x1="${cx + halfGap}" y1="${cy}" x2="${cx + hW / 2}" y2="${cy}" stroke="${config.color}" stroke-width="${thickness}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
    }
    if (topH > 0) {
      if (config.outline) elements.push(`<line x1="${cx}" y1="${cy - vH / 2}" x2="${cx}" y2="${cy - halfGap}" stroke="#000" stroke-width="${thickness + outlineThickness * 2}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"/>`);
      elements.push(`<line x1="${cx}" y1="${cy - vH / 2}" x2="${cx}" y2="${cy - halfGap}" stroke="${config.color}" stroke-width="${thickness}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
    }
    if (bottomH > 0) {
      if (config.outline) elements.push(`<line x1="${cx}" y1="${cy + halfGap}" x2="${cx}" y2="${cy + vH / 2}" stroke="#000" stroke-width="${thickness + outlineThickness * 2}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"/>`);
      elements.push(`<line x1="${cx}" y1="${cy + halfGap}" x2="${cx}" y2="${cy + vH / 2}" stroke="${config.color}" stroke-width="${thickness}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
    }
  } else {
    if (config.outline) {
      elements.push(`<line x1="${cx - hW / 2}" y1="${cy}" x2="${cx + hW / 2}" y2="${cy}" stroke="#000" stroke-width="${thickness + outlineThickness * 2}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"/>`);
      elements.push(`<line x1="${cx}" y1="${cy - vH / 2}" x2="${cx}" y2="${cy + vH / 2}" stroke="#000" stroke-width="${thickness + outlineThickness * 2}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"/>`);
    }
    const strokeStyle = ` stroke="${config.color}" stroke-width="${thickness}" stroke-linecap="${config.roundedEdges ? 'round' : 'butt'}"`;
    elements.push(`<line x1="${cx - hW / 2}" y1="${cy}" x2="${cx + hW / 2}" y2="${cy}"${strokeStyle}${filterAttr}${transform} opacity="${config.opacity}"/>`);
    elements.push(`<line x1="${cx}" y1="${cy - vH / 2}" x2="${cx}" y2="${cy + vH / 2}"${strokeStyle}${filterAttr}${transform} opacity="${config.opacity}"/>`);
  }

  if (config.circle) {
    if (config.outline) {
      elements.push(`<circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="none" stroke="#000" stroke-width="${circleThickness + outlineThickness * 2}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
    }
    elements.push(`<circle cx="${cx}" cy="${cy}" r="${circleRadius}" fill="none" stroke="${config.circleColor || config.color}" stroke-width="${circleThickness}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
  }

  if (config.centerDot) {
    if (config.outline) {
      elements.push(`<circle cx="${cx}" cy="${cy}" r="${centerDotSize}" fill="none" stroke="#000" stroke-width="${outlineThickness * 2}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
    }
    elements.push(`<circle cx="${cx}" cy="${cy}" r="${centerDotSize}" fill="${config.centerDotColor || config.color}"${filterAttr}${transform} opacity="${config.opacity}"/>`);
  }

  const defs = [gradientDef, filters].filter(Boolean);
  const defsBlock = defs.length > 0 ? `<defs>${defs.join('')}</defs>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${defsBlock}${elements.join('')}</svg>`;
}

export function exportCrosshairAsPNG(
  config: CrosshairConfig,
  size: number,
  filename: string
): void {
  const dataUrl = renderCrosshairToDataURL(config, size);
  downloadFile(dataUrl, filename, 'image/png');
}

function downloadFile(dataUrl: string, filename: string, mimeType: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.type = mimeType;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
