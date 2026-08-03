import type { AnimationType } from '../types';

interface PulseAnimation {
  animation: string;
  transform: string;
}

interface BreatheAnimation {
  animation: string;
}

interface FadeAnimation {
  animation: string;
}

interface RotateAnimation {
  animation: string;
}

interface ScaleAnimation {
  animation: string;
}

interface RainbowAnimation {
  animation: string;
  filter: string;
}

export function generatePulseAnimation(
  intensity: number,
  speed: number
): PulseAnimation {
  const duration = Math.max(0.1, 2 / speed);
  const scaleAmount = 1 + intensity * 0.3;

  return {
    animation: `crosshair-pulse ${duration}s ease-in-out infinite`,
    transform: `scale(${scaleAmount})`,
  };
}

export function generateBreatheAnimation(speed: number): BreatheAnimation {
  const duration = Math.max(0.1, 3 / speed);

  return {
    animation: `crosshair-breathe ${duration}s ease-in-out infinite`,
  };
}

export function generateFadeAnimation(speed: number): FadeAnimation {
  const duration = Math.max(0.1, 2 / speed);

  return {
    animation: `crosshair-fade ${duration}s ease-in-out infinite`,
  };
}

export function generateRotateAnimation(speed: number): RotateAnimation {
  const duration = Math.max(0.1, 4 / speed);

  return {
    animation: `crosshair-rotate ${duration}s linear infinite`,
  };
}

export function generateScaleAnimation(speed: number): ScaleAnimation {
  const duration = Math.max(0.1, 2 / speed);

  return {
    animation: `crosshair-scale ${duration}s ease-in-out infinite`,
  };
}

export function generateRainbowAnimation(speed: number): RainbowAnimation {
  const duration = Math.max(0.1, 5 / speed);

  return {
    animation: `crosshair-rainbow ${duration}s linear infinite`,
    filter: 'hue-rotate(0deg)',
  };
}

function getPulseKeyframes(intensity: number): string {
  const scaleAmount = 1 + intensity * 0.3;
  return `
    @keyframes crosshair-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(${scaleAmount}); opacity: 0.8; }
    }
  `;
}

function getBreatheKeyframes(): string {
  return `
    @keyframes crosshair-breathe {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
}

function getFadeKeyframes(): string {
  return `
    @keyframes crosshair-fade {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `;
}

function getRotateKeyframes(): string {
  return `
    @keyframes crosshair-rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
}

function getScaleKeyframes(): string {
  return `
    @keyframes crosshair-scale {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
  `;
}

function getRainbowKeyframes(): string {
  return `
    @keyframes crosshair-rainbow {
      from { filter: hue-rotate(0deg); }
      to { filter: hue-rotate(360deg); }
    }
  `;
}

export function getAnimationCSS(type: AnimationType, speed: number): string {
  const intensity = 1;

  switch (type) {
    case 'pulse': {
      const duration = Math.max(0.1, 2 / speed);
      const scaleAmount = 1 + intensity * 0.3;
      return `
        ${getPulseKeyframes(intensity)}
        .crosshair-animated {
          animation: crosshair-pulse ${duration}s ease-in-out infinite;
          transform-origin: center center;
        }
      `;
    }
    case 'breathe': {
      const duration = Math.max(0.1, 3 / speed);
      return `
        ${getBreatheKeyframes()}
        .crosshair-animated {
          animation: crosshair-breathe ${duration}s ease-in-out infinite;
        }
      `;
    }
    case 'fade': {
      const duration = Math.max(0.1, 2 / speed);
      return `
        ${getFadeKeyframes()}
        .crosshair-animated {
          animation: crosshair-fade ${duration}s ease-in-out infinite;
        }
      `;
    }
    case 'rotate': {
      const duration = Math.max(0.1, 4 / speed);
      return `
        ${getRotateKeyframes()}
        .crosshair-animated {
          animation: crosshair-rotate ${duration}s linear infinite;
          transform-origin: center center;
        }
      `;
    }
    case 'scale': {
      const duration = Math.max(0.1, 2 / speed);
      return `
        ${getScaleKeyframes()}
        .crosshair-animated {
          animation: crosshair-scale ${duration}s ease-in-out infinite;
          transform-origin: center center;
        }
      `;
    }
    case 'rainbow': {
      const duration = Math.max(0.1, 5 / speed);
      return `
        ${getRainbowKeyframes()}
        .crosshair-animated {
          animation: crosshair-rainbow ${duration}s linear infinite;
        }
      `;
    }
    case 'none':
    default:
      return '';
  }
}

let injectedStyleElement: HTMLStyleElement | null = null;

export function injectAnimationStyles(): void {
  if (injectedStyleElement) return;

  const style = document.createElement('style');
  style.id = 'crosshair-animations';
  style.textContent = `
    ${getPulseKeyframes(1)}
    ${getBreatheKeyframes()}
    ${getFadeKeyframes()}
    ${getRotateKeyframes()}
    ${getScaleKeyframes()}
    ${getRainbowKeyframes()}
  `;
  document.head.appendChild(style);
  injectedStyleElement = style;
}

export function removeAnimationStyles(): void {
  if (injectedStyleElement) {
    injectedStyleElement.remove();
    injectedStyleElement = null;
  }
}
