import { CompressionSettings, CompressionResult, SupportedFormat } from '../../types';
import { loadImageElement } from '../../lib/file-utils';

/**
 * Compresses an image using Canvas API toBlob with binary search for target size.
 */
export async function compressImage(
  sourceUrl: string,
  originalSize: number,
  settings: CompressionSettings
): Promise<CompressionResult> {
  const img = await loadImageElement(sourceUrl);

  let targetWidth = img.naturalWidth || img.width;
  let targetHeight = img.naturalHeight || img.height;

  // Handle dimensional downscaling if requested
  if (settings.resize.enabled) {
    const { maxWidth, maxHeight } = settings.resize;
    if (targetWidth > maxWidth || targetHeight > maxHeight) {
      const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }
  }

  // Draw to canvas
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not initialize canvas 2D context.');

  // If compressing to JPEG, fill background with white (JPEG has no alpha channel)
  if (settings.format === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  // Helper to encode canvas to blob at a specific quality
  const encodeCanvas = (format: SupportedFormat, q: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error(`Failed to encode image as ${format}`));
        },
        format,
        format === 'image/png' ? undefined : q
      );
    });
  };

  let finalBlob: Blob;

  if (settings.mode === 'target-size' && settings.targetSizeKb && settings.format !== 'image/png') {
    // Target file size mode using bounded binary search
    const targetBytes = settings.targetSizeKb * 1024;
    let low = 0.05;
    let high = 0.98;
    let bestBlob: Blob | null = null;
    let bestDiff = Infinity;

    // 6 iterations of binary search is fast and achieves within 2-3% of target size
    for (let iter = 0; iter < 6; iter++) {
      const mid = (low + high) / 2;
      const testBlob = await encodeCanvas(settings.format, mid);
      const diff = Math.abs(testBlob.size - targetBytes);

      if (diff < bestDiff) {
        bestDiff = diff;
        bestBlob = testBlob;
      }

      if (testBlob.size > targetBytes) {
        high = mid;
      } else {
        low = mid;
      }
    }

    finalBlob = bestBlob || (await encodeCanvas(settings.format, settings.quality));
  } else {
    // Standard quality-based mode
    finalBlob = await encodeCanvas(settings.format, settings.quality);
  }

  const reductionPercentage = Number((((originalSize - finalBlob.size) / originalSize) * 100).toFixed(1));

  return {
    blob: finalBlob,
    objectUrl: URL.createObjectURL(finalBlob),
    size: finalBlob.size,
    width: targetWidth,
    height: targetHeight,
    reductionPercentage,
    format: settings.format,
  };
}
