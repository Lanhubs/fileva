export type ToolId = 
  | 'home'
  | 'remover'
  | 'compressor'
  | 'icon-generator'
  | 'color-extractor'
  | 'cropper'
  | 'video-compressor'
  | 'audio-compressor';

export interface ImageFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  objectUrl: string;
}

export interface VideoFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  duration: number; // in seconds
  bitrate: number; // in bps
  objectUrl: string;
}

export interface AudioFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  duration: number; // in seconds
  sampleRate: number; // e.g. 44100
  channels: number; // 1 or 2
  bitrate: number; // in bps
  objectUrl: string;
}

export type VideoResolutionPreset = 'original' | '1080p' | '720p' | '480p' | '360p' | 'custom';
export type VideoQualityPreset = 'lossless' | 'max' | 'balanced' | 'small' | 'target-size' | 'custom';
export type VideoFormat = 'mp4' | 'webm';

export interface VideoCompressionSettings {
  preset: VideoQualityPreset;
  resolution: VideoResolutionPreset;
  customWidth?: number;
  customHeight?: number;
  format: VideoFormat;
  crf: number; // 18 - 36
  targetSizeMb?: number;
  audioBitrateKbps: number; // e.g. 128
  stripMetadata: boolean;
}

export interface VideoCompressionResult {
  blob: Blob;
  objectUrl: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  format: VideoFormat;
  bitrate: number;
  reductionPercentage: number;
  isLossless: boolean;
  durationMs: number;
}

export type AudioQualityPreset = 'lossless' | 'high' | 'balanced' | 'standard' | 'small' | 'target-size' | 'custom';
export type AudioFormat = 'mp3' | 'aac' | 'ogg' | 'wav';

export interface AudioCompressionSettings {
  preset: AudioQualityPreset;
  format: AudioFormat;
  bitrateKbps: number; // 64, 96, 128, 192, 256, 320
  sampleRate: number; // 0 = original, 44100, 48000, 32000, 22050, 16000
  channels: number; // 0 = original, 1 = mono, 2 = stereo
  targetSizeMb?: number;
}

export interface AudioCompressionResult {
  blob: Blob;
  objectUrl: string;
  size: number;
  duration: number;
  sampleRate: number;
  channels: number;
  format: AudioFormat;
  bitrate: number;
  reductionPercentage: number;
  isLossless: boolean;
  durationMs: number;
}

export type SupportedFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export interface CompressionSettings {
  format: SupportedFormat;
  quality: number; // 0.01 - 1.0
  targetSizeKb?: number;
  mode: 'quality' | 'target-size';
  resize: {
    enabled: boolean;
    maxWidth: number;
    maxHeight: number;
  };
}

export interface CompressionResult {
  blob: Blob;
  objectUrl: string;
  size: number;
  width: number;
  height: number;
  reductionPercentage: number;
  format: string;
}

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  percentage: number;
  isLight: boolean;
}

export interface IconPreset {
  id: string;
  name: string;
  category: 'android' | 'ios' | 'web' | 'pwa' | 'desktop';
  width: number;
  height: number;
  filename: string;
  description?: string;
  maskable?: boolean;
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AspectRatioOption = 
  | 'free'
  | '1:1'
  | '16:9'
  | '4:3'
  | '3:2'
  | '2:3'
  | '9:16'
  | '21:9';
