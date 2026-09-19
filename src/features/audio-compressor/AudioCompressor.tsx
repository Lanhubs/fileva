import React, { useState, useRef, useEffect } from 'react';
import {
  FiMusic,
  FiVolume2,
  FiDownload,
  FiRefreshCw,
  FiSliders,
  FiPlay,
  FiCheckCircle,
  FiAlertTriangle,
  FiZap,
  
  FiFileText,
  FiTrash2,
  FiRadio,
} from 'react-icons/fi';
import {
  AudioFileState,
  AudioCompressionSettings,
  AudioCompressionResult,
  AudioQualityPreset,
  AudioFormat,
} from '../../types';
import { formatBytes } from '../../lib/file-utils';
import { formatDuration, formatBitrate, inspectAudioFile } from '../../lib/media-utils';
import { compressAudio, AudioProgressInfo } from './audio-engine';
import { generateSampleAudio } from './sample-audio';

export const AudioCompressor: React.FC = () => {
  const [audioFile, setAudioFile] = useState<AudioFileState | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AudioCompressionSettings>({
    preset: 'balanced',
    format: 'mp3',
    bitrateKbps: 192,
    sampleRate: 0, // 0 = original
    channels: 0, // 0 = original
    targetSizeMb: 5,
  });

  const [status, setStatus] = useState<AudioProgressInfo['status']>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [result, setResult] = useState<AudioCompressionResult | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const currentRunIdRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (audioFile?.objectUrl) URL.revokeObjectURL(audioFile.objectUrl);
      if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    };
  }, [audioFile, result]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i)) {
      setInspectError('Please select a valid audio file (MP3, WAV, AAC, OGG, FLAC).');
      return;
    }

    setInspectError(null);
    setIsInspecting(true);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setResult(null);
    setStatus('idle');

    try {
      const inspected = await inspectAudioFile(file);
      setAudioFile(inspected);
      const halfSizeMb = Math.max(1, Math.round((file.size / (1024 * 1024)) * 0.5));
      setSettings((prev) => ({
        ...prev,
        targetSizeMb: halfSizeMb,
      }));
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Failed to inspect audio.');
      setAudioFile(null);
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

  const handleSampleSelect = async (type: 'speech-synth' | 'music') => {
    try {
      setIsGeneratingSample(true);
      setInspectError(null);
      const sample = await generateSampleAudio(type);
      await handleFile(sample);
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Could not generate sample audio.');
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const handleCompress = async () => {
    if (!audioFile) return;

    const runId = ++currentRunIdRef.current;
    setStatus('preparing');
    setProgressPercent(0);
    setStageMessage('Starting local audio compression...');

    try {
      const compressionResult = await compressAudio(audioFile, settings, (info) => {
        if (currentRunIdRef.current === runId) {
          setStatus(info.status);
          setProgressPercent(info.percent);
          setStageMessage(info.message);
        }
      });

      if (currentRunIdRef.current === runId) {
        setResult(compressionResult);
        setStatus('completed');
      }
    } catch (err) {
      if (currentRunIdRef.current === runId) {
        setStatus('failed');
        setStageMessage(err instanceof Error ? err.message : 'Audio compression failed.');
      }
    }
  };

  const handleDownload = () => {
    if (!result || !audioFile) return;
    const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
    const ext =
      result.format === 'wav'
        ? 'wav'
        : result.format === 'aac'
        ? 'm4a'
        : result.format === 'ogg'
        ? 'ogg'
        : 'mp3';
    const link = document.createElement('a');
    link.href = result.objectUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  };

  const handleReset = () => {
    if (audioFile?.objectUrl) URL.revokeObjectURL(audioFile.objectUrl);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setAudioFile(null);
    setResult(null);
    setStatus('idle');
    setProgressPercent(0);
    setStageMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Target audio bitrate calculated from target file size
  const calculatedTargetKbps =
    audioFile && settings.preset === 'target-size' && settings.targetSizeMb
      ? Math.round(
          Math.max(
            32,
            Math.min(320, (settings.targetSizeMb * 1024 * 1024 * 8) / Math.max(1, audioFile.duration) / 1000)
          )
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
            <FiVolume2 className="text-primary" />
            Audio Compressor
          </h2>
          <p className="text-xs text-text-muted mt-1">
            In-browser MP3, AAC, and Opus audio encoder. Resample rates, downmix to mono, or apply perceptual psychoacoustic compression.
          </p>
        </div>

        {audioFile && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface hover:bg-background text-text-muted hover:text-rose-600 transition-colors cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Replace Audio
            </button>
          </div>
        )}
      </div>

      {/* Upload Zone / Media Inspector */}
      {!audioFile ? (
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
              accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/flac,audio/x-m4a,.mp3,.wav,.ogg,.aac,.m4a"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-primary-light rounded-full text-primary">
                <FiMusic className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-main">
                  Drop your audio file here, or <span className="text-primary underline">browse</span>
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Supports MP3, WAV, AAC, M4A, FLAC, and OGG. Processed client-side.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Synthetic Audio Generator */}
          <div className="p-4 bg-background border border-border rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                  <FiZap className="w-3.5 h-3.5 text-amber-500" />
                  Quick Audio Test Benchmarks
                </span>
                <p className="text-xs text-text-muted">
                  Synthesize an audio sample directly in-memory via Web Audio API:
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleSampleSelect('music')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-surface border border-border text-text-main hover:bg-background disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isGeneratingSample ? 'Synthesizing...' : 'Harmonic Chords (WAV)'}
                </button>
                <button
                  type="button"
                  disabled={isGeneratingSample}
                  onClick={() => handleSampleSelect('speech-synth')}
                  className="px-3 py-1.5 text-xs font-medium rounded bg-surface border border-border text-text-main hover:bg-background disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {isGeneratingSample ? 'Synthesizing...' : 'Speech Formant (WAV)'}
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
        /* Audio Controls and Results */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Metadata & Settings (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Original Metadata Card */}
            <div className="p-4 bg-surface border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <FiFileText className="w-3.5 h-3.5" />
                  Source Audio
                </span>
                <span className="text-xs font-mono text-text-muted truncate max-w-40">
                  {audioFile.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-text-muted block">File Size</span>
                  <span className="font-semibold text-text-main font-mono">
                    {formatBytes(audioFile.size)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Duration</span>
                  <span className="font-semibold text-text-main font-mono">
                    {formatDuration(audioFile.duration)}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Sample Rate</span>
                  <span className="font-semibold text-text-main font-mono">
                    {audioFile.sampleRate} Hz
                  </span>
                </div>
                <div>
                  <span className="text-text-muted block">Channels</span>
                  <span className="font-semibold text-text-main font-mono">
                    {audioFile.channels === 1 ? 'Mono (1 ch)' : 'Stereo (2 ch)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Encoder Configuration Card */}
            <div className="p-5 bg-surface border border-border rounded-lg space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                  <FiSliders className="w-3.5 h-3.5 text-primary" />
                  Compression Preset
                </span>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'high', label: 'High Fidelity', desc: '320 kbps (Audiophile quality)' },
                  { id: 'balanced', label: 'Balanced', desc: '192 kbps (Standard music)' },
                  { id: 'standard', label: 'Standard', desc: '128 kbps (Streaming / podcasts)' },
                  { id: 'small', label: 'Small File', desc: '64 kbps (Speech & voice memos)' },
                  { id: 'target-size', label: 'Target Size', desc: 'Calculated from target MB' },
                  { id: 'lossless', label: 'Lossless (WAV)', desc: '16-bit uncompressed PCM' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        preset: p.id as AudioQualityPreset,
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

              {/* Target File Size Slider */}
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
                      min="0.5"
                      max={Math.max(1, Math.round(audioFile.size / (1024 * 1024)))}
                      step="0.5"
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
                      min="0.2"
                      step="0.5"
                      value={settings.targetSizeMb || ''}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          targetSizeMb: Math.max(0.1, parseFloat(e.target.value) || 0.5),
                        }))
                      }
                      className="w-20 px-2 py-1 text-xs border border-border rounded bg-surface text-text-main"
                    />
                  </div>
                  {calculatedTargetKbps !== null && (
                    <p className="text-[11px] text-text-muted">
                      Computed audio bitrate: <strong className="font-mono text-text-main">{calculatedTargetKbps} kbps</strong>
                    </p>
                  )}
                </div>
              )}

              {/* Format & Channels */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-main block mb-1">
                    Output Format
                  </label>
                  <select
                    value={settings.format}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        format: e.target.value as AudioFormat,
                      }))
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="mp3">MP3 (Universal)</option>
                    <option value="aac">AAC / M4A (Efficient)</option>
                    <option value="ogg">OGG / Opus (Open Standard)</option>
                    <option value="wav">WAV (Uncompressed PCM)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-main block mb-1">
                    Channel Downmix
                  </label>
                  <select
                    value={settings.channels}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        channels: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value={0}>Keep Original</option>
                    <option value={1}>Mono (1 ch - 50% data cut)</option>
                    <option value={2}>Stereo (2 ch)</option>
                  </select>
                </div>
              </div>

              {/* Sample Rate */}
              <div>
                <label className="text-xs font-semibold text-text-main block mb-1">
                  Resample Rate
                </label>
                <select
                  value={settings.sampleRate}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      sampleRate: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value={0}>Keep Original ({audioFile.sampleRate} Hz)</option>
                  <option value={44100}>44,100 Hz (CD Audio standard)</option>
                  <option value={48000}>48,000 Hz (Video standard)</option>
                  <option value={32000}>32,000 Hz (Broadcast)</option>
                  <option value={22050}>22,050 Hz (Speech / Voice standard)</option>
                  <option value={16000}>16,000 Hz (Compact voice)</option>
                </select>
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
                      <span>{stageMessage || 'Compressing audio...'}</span>
                    </>
                  ) : (
                    <>
                      <FiPlay className="w-3.5 h-3.5" />
                      <span>Compress Audio Locally</span>
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
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                    <strong className="block font-bold">Error:</strong>
                    <span>{stageMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Audio Players & Results (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Results Card */}
            {result && (
              <div className="p-5 bg-surface border border-emerald-300 rounded-lg space-y-4 shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-text-main">
                        Audio Compression Finished
                      </h3>
                      <p className="text-xs text-text-muted">
                        {result.isLossless
                          ? 'Lossless uncompressed audio preserved.'
                          : 'Perceptual audio compression applied.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-none transition-colors cursor-pointer"
                  >
                    <FiDownload className="w-3.5 h-3.5" />
                    Download Audio ({formatBytes(result.size)})
                  </button>
                </div>

                {/* Reduction Metric Highlight */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-background rounded border border-border text-center">
                    <span className="text-[11px] text-text-muted block">Original</span>
                    <span className="text-sm font-mono font-bold text-text-main">
                      {formatBytes(audioFile.size)}
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
                    <span className="text-[10px] uppercase text-text-muted block">Sample Rate</span>
                    <span>{result.sampleRate} Hz</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Channels</span>
                    <span>{result.channels === 1 ? 'Mono' : 'Stereo'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Output Bitrate</span>
                    <span>{formatBitrate(result.bitrate)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-text-muted block">Processing Time</span>
                    <span>{(result.durationMs / 1000).toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Players */}
            <div className="space-y-4">
              {/* Original Audio Player */}
              <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-main flex items-center gap-1.5">
                    <FiRadio className="text-primary" />
                    Original Audio Stream
                  </span>
                  <span className="font-mono text-text-muted">
                    {formatBytes(audioFile.size)} • {formatDuration(audioFile.duration)}
                  </span>
                </div>
                <audio
                  src={audioFile.objectUrl}
                  controls
                  className="w-full h-10"
                />
              </div>

              {/* Compressed Audio Player */}
              <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-main flex items-center gap-1.5">
                    <FiCheckCircle className="text-emerald-600" />
                    Compressed Output Stream
                  </span>
                  <span className="font-mono text-emerald-600">
                    {result ? `${formatBytes(result.size)} • ${formatDuration(result.duration)}` : 'Awaiting compression'}
                  </span>
                </div>
                {result ? (
                  <audio
                    src={result.objectUrl}
                    controls
                    className="w-full h-10"
                  />
                ) : (
                  <div className="p-6 text-center text-text-muted text-xs border border-dashed border-border rounded">
                    Click "Compress Audio Locally" on the left to generate the compressed track.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
