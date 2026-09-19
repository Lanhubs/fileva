import { ImageFileState } from '../types';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function isValidImageFile(file: File): boolean {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon',
  ];
  return allowedMimeTypes.includes(file.type) || /\.(jpe?g|png|webp|avif|gif|svg|bmp|ico)$/i.test(file.name);
}

export async function processInputFile(file: File): Promise<ImageFileState> {
  if (!isValidImageFile(file)) {
    throw new Error(`Unsupported file type: ${file.type || file.name}. Please select a PNG, JPEG, WebP, AVIF, SVG, or BMP file.`);
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const dimensions = await getImageDimensions(objectUrl);
    return {
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'image/png',
      width: dimensions.width,
      height: dimensions.height,
      objectUrl,
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Failed to read image dimensions. The file may be corrupt or an invalid image.');
  }
}

export function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
      });
    };
    img.onerror = () => {
      reject(new Error('Unable to decode image dimensions.'));
    };
    img.src = src;
  });
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image into DOM element.'));
    img.src = src;
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
}

export function replaceFileExtension(filename: string, newExt: string): string {
  const base = filename.substring(0, filename.lastIndexOf('.')) || filename;
  return `${base}.${newExt}`;
}
