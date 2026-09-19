import { VideoFileState, AudioFileState } from '../types';

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs.toString().padStart(2, '0')}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${ms > 0 ? `.${ms}` : ''}`;
}

export function formatBitrate(bps: number): string {
  if (!isFinite(bps) || isNaN(bps) || bps <= 0) return 'Variable';
  if (bps >= 1_000_000) {
    return `${(bps / 1_000_000).toFixed(2)} Mbps`;
  }
  return `${Math.round(bps / 1000)} kbps`;
}

/**
 * Inspects a video file using browser-native HTML5 video element metadata decoder.
 */
export function inspectVideoFile(file: File): Promise<VideoFileState> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanUp = () => {
      video.onloadedmetadata = null;
      video.onerror = null;
    };

    video.onloadedmetadata = () => {
      cleanUp();
      const duration = video.duration || 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      const bitrate = duration > 0 ? Math.round((file.size * 8) / duration) : 0;

      if (width === 0 || height === 0) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('This browser cannot decode this video format or the video stream contains no video track.'));
        return;
      }

      resolve({
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'video/mp4',
        width,
        height,
        duration,
        bitrate,
        objectUrl,
      });
    };

    video.onerror = () => {
      cleanUp();
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          `This browser cannot decode this video format (${file.type || file.name}). Please provide a supported MP4, WebM, or MOV file.`
        )
      );
    };

    video.src = objectUrl;
  });
}

/**
 * Inspects an audio file using browser-native Audio and AudioContext.
 */
export async function inspectAudioFile(file: File): Promise<AudioFileState> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const arrayBuffer = await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer();
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    
    let sampleRate = 44100;
    let channels = 2;
    let duration = 0;

    if (AudioContextClass) {
      try {
        const audioCtx = new AudioContextClass();
        const buffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
        sampleRate = buffer.sampleRate;
        channels = buffer.numberOfChannels;
        duration = buffer.duration;
        audioCtx.close().catch(() => {});
      } catch {
        // Fallback to audio element if Web Audio API decode fails on chunk
      }
    }

    if (!duration || duration <= 0) {
      // Fallback to HTMLAudioElement
      duration = await new Promise<number>((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          resolve(audio.duration || 0);
        };
        audio.onerror = () => {
          reject(new Error(`Unable to decode audio metadata for ${file.name}.`));
        };
        audio.src = objectUrl;
      });
    }

    const bitrate = duration > 0 ? Math.round((file.size * 8) / duration) : 0;

    return {
      file,
      name: file.name,
      size: file.size,
      type: file.type || 'audio/mpeg',
      duration,
      sampleRate,
      channels,
      bitrate,
      objectUrl,
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw new Error(
      `This browser cannot decode this audio format (${file.type || file.name}): ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}
