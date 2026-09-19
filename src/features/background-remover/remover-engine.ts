import { removeBackground, segmentForeground, Config } from '@imgly/background-removal';
import { getImageDimensions, loadImageElement } from '../../lib/file-utils';

export type ModelType = 'isnet_fp16' | 'isnet_quint8' | 'isnet';
export type DeviceType = 'cpu' | 'gpu';
export type OutputMode = 'foreground' | 'mask';
export type RemovalStatus = 'idle' | 'preparing' | 'processing' | 'completed' | 'failed';

export interface ProgressInfo {
  status: RemovalStatus;
  stage: 'idle' | 'downloading' | 'decoding' | 'inference' | 'masking' | 'encoding' | 'completed' | 'failed';
  message: string;
  percent: number; // 0 - 100
  bytesLoaded?: number;
  bytesTotal?: number;
}

export interface RemovalOptions {
  model?: ModelType;
  device?: DeviceType;
  outputMode?: OutputMode;
  publicPath?: string;
  onProgress?: (info: ProgressInfo) => void;
}

export interface RemovalResult {
  blob: Blob;
  objectUrl: string;
  width: number;
  height: number;
  size: number;
  durationMs: number;
  model: ModelType;
  outputMode: OutputMode;
}

/**
 * Executes high-precision in-browser neural background removal using @imgly/background-removal.
 * Runs completely locally inside the user's browser using WebAssembly / WebGPU ONNX runtime.
 */
export async function removeImageBackground(
  imageSource: File | Blob | string,
  options: RemovalOptions = {}
): Promise<RemovalResult> {
  const {
    model = 'isnet_fp16',
    device = 'gpu',
    outputMode = 'foreground',
    publicPath,
    onProgress,
  } = options;

  const startTime = performance.now();

  onProgress?.({
    status: 'preparing',
    stage: 'downloading',
    message: 'Initializing neural engine...',
    percent: 0,
  });

  const config: Config = {
    model,
    device,
    debug: false,
    output: {
      format: 'image/png',
      quality: 1.0,
    },
    progress: (key: string, current: number, total: number) => {
      if (key.startsWith('fetch:')) {
        const percent = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
        onProgress?.({
          status: 'preparing',
          stage: 'downloading',
          message: total > 0 ? `Loading model weights (${percent}%)` : 'Fetching neural model assets...',
          percent,
          bytesLoaded: current,
          bytesTotal: total,
        });
      } else if (key === 'compute:decode') {
        onProgress?.({
          status: 'processing',
          stage: 'decoding',
          message: 'Preparing image data tensor...',
          percent: 25,
        });
      } else if (key === 'compute:inference') {
        onProgress?.({
          status: 'processing',
          stage: 'inference',
          message: 'Running ONNX segmentation inference...',
          percent: 60,
        });
      } else if (key === 'compute:mask') {
        onProgress?.({
          status: 'processing',
          stage: 'masking',
          message: 'Refining alpha edges and fine details...',
          percent: 85,
        });
      } else if (key === 'compute:encode') {
        const isFinished = current >= total;
        onProgress?.({
          status: isFinished ? 'completed' : 'processing',
          stage: 'encoding',
          message: isFinished ? 'Finalizing transparent PNG...' : 'Encoding output PNG...',
          percent: isFinished ? 100 : 95,
        });
      }
    },
  };

  if (publicPath) {
    config.publicPath = publicPath;
  }

  let resultBlob: Blob;

  try {
    if (outputMode === 'mask') {
      resultBlob = await segmentForeground(imageSource, config);
    } else {
      resultBlob = await removeBackground(imageSource, config);
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Segmentation failed.';
    onProgress?.({
      status: 'failed',
      stage: 'failed',
      message: errorMsg,
      percent: 0,
    });
    throw error;
  }

  const durationMs = Math.round(performance.now() - startTime);
  const objectUrl = URL.createObjectURL(resultBlob);

  let dimensions = { width: 0, height: 0 };
  try {
    dimensions = await getImageDimensions(objectUrl);
  } catch {
    // fallback if dimension extraction fails
  }

  onProgress?.({
    status: 'completed',
    stage: 'completed',
    message: `Completed in ${(durationMs / 1000).toFixed(1)}s`,
    percent: 100,
  });

  return {
    blob: resultBlob,
    objectUrl,
    width: dimensions.width,
    height: dimensions.height,
    size: resultBlob.size,
    durationMs,
    model,
    outputMode,
  };
}

/**
 * Composites a transparent PNG cutout over a solid color background.
 * Useful when developers need a clean solid color asset (e.g. e-commerce white or neutral gray).
 */
export async function compositeCutoutOverColor(
  cutoutBlob: Blob,
  backgroundColor: string,
  width: number,
  height: number
): Promise<{ blob: Blob; objectUrl: string }> {
  const img = await loadImageElement(URL.createObjectURL(cutoutBlob));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas context.');

  // Draw background color
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw transparent cutout on top
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({
          blob,
          objectUrl: URL.createObjectURL(blob),
        });
      } else {
        reject(new Error('Failed to create composite blob.'));
      }
    }, 'image/png');
  });
}
