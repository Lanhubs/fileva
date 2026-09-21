import {
  CanvasPage,
  CanvasDimensions,
  DesignAsset,
  Layer,
  TextLayer,
  DeviceLayer,
  ShapeLayer,
  ScreenshotLayer,
  ImageLayer,
} from './types';
import { drawBackground } from './renderers/background-renderer';
import { drawDeviceLayer } from './renderers/device-renderer';
import { drawTextLayer } from './renderers/text-renderer';
import { drawShapeLayer, drawScreenshotLayer, drawImageLayer } from './renderers/shape-image-renderer';
import { loadFontFamily } from './font-loader';
import JSZip from 'jszip';

export async function preloadAssets(assets: DesignAsset[]): Promise<Map<string, HTMLImageElement>> {
  const map = new Map<string, HTMLImageElement>();
  const promises = assets.map(async (asset) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const promise = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error(`Failed to load ${asset.name}`));
      });
      img.src = asset.objectUrl;
      await promise;
      map.set(asset.id, img);
    } catch (e) {
      console.warn('Failed to load asset', asset.name, e);
    }
  });

  await Promise.all(promises);
  return map;
}

export function drawLayer(
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  assetMap: Map<string, HTMLImageElement>
) {
  if (!layer.visible) return;

  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;

  if (layer.rotation) {
    const cx = layer.x + layer.width / 2;
    const cy = layer.y + layer.height / 2;
    ctx.translate(cx, cy);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.translate(-cx, -cy);
  }

  if (layer.type === 'text') {
    drawTextLayer(ctx, layer as TextLayer);
  } else if (layer.type === 'device') {
    drawDeviceLayer(ctx, layer as DeviceLayer, assetMap);
  } else if (layer.type === 'shape') {
    drawShapeLayer(ctx, layer as ShapeLayer);
  } else if (layer.type === 'screenshot') {
    drawScreenshotLayer(ctx, layer as ScreenshotLayer, assetMap);
  } else if (layer.type === 'image') {
    drawImageLayer(ctx, layer as ImageLayer, assetMap);
  }

  ctx.restore();
}

export async function renderPageToCanvas(
  page: CanvasPage,
  dimensions: CanvasDimensions,
  assets: DesignAsset[],
  targetCanvas?: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = dimensions.width;
  canvas.height = dimensions.height;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) throw new Error('Could not get 2D rendering context');

  const assetMap = await preloadAssets(assets);

  // Ensure fonts used by text layers are loaded
  const textLayers = page.layers.filter((l) => l.type === 'text') as TextLayer[];
  if (textLayers.length > 0) {
    await Promise.all(textLayers.map((tl) => loadFontFamily(tl.fontFamily)));
    if (document.fonts) {
      try {
        await document.fonts.ready;
      } catch {
        // Continue if browser font readiness promise rejects
      }
    }
  }

  await drawBackground(ctx, dimensions, page.background, assetMap);

  const sortedLayers = [...page.layers].sort((a, b) => a.zIndex - b.zIndex);
  for (const layer of sortedLayers) {
    drawLayer(ctx, layer, assetMap);
  }

  return canvas;
}

export async function exportPageToBlob(
  page: CanvasPage,
  dimensions: CanvasDimensions,
  assets: DesignAsset[],
  format: 'image/png' | 'image/jpeg' = 'image/png',
  quality: number = 0.95
): Promise<Blob> {
  const canvas = await renderPageToCanvas(page, dimensions, assets);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      format,
      quality
    );
  });
}

export async function exportAllPagesToZip(
  pages: CanvasPage[],
  dimensions: CanvasDimensions,
  assets: DesignAsset[],
  projectName: string,
  format: 'image/png' | 'image/jpeg' = 'image/png',
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(projectName || 'app-store-screenshots') || zip;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    onProgress?.(i + 1, pages.length);
    const blob = await exportPageToBlob(page, dimensions, assets, format);
    const filename = `${String(i + 1).padStart(2, '0')}-${(page.title || `screen-${i + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')}.png`;
    folder.file(filename, blob);
  }

  return await zip.generateAsync({ type: 'blob' });
}
