import React, { useState, useRef, useEffect } from 'react';
import {
  FiVideo,
  FiFilm,
  FiDownload,
  FiRefreshCw,
  FiSliders,
  FiPlay,
  FiCheckCircle,
  FiAlertTriangle,
  FiZap,
  FiFileText,
  FiTrash2,
} from 'react-icons/fi';
import {
  VideoFileState,
  VideoCompressionSettings,
  VideoCompressionResult,
  VideoQualityPreset,
  VideoResolutionPreset,
  VideoFormat,
} from '../../types';
import { formatBytes } from '../../lib/file-utils';
import { formatDuration, formatBitrate, inspectVideoFile } from '../../lib/media-utils';
import { compressVideo, VideoProgressInfo, VideoCompressionError } from './video-engine';
import { generateSampleVideo } from './sample-videos';

interface VideoCompressorProps {
  onClearGlobalFile?: () => void;
}

export const VideoCompressor: React.FC<VideoCompressorProps> = () => {
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
  const [failureInfo, setFailureInfo] = useState<{
    reason: string;
    suggestion?: string;
    technicalLogs?: string[];
    exitCode?: number;
  } | null>(null);
  const [result, setResult] = useState<VideoCompressionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'preview-compressed' | 'preview-original'>('comparison');
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const currentRunIdRef = useRef<number>(0);

  // Clean up object URLs on unmount or file replacement
  useEffect(() => {
    return () => {
      if (videoFile?.objectUrl) URL.revokeObjectURL(videoFile.objectUrl);
      if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    };
  }, [videoFile, result]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i)) {
      setInspectError('Please select a valid video file (MP4, WebM, MOV).');
      return;
    }

    setInspectError(null);
    setFailureInfo(null);
    setIsInspecting(true);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setResult(null);
    setStatus('idle');

    try {
      const inspected = await inspectVideoFile(file);
      setVideoFile(inspected);
      // Auto-set a reasonable default target size (approx 50% of original)
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
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (type: 'motion' | 'compact') => {
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
  };

  const handleCompress = async () => {
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
  };

  const handleDownload = () => {
    if (!result || !videoFile) return;
    const baseName = videoFile.name.replace(/\.[^/.]+$/, '');
    const ext = result.format === 'webm' ? 'webm' : 'mp4';
    const link = document.createElement('a');
    link.href = result.objectUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  };

  const handleReset = () => {
    if (videoFile?.objectUrl) URL.revokeObjectURL(videoFile.objectUrl);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setVideoFile(null);
    setResult(null);
    setStatus('idle');
    setProgressPercent(0);
    setStageMessage('');
    setFailureInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Estimated target bitrate calculation for feedback
  const targetVideoBitrateKbps =
    videoFile && settings.preset === 'target-size' && settings.targetSizeMb
      ? Math.round(
          Math.max(
            50,
            (settings.targetSizeMb * 1024 * 1024 * 8) / Math.max(1, videoFile.duration) / 1000 - 128
          )
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <FiFilm className="text-primary" />
            Video Compressor
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Browser-side H.264 & VP9 WebAssembly video compressor. All frames are processed locally without network uploads.
          </p>
        </div>

        {videoFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface hover:bg-background text-text-muted hover:text-rose-600 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Replace Video
            </button>
          </div>
        )}
      </div>

      {/* Upload Zone / Media Inspector */}
      {!videoFile ? (
        <div className="space-y-4">
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border hover:border-primary rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors bg-surface"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-primary-light rounded-full text-primary">
                <FiVideo className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">
                  Drop your video here, or <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Supports MP4 (H.264), WebM (VP8/VP9), and MOV. Processed entirely on your CPU/GPU.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Synthetic Test Generator */}
          <div className="p-4 bg-background border border-border rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                  <FiZap className="w-3.5 h-3.5 text-amber-500" />
                  Quick Test Benchmarks
                </span>
                <p className="text-xs text-text-muted">
                  Don't have a video on hand? Generate a local procedural test video directly from canvas:
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleSampleSelect('motion')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-surface border border-border text-text-main hover:bg-background disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isGeneratingSample ? 'Rendering...' : '720p Motion (3s)'}
                </button>
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleSampleSelect('compact')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-surface border border-border text-text-main hover:bg-background disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isGeneratingSample ? 'Rendering...' : '360p Compact (3s)'}
                </button>
              </div>
            </div>
          </div>

          {inspectError && (
            <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <FiAlertTriangle className="shrink-0" />
              <span>{inspectError}</span>
            </div>
          )}
        </div>
      ) : (
        /* Video Inspector and Compression Controls */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata & Compression Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Original Metadata Card */}
            <div className="p-4 bg-surface border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <FiFileText className="w-3.5 h-3.5" />
                  Original File
                </span>
                <span className="text-xs font-mono text-text-muted truncate max-w-37.5">
                  {videoFile.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block">File Size</span>
                  <span className="font-semibold text-text-main font-mono">
                    {formatBytes(videoFile.size)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Duration</span>
                  <span className="font-semibold text-text-main font-mono">
                    {formatDuration(videoFile.duration)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Resolution</span>
                  <span className="font-semibold text-text-main font-mono">
                    {videoFile.width} × {videoFile.height} px
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Est. Bitrate</span>
                  <span className="font-semibold text-text-main font-mono">
                    {formatBitrate(videoFile.bitrate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Compression Settings Card */}
            <div className="p-5 bg-surface border border-border rounded-lg space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <FiSliders className="w-3.5 h-3.5 text-primary" />
                  Encoder Configuration
                </span>
              </div>

              {/* Quality Preset */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-main flex items-center justify-between">
                  <span>Compression Strategy</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'balanced', label: 'Balanced', desc: 'CRF 24, high perceptual quality' },
                    { id: 'small', label: 'Small File', desc: 'Aggressive compression (CRF 30)' },
                    { id: 'max', label: 'Max Quality', desc: 'Near-lossless (CRF 19)' },
                    { id: 'target-size', label: 'Target Size', desc: 'Calculate bitrate from target MB' },
                    { id: 'lossless', label: 'Lossless / Remux', desc: 'Stream copy without re-encoding' },
                    { id: 'custom', label: 'Custom CRF', desc: 'Manual CRF & Bitrate control' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          preset: p.id as VideoQualityPreset,
                        }))
                      }
                      className={`p-2.5 text-left rounded border transition-all cursor-pointer ${
                        settings.preset === p.id
                          ? 'border-primary bg-primary-light text-primary font-semibold'
                          : 'border-border hover:border-border text-text-main hover:bg-background'
                      }`}
                    >
                      <div className="text-xs font-medium">{p.label}</div>
                      <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
                        {p.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target File Size Field */}
              {settings.preset === 'target-size' && (
                <div className="p-3 bg-primary-light/40 border border-primary/20 rounded space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-text-main">
                      Target File Size (MB)
                    </span>
                    <span className="font-mono text-primary font-bold">
                      {settings.targetSizeMb} MB
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max={Math.max(2, Math.round(videoFile.size / (1024 * 1024)))}
                      step="1"
                      value={settings.targetSizeMb || 1}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          targetSizeMb: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full accent-primary"
                    />
                    <input
                      type="number"
                      min="1"
                      value={settings.targetSizeMb || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          targetSizeMb: Math.max(1, parseFloat(e.target.value) || 1),
                        }))
                      }
                      className="w-20 px-2 py-1 text-xs border border-border rounded bg-surface text-text-main"
                    />
                  </div>
                  {targetVideoBitrateKbps !== null && (
                    <p className="text-[11px] text-text-muted">
                      Calculated video bitrate: <strong className="font-mono text-text-main">{targetVideoBitrateKbps} kbps</strong>.
                      {targetVideoBitrateKbps < 150 && (
                        <span className="text-amber-600 block mt-0.5">
                          Warning: Bitrate is very low; consider downscaling to 480p or 360p to avoid heavy artifacts.
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Custom CRF slider */}
              {settings.preset === 'custom' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text-main">
                      Constant Rate Factor (CRF)
                    </span>
                    <span className="font-mono font-bold text-primary">
                      {settings.crf}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="36"
                    step="1"
                    value={settings.crf}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        crf: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>18 (Near-Lossless)</span>
                    <span>24 (Balanced)</span>
                    <span>32+ (Aggressive)</span>
                  </div>
                </div>
              )}

              {/* Resolution Downscaling */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">
                  Output Resolution
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'original', label: 'Original' },
                    { id: '1080p', label: '1080p' },
                    { id: '720p', label: '720p HD' },
                    { id: '480p', label: '480p SD' },
                    { id: '360p', label: '360p Low' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          resolution: res.id as VideoResolutionPreset,
                        }))
                      }
                      className={`py-1.5 px-2 text-xs rounded border text-center transition-colors cursor-pointer ${
                        settings.resolution === res.id
                          ? 'border-primary bg-primary-light text-primary font-semibold'
                          : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-text-muted">
                  Downscaling reduces pixel data before encoding without artificial upscaling.
                </p>
              </div>

              {/* Format Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-main block mb-1">
                    Container & Codec
                  </label>
                  <select
                    value={settings.format}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        format: e.target.value as VideoFormat,
                      }))
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="mp4">MP4 (H.264 / AAC)</option>
                    <option value="webm">WebM (VP9 / Opus)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-main block mb-1">
                    Audio Bitrate
                  </label>
                  <select
                    value={settings.audioBitrateKbps}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        audioBitrateKbps: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value={64}>64 kbps (Mono/Voice)</option>
                    <option value={96}>96 kbps (Compact)</option>
                    <option value={128}>128 kbps (Standard)</option>
                    <option value={192}>192 kbps (High Fidelity)</option>
                  </select>
                </div>
              </div>

              {/* Action Button & Progress */}
              <div className="pt-2 border-t border-border space-y-3">
                <button
                  type="button"
                  disabled={status === 'preparing' || status === 'encoding' || status === 'finalizing'}
                  onClick={handleCompress}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-none transition-colors cursor-pointer"
                >
                  {status === 'preparing' || status === 'encoding' || status === 'finalizing' ? (
                    <>
                      <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{stageMessage || 'Compressing...'}</span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Compress Video Locally</span>
                    </>
                  )}
                </button>

                {/* Progress bar */}
                {(status === 'preparing' || status === 'encoding' || status === 'finalizing') && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-text-muted">
                      <span className="truncate">{stageMessage}</span>
                      <span className="font-mono font-bold text-primary">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-background border border-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-150"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                {status === 'failed' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <FiAlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <strong className="block font-bold text-rose-950 text-xs">Compression Failed</strong>
                          <span className="text-[11px] text-rose-700">The video encoder was unable to complete the job.</span>
                        </div>

                        {/* Explicit Failure Reason */}
                        <div className="p-2.5 bg-white/90 border border-rose-200 rounded text-xs space-y-1">
                          <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
                            Reason for Failure:
                          </span>
                          <p className="text-rose-950 text-xs font-medium leading-relaxed wrap-break-word">
                            {failureInfo?.reason || stageMessage || 'Encoding pipeline encountered an error.'}
                          </p>
                        </div>

                        {/* Suggested Resolution */}
                        {failureInfo?.suggestion && (
                          <div className="text-xs text-rose-900 bg-rose-100/60 p-2 rounded border border-rose-200/70">
                            <span className="font-semibold text-rose-950">Recommended Solution: </span>
                            <span>{failureInfo.suggestion}</span>
                          </div>
                        )}

                        {/* Quick Recovery Actions */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          {settings.format === 'webm' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSettings((prev) => ({ ...prev, format: 'mp4' }));
                                setTimeout(() => handleCompress(), 50);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer transition-colors shadow-none"
                            >
                              Switch to MP4 & Retry
                            </button>
                          )}
                          {settings.resolution === 'original' && (
                            <button
                              type="button"
                              onClick={() => {
                                setSettings((prev) => ({ ...prev, resolution: '720p' }));
                                setTimeout(() => handleCompress(), 50);
                              }}
                              className="px-2 py-1 text-[11px] font-semibold bg-white border border-rose-300 hover:bg-rose-50 text-rose-900 rounded cursor-pointer transition-colors"
                            >
                              Downscale to 720p & Retry
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={handleCompress}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-white border border-rose-300 hover:bg-rose-50 text-rose-900 rounded cursor-pointer transition-colors"
                          >
                            <FiRefreshCw className="w-3 h-3" />
                            Retry
                          </button>
                        </div>

                        {/* Technical diagnostics logs */}
                        {failureInfo?.technicalLogs && failureInfo.technicalLogs.length > 0 && (
                          <details className="text-[11px] pt-1">
                            <summary className="cursor-pointer text-rose-700 hover:text-rose-900 hover:underline select-none font-medium">
                              View Engine Logs ({failureInfo.technicalLogs.length} lines)
                            </summary>
                            <pre className="mt-1.5 p-2 bg-neutral-900 text-neutral-100 rounded text-[10px] font-mono overflow-x-auto max-h-32 whitespace-pre-wrap leading-tight">
                              {failureInfo.technicalLogs.join('\n')}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Video Preview & Comparison Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Results Summary Card (when completed) */}
            {result && (
              <div className="p-5 bg-surface border border-emerald-300 rounded-lg space-y-4 shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-text-main">
                        Compression Finished
                      </h3>
                      <p className="text-xs text-text-muted">
                        {result.isLossless
                          ? 'Genuinely lossless container optimization (zero visual degradation).'
                          : 'Re-encoded and optimized for visual quality & compact size.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-none transition-colors cursor-pointer"
                  >
                    <FiDownload className="w-3.5 h-3.5" />
                    Download Video ({formatBytes(result.size)})
                  </button>
                </div>

                {/* Reduction Metric Highlight */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-background rounded border border-border text-center">
                    <span className="text-[11px] text-text-muted block">Original</span>
                    <span className="text-sm font-mono font-bold text-text-main">
                      {formatBytes(videoFile.size)}
                    </span>
                  </div>
                  <div className="p-3 bg-background rounded border border-border text-center">
                    <span className="text-[11px] text-text-muted block">Compressed</span>
                    <span className="text-sm font-mono font-bold text-emerald-600">
                      {formatBytes(result.size)}
                    </span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-center">
                    <span className="text-[11px] text-emerald-700 block font-medium">Reduction</span>
                    <span className="text-sm font-mono font-bold text-emerald-700">
                      -{result.reductionPercentage}%
                    </span>
                  </div>
                </div>

                {/* Detailed Stream Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono text-text-muted">
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Resolution</span>
                    <span>{result.width}×{result.height}px</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Output Bitrate</span>
                    <span>{formatBitrate(result.bitrate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Output Format</span>
                    <span className="uppercase">{result.format}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Encoding Time</span>
                    <span>{(result.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}

            {/* Video Player Display */}
            <div className="p-5 bg-surface border border-border rounded-lg space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-border pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('comparison')}
                    className={`text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                      activeTab === 'comparison'
                        ? 'bg-primary text-white font-semibold'
                        : 'text-text-muted hover:text-text-main hover:bg-background'
                    }`}
                  >
                    Side-by-Side Player
                  </button>
                  {result && (
                    <button
                      onClick={() => setActiveTab('preview-compressed')}
                      className={`text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                        activeTab === 'preview-compressed'
                          ? 'bg-primary text-white font-semibold'
                          : 'text-text-muted hover:text-text-main hover:bg-background'
                      }`}
                    >
                      Compressed Only
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab('preview-original')}
                    className={`text-xs px-3 py-1.5 rounded font-medium transition-colors cursor-pointer ${
                      activeTab === 'preview-original'
                        ? 'bg-primary text-white font-semibold'
                        : 'text-text-muted hover:text-text-main hover:bg-background'
                    }`}
                  >
                    Original Only
                  </button>
                </div>
              </div>

              {/* Side-by-Side View */}
              {activeTab === 'comparison' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Original Video */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-main">
                        Original Video
                      </span>
                      <span className="font-mono text-text-muted">
                        {videoFile.width}×{videoFile.height} ({formatBytes(videoFile.size)})
                      </span>
                    </div>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                      <video
                        src={videoFile.objectUrl}
                        controls
                        playsInline
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Compressed Video or Placeholder */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-main">
                        Compressed Video
                      </span>
                      <span className="font-mono text-emerald-600">
                        {result ? `${result.width}×${result.height} (${formatBytes(result.size)})` : 'Pending compression'}
                      </span>
                    </div>
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                      {result ? (
                        <video
                          src={result.objectUrl}
                          controls
                          playsInline
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : status === 'failed' ? (
                        <div className="text-center p-4 text-rose-300 text-xs space-y-1.5 max-w-xs mx-auto">
                          <FiAlertTriangle className="w-7 h-7 mx-auto text-rose-400" />
                          <p className="font-bold text-white text-xs">Compression Failed</p>
                          <p className="text-[11px] text-rose-200 line-clamp-3 leading-snug">
                            {failureInfo?.reason || stageMessage}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-text-muted text-xs">
                          <FiFilm className="w-8 h-8 mx-auto mb-2 opacity-40 text-text-muted" />
                          <p>Click "Compress Video Locally" to generate compressed output.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Compressed Only View */}
              {activeTab === 'preview-compressed' && result && (
                <div className="space-y-2">
                  <div className="relative bg-black rounded-lg overflow-hidden max-h-125 flex items-center justify-center">
                    <video
                      src={result.objectUrl}
                      controls
                      playsInline
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Original Only View */}
              {activeTab === 'preview-original' && (
                <div className="space-y-2">
                  <div className="relative bg-black rounded-lg overflow-hidden max-h-125 flex items-center justify-center">
                    <video
                      src={videoFile.objectUrl}
                      controls
                      playsInline
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
