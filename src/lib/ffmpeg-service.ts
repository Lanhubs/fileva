import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

export interface FFmpegProgress {
  ratio: number; // 0 to 1
  percent: number; // 0 to 100
  timeUs: number; // microseconds
}

export type ProgressCallback = (progress: FFmpegProgress) => void;
export type LogCallback = (message: string) => void;

class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<FFmpeg> | null = null;

  public async getFFmpeg(onLoadProgress?: (percent: number, msg: string) => void): Promise<FFmpeg> {
    if (this.isLoaded && this.ffmpeg) {
      return this.ffmpeg;
    }

    if (this.isLoading && this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = (async () => {
      try {
        const instance = new FFmpeg();

        onLoadProgress?.(10, 'Fetching WebAssembly media core script...');

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm';
        const coreURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          'text/javascript',
          true,
          (e) => {
            if (e.total > 0) {
              const p = 10 + Math.round((e.received / e.total) * 35);
              onLoadProgress?.(p, `Fetching core engine (${Math.round((e.received / e.total) * 100)}%)...`);
            }
          }
        );

        onLoadProgress?.(45, 'Fetching WebAssembly binary runtime...');
        const wasmURL = await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          'application/wasm',
          true,
          (e) => {
            if (e.total > 0) {
              const p = 45 + Math.round((e.received / e.total) * 50);
              onLoadProgress?.(p, `Fetching WASM binary (${Math.round((e.received / e.total) * 100)}%)...`);
            }
          }
        );

        onLoadProgress?.(95, 'Compiling WebAssembly modules in worker...');
        await instance.load({
          coreURL,
          wasmURL,
        });

        this.ffmpeg = instance;
        this.isLoaded = true;
        this.isLoading = false;
        onLoadProgress?.(100, 'FFmpeg WebAssembly engine ready.');
        return instance;
      } catch (err) {
        this.isLoading = false;
        this.loadPromise = null;
        throw new Error(
          `Failed to load in-browser media engine: ${err instanceof Error ? err.message : String(err)}. Ensure you have an active network connection to download the local WASM core.`
        );
      }
    })();

    return this.loadPromise;
  }

  public isReady(): boolean {
    return this.isLoaded && this.ffmpeg !== null;
  }
}

export const ffmpegService = new FFmpegService();
