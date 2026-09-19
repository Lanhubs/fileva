import { fetchFile } from '@ffmpeg/util';
import { ffmpegService } from '../../lib/ffmpeg-service';
import {
  VideoFileState,
  VideoCompressionSettings,
  VideoCompressionResult,
} from '../../types';
import { inspectVideoFile } from '../../lib/media-utils';

export type VideoProcessingStatus =
  | 'idle'
  | 'preparing'
  | 'encoding'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface VideoProgressInfo {
  status: VideoProcessingStatus;
  percent: number; // 0 - 100
  message: string;
}

export class VideoCompressionError extends Error {
  reason: string;
  suggestion?: string;
  technicalLogs?: string[];
  exitCode?: number;

  constructor(
    message: string,
    options: {
      reason: string;
      suggestion?: string;
      technicalLogs?: string[];
      exitCode?: number;
    }
  ) {
    super(message);
    this.name = 'VideoCompressionError';
    this.reason = options.reason;
    this.suggestion = options.suggestion;
    this.technicalLogs = options.technicalLogs;
    this.exitCode = options.exitCode;
  }
}

function diagnoseFFmpegFailure(
  exitCode: number,
  logLines: string[],
  settings: VideoCompressionSettings
): { reason: string; suggestion: string } {
  const combined = logLines.join(' ').toLowerCase();

  if (combined.includes('sample rate') && combined.includes('not supported')) {
    return {
      reason: 'Audio sample rate incompatibility: The Opus audio encoder requires 48 kHz audio, but the source video audio is at a different frequency.',
      suggestion: 'Switch format to MP4 (H.264 / AAC) which supports all standard audio sample rates.',
    };
  }

  if (
    combined.includes('memory') ||
    combined.includes('out of bounds') ||
    combined.includes('enomem') ||
    combined.includes('cannot allocate')
  ) {
    return {
      reason: 'Browser WebAssembly memory limit reached: Encoding high-resolution frames exceeded available browser RAM.',
      suggestion: 'Select 720p HD or 480p SD downscaling, or switch to the "Compact" preset to reduce memory consumption.',
    };
  }

  if (combined.includes('unknown encoder') || combined.includes('encoder not found')) {
    return {
      reason: `Encoder unavailable: The codec requested for ${settings.format.toUpperCase()} is not available in the WebAssembly build.`,
      suggestion: 'Switch Container & Codec to MP4 (H.264 / AAC).',
    };
  }

  if (
    combined.includes('invalid data') ||
    combined.includes('moov atom') ||
    combined.includes('header') ||
    combined.includes('error while decoding')
  ) {
    return {
      reason: 'Corrupt or unreadable input: The source video contains corrupted index headers, missing moov atom, or an unsupported container variant.',
      suggestion: 'Verify the video plays cleanly in your media player, or re-export it as a standard MP4 file before uploading.',
    };
  }

  if (combined.includes('error while opening encoder') || combined.includes('could not open codec')) {
    return {
      reason: `Failed to open ${settings.format === 'webm' ? 'VP9/VP8' : 'H.264'} video encoder with the requested resolution or bitrate profile.`,
      suggestion: 'Try setting Output Resolution to 720p HD and using the "Balanced" preset.',
    };
  }

  // Look for any line specifically starting or containing error
  const specificErrorLine = [...logLines].reverse().find((l) => {
    const s = l.toLowerCase();
    return s.includes('error:') || s.includes('error ') || s.includes('invalid') || s.includes('failed to');
  });

  if (specificErrorLine) {
    return {
      reason: `Transcoding halted by engine: ${specificErrorLine.replace(/^\[.*?\]\s*/, '').trim()}`,
      suggestion: settings.format === 'webm' ? 'Switch Container & Codec to MP4 (H.264 / AAC) for broader compatibility.' : 'Try selecting 720p resolution or adjusting the CRF quality slider.',
    };
  }

  return {
    reason: `FFmpeg encoder exited with non-zero status code ${exitCode}. The browser interrupted the encoding process.`,
    suggestion: settings.format === 'webm' ? 'Switch to MP4 (H.264 / AAC) format or choose a lower resolution.' : 'Try selecting a lower resolution preset like 720p or 480p.',
  };
}

export async function compressVideo(
  source: VideoFileState,
  settings: VideoCompressionSettings,
  onProgress?: (info: VideoProgressInfo) => void
): Promise<VideoCompressionResult> {
  const startTime = performance.now();

  onProgress?.({
    status: 'preparing',
    percent: 5,
    message: 'Initializing in-browser WebAssembly media engine...',
  });

  const ffmpeg = await ffmpegService.getFFmpeg((loadPercent, msg) => {
    onProgress?.({
      status: 'preparing',
      percent: Math.min(25, Math.round(loadPercent * 0.25)),
      message: msg,
    });
  });

  onProgress?.({
    status: 'preparing',
    percent: 25,
    message: 'Mounting media into virtual memory...',
  });

  const inputExt = source.name.split('.').pop()?.toLowerCase() || 'mp4';
  const outExt = settings.format === 'webm' ? 'webm' : 'mp4';
  const timestamp = Date.now();
  const inputName = `input_${timestamp}.${inputExt}`;
  const outputName = `output_${timestamp}.${outExt}`;

  // Read file data into Uint8Array
  const fileData = await fetchFile(source.file);
  await ffmpeg.writeFile(inputName, fileData);

  // Determine resolution scaling filter
  let scaleFilter: string | null = null;
  const isLandscape = source.width >= source.height;

  if (settings.resolution === '1080p') {
    if (isLandscape && source.height > 1080) scaleFilter = 'scale=-2:1080';
    else if (!isLandscape && source.width > 1080) scaleFilter = 'scale=1080:-2';
  } else if (settings.resolution === '720p') {
    if (isLandscape && source.height > 720) scaleFilter = 'scale=-2:720';
    else if (!isLandscape && source.width > 720) scaleFilter = 'scale=720:-2';
  } else if (settings.resolution === '480p') {
    if (isLandscape && source.height > 480) scaleFilter = 'scale=-2:480';
    else if (!isLandscape && source.width > 480) scaleFilter = 'scale=480:-2';
  } else if (settings.resolution === '360p') {
    if (isLandscape && source.height > 360) scaleFilter = 'scale=-2:360';
    else if (!isLandscape && source.width > 360) scaleFilter = 'scale=360:-2';
  } else if (settings.resolution === 'custom' && settings.customWidth && settings.customHeight) {
    const w = Math.floor(settings.customWidth / 2) * 2;
    const h = Math.floor(settings.customHeight / 2) * 2;
    scaleFilter = `scale=${w}:${h}`;
  }

  // If "small file" preset selected and resolution is high, ensure capped to 720p
  if (settings.preset === 'small' && !scaleFilter) {
    if (isLandscape && source.height > 720) scaleFilter = 'scale=-2:720';
    else if (!isLandscape && source.width > 720) scaleFilter = 'scale=720:-2';
  }

  // Helper to build FFmpeg command line arguments for a specific codec strategy
  const buildArgs = (strategy: {
    videoCodec: 'libx264' | 'libvpx-vp9' | 'libvpx';
    audioCodec: 'aac' | 'libopus' | 'none';
  }): { args: string[]; isLossless: boolean } => {
    const args: string[] = ['-i', inputName];
    let isLossless = false;

    if (settings.preset === 'lossless') {
      if (inputExt === outExt && !scaleFilter) {
        args.push('-c', 'copy');
        isLossless = true;
      } else {
        if (settings.format === 'mp4') {
          args.push(
            '-c:v', 'libx264',
            '-crf', '17',
            '-preset', 'fast',
            '-pix_fmt', 'yuv420p',
            '-c:a', 'aac',
            '-b:a', '256k'
          );
        } else {
          // WebM lossless / visual quality
          if (strategy.videoCodec === 'libvpx-vp9') {
            args.push(
              '-c:v', 'libvpx-vp9',
              '-crf', '18',
              '-b:v', '0',
              '-deadline', 'realtime',
              '-cpu-used', '4',
              '-row-mt', '1',
              '-pix_fmt', 'yuv420p'
            );
          } else {
            args.push(
              '-c:v', 'libvpx',
              '-crf', '10',
              '-b:v', '2M',
              '-deadline', 'realtime',
              '-cpu-used', '4',
              '-pix_fmt', 'yuv420p'
            );
          }

          if (strategy.audioCodec === 'libopus') {
            args.push('-c:a', 'libopus', '-b:a', '192k', '-ar', '48000');
          } else if (strategy.audioCodec === 'none') {
            args.push('-an');
          }
        }
      }
    } else if (settings.preset === 'target-size' && settings.targetSizeMb) {
      const targetBytes = settings.targetSizeMb * 1024 * 1024;
      const totalBits = targetBytes * 8;
      const duration = Math.max(1, source.duration);

      const audioBitrateKbps = Math.min(128, Math.max(64, Math.floor((totalBits * 0.1) / duration / 1000)));
      const videoBitrateKbps = Math.max(60, Math.floor((totalBits / duration / 1000) - audioBitrateKbps));

      if (scaleFilter) args.push('-vf', scaleFilter);

      if (settings.format === 'mp4') {
        args.push(
          '-c:v', 'libx264',
          '-b:v', `${videoBitrateKbps}k`,
          '-maxrate', `${Math.round(videoBitrateKbps * 1.3)}k`,
          '-bufsize', `${videoBitrateKbps * 2}k`,
          '-preset', 'veryfast',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', `${audioBitrateKbps}k`
        );
      } else {
        if (strategy.videoCodec === 'libvpx-vp9') {
          args.push(
            '-c:v', 'libvpx-vp9',
            '-b:v', `${videoBitrateKbps}k`,
            '-deadline', 'realtime',
            '-cpu-used', '4',
            '-row-mt', '1',
            '-pix_fmt', 'yuv420p'
          );
        } else {
          args.push(
            '-c:v', 'libvpx',
            '-b:v', `${videoBitrateKbps}k`,
            '-deadline', 'realtime',
            '-cpu-used', '4',
            '-pix_fmt', 'yuv420p'
          );
        }

        if (strategy.audioCodec === 'libopus') {
          args.push('-c:a', 'libopus', '-b:a', `${audioBitrateKbps}k`, '-ar', '48000');
        } else if (strategy.audioCodec === 'none') {
          args.push('-an');
        }
      }
    } else {
      // Quality-based compression (max, balanced, small, custom)
      let crf = settings.crf;
      if (settings.preset === 'max') crf = 19;
      else if (settings.preset === 'balanced') crf = 24;
      else if (settings.preset === 'small') crf = 30;

      let audioBitrate = `${settings.audioBitrateKbps || 128}k`;
      if (settings.preset === 'max') audioBitrate = '192k';
      else if (settings.preset === 'small') audioBitrate = '96k';

      if (scaleFilter) args.push('-vf', scaleFilter);

      if (settings.format === 'mp4') {
        args.push(
          '-c:v', 'libx264',
          '-crf', `${crf}`,
          '-preset', 'veryfast',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-b:a', audioBitrate
        );
      } else {
        if (strategy.videoCodec === 'libvpx-vp9') {
          args.push(
            '-c:v', 'libvpx-vp9',
            '-crf', `${crf}`,
            '-b:v', '0',
            '-deadline', 'realtime',
            '-cpu-used', '4',
            '-row-mt', '1',
            '-pix_fmt', 'yuv420p'
          );
        } else {
          const vp8TargetBitrate = settings.preset === 'small' ? '700k' : settings.preset === 'max' ? '2200k' : '1200k';
          args.push(
            '-c:v', 'libvpx',
            '-crf', `${Math.min(50, Math.max(10, crf + 4))}`,
            '-b:v', vp8TargetBitrate,
            '-deadline', 'realtime',
            '-cpu-used', '4',
            '-pix_fmt', 'yuv420p'
          );
        }

        if (strategy.audioCodec === 'libopus') {
          args.push('-c:a', 'libopus', '-b:a', audioBitrate, '-ar', '48000');
        } else if (strategy.audioCodec === 'none') {
          args.push('-an');
        }
      }
    }

    if (settings.stripMetadata) {
      if (settings.format === 'mp4') {
        args.push('-movflags', '+faststart');
      } else {
        args.push('-map_metadata', '-1');
      }
    }

    args.push('-y', outputName);
    return { args, isLossless };
  };

  onProgress?.({
    status: 'encoding',
    percent: 30,
    message: 'Starting local video compression...',
  });

  const logLines: string[] = [];
  const logHandler = ({ message }: { message: string }) => {
    logLines.push(message);
    if (logLines.length > 60) logLines.shift();
  };
  ffmpeg.on('log', logHandler);

  const progressHandler = ({ progress }: { progress: number }) => {
    const pct = Math.max(30, Math.min(96, Math.round(30 + progress * 66)));
    onProgress?.({
      status: 'encoding',
      percent: pct,
      message: `Compressing video frames (${pct}%)...`,
    });
  };

  ffmpeg.on('progress', progressHandler);

  let isLossless = false;

  try {
    if (settings.format === 'mp4') {
      const primary = buildArgs({ videoCodec: 'libx264', audioCodec: 'aac' });
      isLossless = primary.isLossless;
      const exitCode = await ffmpeg.exec(primary.args);
      if (exitCode !== 0) {
        const diag = diagnoseFFmpegFailure(exitCode, logLines, settings);
        throw new VideoCompressionError(`MP4 compression failed: ${diag.reason}`, {
          reason: diag.reason,
          suggestion: diag.suggestion,
          technicalLogs: [...logLines],
          exitCode,
        });
      }
    } else {
      // WebM encoding with robust progressive fallback:
      // Step 1: Try VP9 + Opus (with audio resampled to 48000Hz as required by libopus)
      const primary = buildArgs({ videoCodec: 'libvpx-vp9', audioCodec: 'libopus' });
      isLossless = primary.isLossless;
      let exitCode = await ffmpeg.exec(primary.args);

      // Step 2: If primary VP9 failed, attempt fallback to VP8 (libvpx), which has universal WebAssembly compatibility
      if (exitCode !== 0) {
        console.warn('Primary WebM (VP9+Opus) returned error', exitCode, logLines.slice(-4));
        onProgress?.({
          status: 'encoding',
          percent: 35,
          message: 'Retrying with high-compatibility WebM VP8 encoder...',
        });

        await ffmpeg.deleteFile(outputName).catch(() => {});

        const vp8Fallback = buildArgs({ videoCodec: 'libvpx', audioCodec: 'libopus' });
        isLossless = vp8Fallback.isLossless;
        exitCode = await ffmpeg.exec(vp8Fallback.args);

        // Step 3: If still failing (e.g. video has no audio track or unusual audio stream), retry video-only
        if (exitCode !== 0) {
          console.warn('WebM VP8+Opus failed, retrying without audio track...');
          await ffmpeg.deleteFile(outputName).catch(() => {});

          const muteFallback = buildArgs({ videoCodec: 'libvpx', audioCodec: 'none' });
          isLossless = muteFallback.isLossless;
          exitCode = await ffmpeg.exec(muteFallback.args);
        }

        if (exitCode !== 0) {
          const diag = diagnoseFFmpegFailure(exitCode, logLines, settings);
          throw new VideoCompressionError(`WebM compression failed: ${diag.reason}`, {
            reason: diag.reason,
            suggestion: diag.suggestion,
            technicalLogs: [...logLines],
            exitCode,
          });
        }
      }
    }

    onProgress?.({
      status: 'finalizing',
      percent: 97,
      message: 'Extracting compressed media stream...',
    });

    const outputData = (await ffmpeg.readFile(outputName)) as Uint8Array;
    const mimeType = settings.format === 'webm' ? 'video/webm' : 'video/mp4';
    const outputBlob = new Blob([outputData.buffer as ArrayBuffer], { type: mimeType });
    const outputUrl = URL.createObjectURL(outputBlob);

    // Read metadata of compressed video
    const tempFile = new File([outputBlob], outputName, { type: mimeType });
    let compressedMeta = { width: source.width, height: source.height, duration: source.duration };
    try {
      const inspected = await inspectVideoFile(tempFile);
      compressedMeta = {
        width: inspected.width,
        height: inspected.height,
        duration: inspected.duration,
      };
    } catch {
      // Keep source dimensions if browser cannot decode in-memory
    }

    const durationMs = Math.round(performance.now() - startTime);
    const reductionPercentage = Math.max(
      0,
      parseFloat((((source.size - outputBlob.size) / source.size) * 100).toFixed(1))
    );
    const outputBitrate =
      compressedMeta.duration > 0 ? Math.round((outputBlob.size * 8) / compressedMeta.duration) : 0;

    onProgress?.({
      status: 'completed',
      percent: 100,
      message: `Complete in ${(durationMs / 1000).toFixed(1)}s`,
    });

    return {
      blob: outputBlob,
      objectUrl: outputUrl,
      size: outputBlob.size,
      duration: compressedMeta.duration || source.duration,
      width: compressedMeta.width,
      height: compressedMeta.height,
      format: settings.format,
      bitrate: outputBitrate,
      reductionPercentage,
      isLossless,
      durationMs,
    };
  } catch (err: unknown) {
    if (err instanceof VideoCompressionError) {
      throw err;
    }
    const rawMsg = err instanceof Error ? err.message : String(err);
    let reason = rawMsg;
    let suggestion = 'Try selecting MP4 (H.264 / AAC) container or lowering the resolution preset.';

    if (rawMsg.includes('memory') || rawMsg.includes('allocation') || rawMsg.includes('buffer')) {
      reason = 'Browser memory allocation failure: Unable to allocate virtual storage buffer for this video file.';
      suggestion = 'Try using a smaller video clip or downscaling to 720p HD or 480p SD.';
    } else if (rawMsg.includes('SharedArrayBuffer') || rawMsg.includes('cross-origin')) {
      reason = 'Security isolation restriction: Multi-threaded WebAssembly requires cross-origin isolation.';
      suggestion = 'Open the application in a new dedicated tab or use an updated desktop browser.';
    }

    throw new VideoCompressionError(`Video compression error: ${reason}`, {
      reason,
      suggestion,
      technicalLogs: logLines.length > 0 ? [...logLines] : undefined,
    });
  } finally {
    ffmpeg.off('progress', progressHandler);
    ffmpeg.off('log', logHandler);
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}
