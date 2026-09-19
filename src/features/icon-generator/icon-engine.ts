import { IconPreset } from '../../types';
import { loadImageElement } from '../../lib/file-utils';
import { createIcoFromPngs } from '../../lib/ico-generator';
import { createZipArchive, ZipFileEntry } from '../../lib/zip-utils';
import { generatePwaManifestSnippet, generateHtmlHeadSnippet } from '../../lib/icon-presets';

export interface IconGenerationConfig {
  backgroundColor: string; // hex or 'transparent'
  paddingPercent: number; // 0 - 50%
  fitMode: 'contain' | 'cover';
  borderRadiusPercent: number; // 0 - 50%
}

/**
 * Renders an icon at the specified dimension onto a canvas and returns a PNG Blob.
 */
export async function renderIconToBlob(
  sourceImg: HTMLImageElement,
  width: number,
  height: number,
  config: IconGenerationConfig
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Background color if not transparent
  if (config.backgroundColor !== 'transparent') {
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);
  }

  // Calculate destination bounds with padding
  const padX = (width * config.paddingPercent) / 100;
  const padY = (height * config.paddingPercent) / 100;
  const availW = width - padX * 2;
  const availH = height - padY * 2;

  const srcW = sourceImg.naturalWidth || sourceImg.width;
  const srcH = sourceImg.naturalHeight || sourceImg.height;

  let drawW = availW;
  let drawH = availH;
  let drawX = padX;
  let drawY = padY;

  if (config.fitMode === 'contain') {
    const scale = Math.min(availW / srcW, availH / srcH);
    drawW = srcW * scale;
    drawH = srcH * scale;
    drawX = padX + (availW - drawW) / 2;
    drawY = padY + (availH - drawH) / 2;
  } else {
    // Cover mode
    const scale = Math.max(availW / srcW, availH / srcH);
    drawW = srcW * scale;
    drawH = srcH * scale;
    drawX = padX + (availW - drawW) / 2;
    drawY = padY + (availH - drawH) / 2;
  }

  // Enable high-quality smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceImg, drawX, drawY, drawW, drawH);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error(`Failed to generate icon blob for ${width}x${height}`));
    }, 'image/png');
  });
}

/**
 * Builds the entire multi-platform asset bundle in a single ZIP file.
 */
export async function generateFullIconPackage(
  sourceUrl: string,
  presets: IconPreset[],
  config: IconGenerationConfig
): Promise<Blob> {
  const sourceImg = await loadImageElement(sourceUrl);
  const zipEntries: ZipFileEntry[] = [];

  const faviconEntriesForIco: Array<{ width: number; height: number; blob: Blob }> = [];

  for (const preset of presets) {
    const blob = await renderIconToBlob(sourceImg, preset.width, preset.height, config);

    // Add to folder structure in ZIP
    zipEntries.push({
      name: preset.filename,
      blob,
      folder: preset.category,
    });

    // Collect 16, 32, 48 for multi-resolution favicon.ico
    if (preset.category === 'web' && [16, 32, 48].includes(preset.width)) {
      faviconEntriesForIco.push({
        width: preset.width,
        height: preset.height,
        blob,
      });
    }
  }

  // Generate multi-resolution binary favicon.ico
  if (faviconEntriesForIco.length > 0) {
    const icoBlob = await createIcoFromPngs(faviconEntriesForIco);
    zipEntries.push({
      name: 'favicon.ico',
      blob: icoBlob,
      folder: 'web',
    });
  }

  // Include web manifest.json and HTML snippet
  const manifestBlob = new Blob([generatePwaManifestSnippet()], { type: 'application/json' });
  zipEntries.push({
    name: 'manifest.json',
    blob: manifestBlob,
    folder: 'pwa',
  });

  const htmlBlob = new Blob([generateHtmlHeadSnippet()], { type: 'text/html' });
  zipEntries.push({
    name: 'html_head_snippet.html',
    blob: htmlBlob,
    folder: 'web',
  });

  return await createZipArchive(zipEntries);
}
