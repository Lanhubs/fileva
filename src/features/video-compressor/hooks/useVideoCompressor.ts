import { useState, useRef, useEffect, useCallback } from 'react';
import {
  VideoFileState,
  VideoCompressionSettings,
  VideoCompressionResult,
} from '../../../types';
import { inspectVideoFile } from '../../../lib/media-utils';
import { compressVideo, VideoProgressInfo, VideoCompressionError } from '../video-engine';
import { generateSampleVideo } from '../sample-videos';

export interface CompressionFailureInfo {
  reason: string;
  suggestion?: string;
  technicalLogs?: string[];
  exitCode?: number;
}

export type VideoPreviewTab = 'comparison' | 'preview-compressed' | 'preview-original';

export function useVideoCompressor() {
  const [videoFile, setVideoFile] = useState<VideoFileState | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const [settings, setSettings] = useState<VideoCompressionSettings>({
    preset: 'balanced',
    resolution: 'original',
    format: 'mp4',
    crf: 24,
    targetSizeMb: 10,
    audioBitrateKbps: 128,
    stripMetadata: true,
  });

  const [status, setStatus] = useState<VideoProgressInfo['status']>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [failureInfo, setFailureInfo] = useState<CompressionFailureInfo | null>(null);
  const [result, setResult] = useState<VideoCompressionResult | null>(null);
  const [activeTab, setActiveTab] = useState<VideoPreviewTab>('comparison');
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const currentRunIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (videoFile?.objectUrl) URL.revokeObjectURL(videoFile.objectUrl);
      if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    };
  }, [videoFile, result]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i)) {
      setInspectError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    setInspectError(null);
    setFailureInfo(null);
    setIsInspecting(true);
    setResult((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    setStatus('idle');

    try {
      const inspected = await inspectVideoFile(file);
      setVideoFile(inspected);
      const halfSizeMb = Math.max(1, Math.round((file.size / (1024 * 1024)) * 0.5));
      setSettings((prev) => ({
        ...prev,
        targetSizeMb: halfSizeMb,
      }));
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Failed to inspect video.');
      setVideoFile(null);
    } finally {
      setIsInspecting(false);
    }
  }, []);

  const handleSampleSelect = useCallback(async (type: 'motion' | 'compact') => {
    try {
      setIsGeneratingSample(true);
      setInspectError(null);
      const sample = await generateSampleVideo(type);
      await handleFile(sample);
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Could not generate sample video.');
    } finally {
      setIsGeneratingSample(false);
    }
  }, [handleFile]);

  const handleCompress = useCallback(async () => {
    if (!videoFile) return;

    const runId = ++currentRunIdRef.current;
    setStatus('preparing');
    setProgressPercent(0);
    setStageMessage('Starting local compression...');
    setFailureInfo(null);

    try {
      const compressionResult = await compressVideo(videoFile, settings, (info) => {
        if (currentRunIdRef.current === runId) {
          setStatus(info.status);
          setProgressPercent(info.percent);
          setStageMessage(info.message);
        }
      });

      if (currentRunIdRef.current === runId) {
        setResult(compressionResult);
        setStatus('completed');
        setActiveTab('comparison');
      }
    } catch (err: unknown) {
      if (currentRunIdRef.current === runId) {
        setStatus('failed');
        if (err instanceof VideoCompressionError) {
          setStageMessage(err.message);
          setFailureInfo({
            reason: err.reason,
            suggestion: err.suggestion,
            technicalLogs: err.technicalLogs,
            exitCode: err.exitCode,
          });
        } else if (err instanceof Error) {
          setStageMessage(err.message);
          setFailureInfo({
            reason: err.message,
            suggestion: 'Try switching container format to MP4 or downscaling resolution to 720p HD.',
          });
        } else {
          const msg = String(err || 'Compression failed.');
          setStageMessage(msg);
          setFailureInfo({
            reason: msg,
            suggestion: 'Try switching to MP4 format or downscaling resolution to 720p.',
          });
        }
      }
    }
  }, [videoFile, settings]);

  const handleDownload = useCallback(() => {
    if (!result || !videoFile) return;
    const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
    const ext = result.format === 'webm' ? 'webm' : 'mp4';
    const link = document.createElement('a');
    link.href = result.objectUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  }, [result, videoFile]);

  const handleReset = useCallback(() => {
    if (videoFile?.objectUrl) URL.revokeObjectURL(videoFile.objectUrl);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setVideoFile(null);
    setResult(null);
    setStatus('idle');
    setProgressPercent(0);
    setStageMessage('');
    setFailureInfo(null);
  }, [videoFile, result]);

  const targetVideoBitrateKbps =
    videoFile && settings.preset === 'target-size' && settings.targetSizeMb
      ? Math.round(
          Math.max(
            50,
            (settings.targetSizeMb * 1024 * 1024 * 8) / Math.max(1, videoFile.duration) / 1000 - 128
          )
        )
      : null;

  return {
    videoFile,
    isInspecting,
    inspectError,
    settings,
    setSettings,
    status,
    progressPercent,
    stageMessage,
    failureInfo,
    result,
    activeTab,
    setActiveTab,
    isGeneratingSample,
    targetVideoBitrateKbps,
    handleFile,
    handleSampleSelect,
    handleCompress,
    handleDownload,
    handleReset,
  };
}
