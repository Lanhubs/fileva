import { fetchFile } from '@ffmpeg/util';
import { ffmpegService } from '../../lib/ffmpeg-service';
import {
  AudioFileState,
  AudioCompressionSettings,
  AudioCompressionResult,
} from '../../types';
import { inspectAudioFile } from '../../lib/media-utils';

export type AudioProcessingStatus =
  | 'idle'
  | 'preparing'
  | 'encoding'
  | 'finalizing'
  | 'completed'
  | 'failed';

export interface AudioProgressInfo {
  status: AudioProcessingStatus;
  percent: number;
  message: string;
}

export async function compressAudio(
  source: AudioFileState,
  settings: AudioCompressionSettings,
  onProgress?: (info: AudioProgressInfo) => void
): Promise<AudioCompressionResult> {
  const startTime = performance.now();

  onProgress?.({
    status: 'preparing',
    percent: 10,
    message: 'Loading in-browser media engine...',
  });

  const ffmpeg = await ffmpegService.getFFmpeg((loadPercent, msg) => {
    onProgress?.({
      status: 'preparing',
      percent: Math.min(30, Math.round(loadPercent * 0.3)),
      message: msg,
    });
  });

  onProgress?.({
    status: 'preparing',
    percent: 30,
    message: 'Reading audio stream into memory...',
  });

  const inputExt = source.name.split('.').pop()?.toLowerCase() || 'mp3';
  const outExt =
    settings.format === 'wav'
      ? 'wav'
      : settings.format === 'aac'
      ? 'm4a'
      : settings.format === 'ogg'
      ? 'ogg'
      : 'mp3';

  const timestamp = Date.now();
  const inputName = `audio_in_${timestamp}.${inputExt}`;
  const outputName = `audio_out_${timestamp}.${outExt}`;

  const fileData = await fetchFile(source.file);
  await ffmpeg.writeFile(inputName, fileData);

  const args: string[] = ['-i', inputName];
  let isLossless = false;

  // Determine bitrate
  let bitrateKbps = settings.bitrateKbps;
  if (settings.preset === 'high') bitrateKbps = 320;
  else if (settings.preset === 'balanced') bitrateKbps = 192;
  else if (settings.preset === 'standard') bitrateKbps = 128;
  else if (settings.preset === 'small') bitrateKbps = 64;
  else if (settings.preset === 'target-size' && settings.targetSizeMb) {
    const targetBits = settings.targetSizeMb * 1024 * 1024 * 8;
    const duration = Math.max(1, source.duration);
    bitrateKbps = Math.max(32, Math.min(320, Math.floor(targetBits / duration / 1000)));
  }

  // Sample rate
  if (settings.sampleRate && settings.sampleRate > 0) {
    args.push('-ar', `${settings.sampleRate}`);
  } else if (settings.format === 'ogg') {
    // libopus strictly requires 48000, 24000, 16000, 12000, or 8000 Hz.
    // Defaulting to 48000 prevents "Specified sample rate 44100 is not supported" errors.
    args.push('-ar', '48000');
  }

  // Channels
  if (settings.channels === 1) {
    args.push('-ac', '1');
  } else if (settings.channels === 2) {
    args.push('-ac', '2');
  }

  // Codec & Format
  if (settings.format === 'wav' || settings.preset === 'lossless') {
    args.push('-c:a', 'pcm_s16le');
    isLossless = true;
  } else if (settings.format === 'aac') {
    args.push('-c:a', 'aac', '-b:a', `${bitrateKbps}k`);
  } else if (settings.format === 'ogg') {
    args.push('-c:a', 'libopus', '-b:a', `${bitrateKbps}k`);
  } else {
    // Default MP3
    args.push('-c:a', 'libmp3lame', '-b:a', `${bitrateKbps}k`);
  }

  args.push('-y', outputName);

  onProgress?.({
    status: 'encoding',
    percent: 40,
    message: 'Compressing audio stream...',
  });

  const logLines: string[] = [];
  const logHandler = ({ message }: { message: string }) => {
    logLines.push(message);
    if (logLines.length > 50) logLines.shift();
  };
  ffmpeg.on('log', logHandler);

  const progressHandler = ({ progress }: { progress: number }) => {
    const pct = Math.max(40, Math.min(96, Math.round(40 + progress * 56)));
    onProgress?.({
      status: 'encoding',
      percent: pct,
      message: `Compressing audio samples (${pct}%)...`,
    });
  };

  ffmpeg.on('progress', progressHandler);

  try {
    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) {
      const errDetail = logLines.find((l) => l.toLowerCase().includes('error') || l.toLowerCase().includes('not supported')) || logLines.slice(-3).join('; ');
      throw new Error(`Audio encoder exited with status code ${exitCode}${errDetail ? `: ${errDetail}` : ''}`);
    }

    onProgress?.({
      status: 'finalizing',
      percent: 98,
      message: 'Packaging audio file...',
    });

    const outputData = (await ffmpeg.readFile(outputName)) as Uint8Array;
    let mimeType = 'audio/mpeg';
    if (settings.format === 'wav') mimeType = 'audio/wav';
    else if (settings.format === 'aac') mimeType = 'audio/mp4';
    else if (settings.format === 'ogg') mimeType = 'audio/ogg';

    const outputBlob = new Blob([outputData.buffer as ArrayBuffer], { type: mimeType });
    const outputUrl = URL.createObjectURL(outputBlob);

    const tempFile = new File([outputBlob], outputName, { type: mimeType });
    let compressedMeta = {
      duration: source.duration,
      sampleRate: settings.sampleRate || source.sampleRate,
      channels: settings.channels || source.channels,
    };

    try {
      const inspected = await inspectAudioFile(tempFile);
      compressedMeta = {
        duration: inspected.duration,
        sampleRate: inspected.sampleRate,
        channels: inspected.channels,
      };
    } catch {
      // Retain previous or target metadata
    }

    const durationMs = Math.round(performance.now() - startTime);
    const reductionPercentage = Math.max(
      0,
      parseFloat((((source.size - outputBlob.size) / source.size) * 100).toFixed(1))
    );
    const outputBitrate =
      compressedMeta.duration > 0
        ? Math.round((outputBlob.size * 8) / compressedMeta.duration)
        : bitrateKbps * 1000;

    onProgress?.({
      status: 'completed',
      percent: 100,
      message: `Finished in ${(durationMs / 1000).toFixed(1)}s`,
    });

    return {
      blob: outputBlob,
      objectUrl: outputUrl,
      size: outputBlob.size,
      duration: compressedMeta.duration || source.duration,
      sampleRate: compressedMeta.sampleRate,
      channels: compressedMeta.channels,
      format: settings.format,
      bitrate: outputBitrate,
      reductionPercentage,
      isLossless,
      durationMs,
    };
  } finally {
    ffmpeg.off('progress', progressHandler);
    ffmpeg.off('log', logHandler);
    await ffmpeg.deleteFile(inputName).catch(() => {});
    await ffmpeg.deleteFile(outputName).catch(() => {});
  }
}
