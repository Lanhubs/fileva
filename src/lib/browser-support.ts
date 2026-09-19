export interface BrowserCapabilities {
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsOffscreenCanvas: boolean;
  supportsEyeDropper: boolean;
  supportsImageBitmap: boolean;
}

let cachedCapabilities: BrowserCapabilities | null = null;

export function checkBrowserCapabilities(): BrowserCapabilities {
  if (cachedCapabilities) return cachedCapabilities;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  let supportsWebP = false;
  let supportsAVIF = false;

  try {
    const webpData = canvas.toDataURL('image/webp');
    supportsWebP = webpData.startsWith('data:image/webp');
  } catch {
    supportsWebP = false;
  }

  try {
    const avifData = canvas.toDataURL('image/avif');
    supportsAVIF = avifData.startsWith('data:image/avif');
  } catch {
    supportsAVIF = false;
  }

  const supportsOffscreenCanvas = typeof OffscreenCanvas !== 'undefined';
  const supportsEyeDropper = 'EyeDropper' in window;
  const supportsImageBitmap = typeof createImageBitmap === 'function';

  cachedCapabilities = {
    supportsWebP,
    supportsAVIF,
    supportsOffscreenCanvas,
    supportsEyeDropper,
    supportsImageBitmap,
  };

  return cachedCapabilities;
}
