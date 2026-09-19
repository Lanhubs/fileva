import { CropArea, SupportedFormat } from '../../types';
import { loadImageElement } from '../../lib/file-utils';

export interface CropExportOptions {
  format: SupportedFormat;
  quality: number;
  rotationDegrees: number; // 0, 90, 180, 270 or fine
  flipH: boolean;
  flipV: boolean;
}

/**
 * Performs accurate pixel crop with rotation, flip, and export format conversion using Canvas.
 */
export async function exportCroppedImage(
  sourceUrl: string,
  naturalWidth: number,
  naturalHeight: number,
  crop: CropArea, // relative or absolute in natural image space
  options: CropExportOptions
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImageElement(sourceUrl);

  const cropW = Math.max(1, Math.round(crop.width));
  const cropH = Math.max(1, Math.round(crop.height));
  const cropX = Math.round(crop.x);
  const cropY = Math.round(crop.y);

  // 1. Create an intermediate canvas for transformations (rotation & flips) if any
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = naturalWidth;
  srcCanvas.height = naturalHeight;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) throw new Error('Intermediate canvas context unavailable');

  srcCtx.save();
  // Apply flips
  srcCtx.translate(options.flipH ? naturalWidth : 0, options.flipV ? naturalHeight : 0);
  srcCtx.scale(options.flipH ? -1 : 1, options.flipV ? -1 : 1);
  srcCtx.drawImage(img, 0, 0);
  srcCtx.restore();

  // 2. Create destination cropped canvas
  const destCanvas = document.createElement('canvas');
  destCanvas.width = cropW;
  destCanvas.height = cropH;
  const destCtx = destCanvas.getContext('2d');
  if (!destCtx) throw new Error('Destination canvas context unavailable');

  if (options.format === 'image/jpeg') {
    destCtx.fillStyle = '#ffffff';
    destCtx.fillRect(0, 0, cropW, cropH);
  }

  // Draw the cropped portion from intermediate canvas
  destCtx.drawImage(
    srcCanvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    cropW,
    cropH
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    destCanvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to generate cropped blob.'));
      },
      options.format,
      options.format === 'image/png' ? undefined : options.quality
    );
  });

  return {
    blob,
    width: cropW,
    height: cropH,
  };
}
