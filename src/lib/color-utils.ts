import { ExtractedColor } from '../types';

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const sanitized = hex.replace(/^#/, '');
  if (sanitized.length === 3) {
    return {
      r: parseInt(sanitized[0] + sanitized[0], 16),
      g: parseInt(sanitized[1] + sanitized[1], 16),
      b: parseInt(sanitized[2] + sanitized[2], 16),
    };
  }
  if (sanitized.length === 6) {
    return {
      r: parseInt(sanitized.substring(0, 2), 16),
      g: parseInt(sanitized.substring(2, 4), 16),
      b: parseInt(sanitized.substring(4, 6), 16),
    };
  }
  return null;
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / delta + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / delta + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return {
    h,
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
}

/**
 * Extracts dominant colors from an image using color quantization on a downsampled canvas.
 * Offloads heavy operations by sampling down to max 120x120 pixels.
 */
export async function extractDominantColors(
  imageSource: CanvasImageSource,
  maxColors = 8
): Promise<ExtractedColor[]> {
  const sampleCanvas = document.createElement('canvas');
  const maxDim = 120;
  sampleCanvas.width = maxDim;
  sampleCanvas.height = maxDim;
  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  ctx.drawImage(imageSource, 0, 0, maxDim, maxDim);
  const imgData = ctx.getImageData(0, 0, maxDim, maxDim).data;

  // Filter pixels and collect histogram
  const pixels: Array<{ r: number; g: number; b: number }> = [];
  for (let i = 0; i < imgData.length; i += 4) {
    const a = imgData[i + 3];
    // Ignore transparent or translucent pixels
    if (a < 128) continue;
    pixels.push({
      r: imgData[i],
      g: imgData[i + 1],
      b: imgData[i + 2],
    });
  }

  if (pixels.length === 0) {
    return [
      {
        hex: '#000000',
        rgb: { r: 0, g: 0, b: 0 },
        hsl: { h: 0, s: 0, l: 0 },
        percentage: 100,
        isLight: false,
      },
    ];
  }

  // Simplified Median Cut / K-Means clustering
  let clusters: Array<{ r: number; g: number; b: number; count: number }> = [];
  
  // Initialize clusters with distinct samples
  const step = Math.max(1, Math.floor(pixels.length / (maxColors * 3)));
  for (let i = 0; i < pixels.length && clusters.length < maxColors * 2; i += step) {
    const p = pixels[i];
    const isDistinct = clusters.every((c) => colorDistance(c.r, c.g, c.b, p.r, p.g, p.b) > 40);
    if (isDistinct) {
      clusters.push({ ...p, count: 1 });
    }
  }

  if (clusters.length === 0) {
    clusters.push({ ...pixels[0], count: pixels.length });
  }

  // Assign pixels to closest cluster
  const clusterCounts = new Array(clusters.length).fill(0);
  const clusterSums = clusters.map(() => ({ r: 0, g: 0, b: 0 }));

  for (const p of pixels) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let c = 0; c < clusters.length; c++) {
      const dist = colorDistance(p.r, p.g, p.b, clusters[c].r, clusters[c].g, clusters[c].b);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = c;
      }
    }
    clusterCounts[bestIdx]++;
    clusterSums[bestIdx].r += p.r;
    clusterSums[bestIdx].g += p.g;
    clusterSums[bestIdx].b += p.b;
  }

  // Recalculate centroids
  const results: ExtractedColor[] = [];
  for (let i = 0; i < clusters.length; i++) {
    if (clusterCounts[i] === 0) continue;
    const r = Math.round(clusterSums[i].r / clusterCounts[i]);
    const g = Math.round(clusterSums[i].g / clusterCounts[i]);
    const b = Math.round(clusterSums[i].b / clusterCounts[i]);
    const percentage = Number(((clusterCounts[i] / pixels.length) * 100).toFixed(1));

    results.push({
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
      percentage,
      isLight: getLuminance(r, g, b) > 0.45,
    });
  }

  // Sort by prominence (percentage descending)
  results.sort((a, b) => b.percentage - a.percentage);

  // Return up to maxColors
  return results.slice(0, maxColors);
}

export function generateCssSnippet(colors: ExtractedColor[]): string {
  const lines = colors.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b}) */`);
  return `:root {\n${lines.join('\n')}\n}`;
}

export function generateTailwindSnippet(colors: ExtractedColor[]): string {
  const lines = colors.map((c, i) => `      'palette-${i + 1}': '${c.hex}',`);
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${lines.join('\n')}\n      }\n    }\n  }\n};`;
}

export function generateJsonSnippet(colors: ExtractedColor[]): string {
  return JSON.stringify(colors, null, 2);
}

export async function createPaletteImageBlob(colors: ExtractedColor[]): Promise<Blob> {
  const width = 800;
  const height = 240;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not available');

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const swatchWidth = width / colors.length;
  const swatchHeight = 160;

  colors.forEach((c, idx) => {
    const x = idx * swatchWidth;
    ctx.fillStyle = c.hex;
    ctx.fillRect(x, 0, swatchWidth, swatchHeight);

    // Label area
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, swatchHeight, swatchWidth, height - swatchHeight);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(c.hex, x + 10, swatchHeight + 30);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText(`${c.percentage}%`, x + 10, swatchHeight + 52);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create palette image blob'));
    }, 'image/png');
  });
}
