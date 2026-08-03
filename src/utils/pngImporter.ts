import type { PNGImport } from '../types';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const VALID_TYPES = ['image/png'];
const MAX_DIMENSION = 4096;

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

function createCanvas(width: number, height: number): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas 2D context');
  return { canvas, ctx };
}

function imageDataToDataUrl(imageData: ImageData): string {
  const { canvas, ctx } = createCanvas(imageData.width, imageData.height);
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function validatePNG(file: File): { valid: boolean; error?: string } {
  if (!VALID_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.png')) {
    return { valid: false, error: 'Invalid file type. Only PNG files are accepted.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
    };
  }

  return { valid: true };
}

export async function importPNG(file: File): Promise<PNGImport> {
  const validation = validatePNG(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  if (img.width > MAX_DIMENSION || img.height > MAX_DIMENSION) {
    throw new Error(
      `Image dimensions too large. Maximum is ${MAX_DIMENSION}x${MAX_DIMENSION}.`
    );
  }

  return {
    file,
    dataUrl,
    width: img.width,
    height: img.height,
    rotation: 0,
    opacity: 1,
    maintainAspectRatio: true,
  };
}

export async function resizePNG(
  dataUrl: string,
  width: number,
  height: number
): Promise<string> {
  const img = await loadImage(dataUrl);
  const { canvas, ctx } = createCanvas(width, height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/png');
}

export async function rotatePNG(dataUrl: string, degrees: number): Promise<string> {
  const img = await loadImage(dataUrl);
  const radians = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));

  const newWidth = Math.ceil(img.width * cos + img.height * sin);
  const newHeight = Math.ceil(img.width * sin + img.height * cos);

  const { canvas, ctx } = createCanvas(newWidth, newHeight);
  ctx.translate(newWidth / 2, newHeight / 2);
  ctx.rotate(radians);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  return canvas.toDataURL('image/png');
}

export async function adjustOpacityPNG(
  dataUrl: string,
  opacity: number
): Promise<string> {
  const img = await loadImage(dataUrl);
  const { canvas, ctx } = createCanvas(img.width, img.height);

  ctx.globalAlpha = opacity;
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/png');
}

export async function addOutlinePNG(
  dataUrl: string,
  thickness: number,
  color: string
): Promise<string> {
  const img = await loadImage(dataUrl);
  const padding = thickness;
  const { canvas, ctx } = createCanvas(img.width + padding * 2, img.height + padding * 2);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Failed to get temp canvas context');

  tempCtx.drawImage(img, 0, 0);
  const imageData = tempCtx.getImageData(0, 0, img.width, img.height);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = color;
  ctx.lineWidth = thickness * 2;
  ctx.lineJoin = 'round';

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * 4;
      if (imageData.data[i + 3] > 0) {
        const neighbors = [
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
        ];

        for (const { dx, dy } of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= img.width || ny < 0 || ny >= img.height) {
            ctx.beginPath();
            ctx.arc(x + padding, y + padding, thickness, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          const ni = (ny * img.width + nx) * 4;
          if (imageData.data[ni + 3] === 0) {
            ctx.beginPath();
            ctx.arc(x + padding, y + padding, thickness, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
        }
      }
    }
  }

  ctx.drawImage(img, padding, padding);

  return canvas.toDataURL('image/png');
}

export async function addGlowPNG(
  dataUrl: string,
  intensity: number,
  color: string
): Promise<string> {
  const img = await loadImage(dataUrl);
  const padding = intensity * 3;
  const { canvas, ctx } = createCanvas(img.width + padding * 2, img.height + padding * 2);

  ctx.shadowColor = color;
  ctx.shadowBlur = intensity;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.drawImage(img, padding, padding);

  ctx.shadowBlur = intensity * 0.6;
  ctx.drawImage(img, padding, padding);

  ctx.shadowBlur = 0;
  ctx.drawImage(img, padding, padding);

  return canvas.toDataURL('image/png');
}
