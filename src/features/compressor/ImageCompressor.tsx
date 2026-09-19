import React, { useState, useEffect, useRef } from 'react';
import {
  FiDownload,
  FiSliders,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiEye,
  FiColumns,
} from 'react-icons/fi';
import { ImageFileState, CompressionSettings, CompressionResult, SupportedFormat } from '../../types';
import { compressImage } from './compressor-engine';
import { formatBytes, downloadBlob, replaceFileExtension } from '../../lib/file-utils';
import { checkBrowserCapabilities } from '../../lib/browser-support';
import { DropZone } from '../../components/common/DropZone';
import { Checkerboard } from '../../components/common/Checkerboard';

interface ImageCompressorProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageCompressor: React.FC<ImageCompressorProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  const capabilities = checkBrowserCapabilities();

  const [settings, setSettings] = useState<CompressionSettings>({
    format: 'image/webp',
    quality: 0.8,
    targetSizeKb: 250,
    mode: 'quality',
    resize: {
      enabled: false,
      maxWidth: 1920,
      maxHeight: 1080,
    },
  });

  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'toggle'>('side-by-side');
  const [toggleActive, setToggleActive] = useState<'original' | 'compressed'>('compressed');

  // Track active object URL to prevent memory leaks
  const activeResultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (activeResultUrlRef.current) {
        URL.revokeObjectURL(activeResultUrlRef.current);
      }
    };
  }, []);

  const runCompression = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await compressImage(imageFile.objectUrl, imageFile.size, settings);

      if (activeResultUrlRef.current) {
        URL.revokeObjectURL(activeResultUrlRef.current);
      }
      activeResultUrlRef.current = res.objectUrl;
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Compression failed.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // Trigger compression whenever image or primary settings change (debounced for sliders)
  useEffect(() => {
    if (!imageFile) {
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      runCompression();
    }, 250);

    return () => clearTimeout(timer);
  }, [imageFile, settings.format, settings.quality, settings.mode, settings.targetSizeKb, settings.resize]);

  const handleDownload = () => {
    if (!result || !imageFile) return;

    let ext = 'webp';
    if (result.format === 'image/jpeg') ext = 'jpg';
    else if (result.format === 'image/png') ext = 'png';
    else if (result.format === 'image/avif') ext = 'avif';

    const filename = replaceFileExtension(imageFile.name, `compressed.${ext}`);
    downloadBlob(result.blob, filename);
  };

  if (!imageFile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-border bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-main mb-1">
            Image Compressor
          </h2>
          <p className="text-xs text-text-muted mb-6">
            Compress JPEG, PNG, WebP, and AVIF images locally. Supports quality control and target file size binary search.
          </p>
          <DropZone onFileSelected={onFileSelect} acceptText="JPEG, PNG, WebP, AVIF, BMP" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Controls Bar & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-1 space-y-5 border border-border bg-surface rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-primary" /> Compression Config
            </h3>
            <button
              onClick={onClear}
              className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" /> Change Image
            </button>
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-main">
              Output Format
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, format: 'image/webp' }))}
                className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
                  settings.format === 'image/webp'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border hover:bg-background text-text-main'
                }`}
              >
                WebP <span className="text-[10px] text-text-muted block font-sans">Modern efficient</span>
              </button>

              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, format: 'image/jpeg' }))}
                className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
                  settings.format === 'image/jpeg'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border hover:bg-background text-text-main'
                }`}
              >
                JPEG <span className="text-[10px] text-text-muted block font-sans">Universal compatibility</span>
              </button>

              <button
                type="button"
                onClick={() => setSettings((s) => ({ ...s, format: 'image/png' }))}
                className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
                  settings.format === 'image/png'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border hover:bg-background text-text-main'
                }`}
              >
                PNG <span className="text-[10px] text-text-muted block font-sans">Lossless alpha</span>
              </button>

              <button
                type="button"
                disabled={!capabilities.supportsAVIF}
                onClick={() => setSettings((s) => ({ ...s, format: 'image/avif' }))}
                className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
                  !capabilities.supportsAVIF
                    ? 'opacity-40 cursor-not-allowed border-border text-text-muted'
                    : settings.format === 'image/avif'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border hover:bg-background text-text-main'
                }`}
              >
                AVIF <span className="text-[10px] text-text-muted block font-sans">{capabilities.supportsAVIF ? 'Next-gen compact' : 'Unsupported'}</span>
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          {settings.format !== 'image/png' && (
            <div className="space-y-3">
              <div className="flex border border-border rounded p-0.5 bg-background text-xs">
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, mode: 'quality' }))}
                  className={`flex-1 py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                    settings.mode === 'quality'
                      ? 'bg-surface text-text-main shadow-none font-bold'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Quality Slider
                </button>
                <button
                  type="button"
                  onClick={() => setSettings((s) => ({ ...s, mode: 'target-size' }))}
                  className={`flex-1 py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                    settings.mode === 'target-size'
                      ? 'bg-surface text-text-main shadow-none font-bold'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  Target File Size
                </button>
              </div>

              {/* Quality Slider */}
              {settings.mode === 'quality' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-text-muted">Quality:</span>
                    <span className="font-bold text-text-main">
                      {Math.round(settings.quality * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={Math.round(settings.quality * 100)}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, quality: Number(e.target.value) / 100 }))
                    }
                    className="w-full accent-primary cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-text-muted font-mono">
                    <span>Smallest (5%)</span>
                    <span>Standard (80%)</span>
                    <span>Max (100%)</span>
                  </div>
                </div>
              ) : (
                /* Target File Size Input */
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-main flex justify-between">
                    <span>Target Size (KB)</span>
                    <span className="font-mono text-text-muted">{settings.targetSizeKb} KB</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    step="10"
                    value={settings.targetSizeKb || 250}
                    onChange={(e) =>
                      setSettings((s) => ({ ...s, targetSizeKb: Math.max(10, Number(e.target.value)) }))
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {[100, 250, 500, 1000].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSettings((s) => ({ ...s, targetSizeKb: size }))}
                        className="text-[11px] font-mono px-2 py-0.5 rounded border border-border hover:bg-background text-text-muted hover:text-text-main cursor-pointer"
                      >
                        {size >= 1000 ? `${size / 1000}MB` : `${size}KB`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Downscaling Options */}
          <div className="space-y-2 pt-3 border-t border-border">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
              <input
                type="checkbox"
                checked={settings.resize.enabled}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    resize: { ...s.resize, enabled: e.target.checked },
                  }))
                }
                className="rounded accent-primary text-primary focus:ring-primary"
              />
              <span>Downscale Max Dimensions</span>
            </label>

            {settings.resize.enabled && (
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[
                  { label: 'FHD 1080p', w: 1920, h: 1080 },
                  { label: 'HD 720p', w: 1280, h: 720 },
                  { label: 'Small 480p', w: 800, h: 600 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setSettings((s) => ({
                        ...s,
                        resize: { enabled: true, maxWidth: preset.w, maxHeight: preset.h },
                      }))
                    }
                    className={`p-1.5 rounded border text-center text-[11px] cursor-pointer ${
                      settings.resize.maxWidth === preset.w
                        ? 'border-primary bg-primary-light text-primary font-bold'
                        : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Action */}
          <div className="pt-2">
            <button
              onClick={handleDownload}
              disabled={!result || isProcessing}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download Compressed Image</span>
            </button>
          </div>
        </div>

        {/* Right Column: Statistics & Visual Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {/* Performance & File Metrics Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-border bg-surface rounded-lg p-4">
            <div>
              <div className="text-[11px] font-mono text-text-muted uppercase">Original</div>
              <div className="text-base font-bold font-mono text-text-main">
                {formatBytes(imageFile.size)}
              </div>
              <div className="text-[10px] text-text-muted font-mono">
                {imageFile.width}×{imageFile.height}px
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-text-muted uppercase">Compressed</div>
              <div className="text-base font-bold font-mono text-text-main">
                {result ? formatBytes(result.size) : '...'}
              </div>
              <div className="text-[10px] text-text-muted font-mono">
                {result ? `${result.width}×${result.height}px` : '-'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-text-muted uppercase">Reduction</div>
              <div
                className={`text-base font-bold font-mono ${
                  result && result.reductionPercentage > 0
                    ? 'text-emerald-600'
                    : 'text-text-main'
                }`}
              >
                {result ? `${result.reductionPercentage}%` : '-'}
              </div>
              <div className="text-[10px] text-text-muted">
                {result && result.reductionPercentage > 0 ? 'Savings achieved' : 'Unchanged'}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-text-muted uppercase">Format</div>
              <div className="text-base font-bold font-mono uppercase text-text-main">
                {settings.format.replace('image/', '')}
              </div>
              <div className="text-[10px] text-text-muted">
                {settings.format === 'image/png' ? 'Lossless' : 'Lossy encoded'}
              </div>
            </div>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 border border-border rounded p-0.5 bg-background text-xs">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-surface text-text-main shadow-none font-bold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <FiColumns className="w-3.5 h-3.5 text-primary" /> Side by Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('toggle')}
                className={`px-2.5 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'toggle'
                    ? 'bg-surface text-text-main shadow-none font-bold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <FiEye className="w-3.5 h-3.5 text-primary" /> A/B Toggle
              </button>
            </div>

            {isProcessing && (
              <span className="text-xs font-mono text-primary">
                Encoding canvas...
              </span>
            )}
          </div>

          {/* Image Previews */}
          <div className="border border-border bg-surface rounded-lg p-4 overflow-hidden">
            {errorMsg && (
              <div className="mb-3 flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{errorMsg}</div>
              </div>
            )}

            {viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span>Original Source</span>
                    <span>{formatBytes(imageFile.size)}</span>
                  </div>
                  <Checkerboard className="rounded border border-border h-64 sm:h-80 flex items-center justify-center p-2">
                    <img
                      src={imageFile.objectUrl}
                      alt="Original image"
                      className="max-h-full max-w-full object-contain"
                    />
                  </Checkerboard>
                </div>

                {/* Compressed */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span className="text-primary font-semibold">
                      Compressed Result
                    </span>
                    <span className="font-semibold text-text-main">
                      {result ? formatBytes(result.size) : 'Calculating...'}
                    </span>
                  </div>
                  <Checkerboard className="rounded border border-border h-64 sm:h-80 flex items-center justify-center p-2">
                    {result ? (
                      <img
                        src={result.objectUrl}
                        alt="Compressed result"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-xs font-mono text-text-muted">Processing compression...</div>
                    )}
                  </Checkerboard>
                </div>
              </div>
            ) : (
              /* A/B Toggle View */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-text-muted">
                    Currently Viewing:{' '}
                    <span className="font-bold text-text-main uppercase">
                      {toggleActive} ({toggleActive === 'original' ? formatBytes(imageFile.size) : result ? formatBytes(result.size) : '...'})
                    </span>
                  </span>
                  <div className="flex gap-1 border border-border rounded p-0.5 bg-background text-xs">
                    <button
                      type="button"
                      onClick={() => setToggleActive('original')}
                      className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                        toggleActive === 'original'
                          ? 'bg-surface text-text-main font-bold'
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setToggleActive('compressed')}
                      className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
                        toggleActive === 'compressed'
                          ? 'bg-surface text-text-main font-bold'
                          : 'text-text-muted hover:text-text-main'
                      }`}
                    >
                      Compressed
                    </button>
                  </div>
                </div>

                <Checkerboard className="rounded border border-border h-80 sm:h-96 flex items-center justify-center p-2">
                  <img
                    src={toggleActive === 'original' ? imageFile.objectUrl : (result?.objectUrl || imageFile.objectUrl)}
                    alt="Toggle preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </Checkerboard>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
