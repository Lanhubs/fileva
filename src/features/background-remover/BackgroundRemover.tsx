import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiDownload,
  FiSliders,
  FiRefreshCw,
  FiEye,
  FiColumns,
  FiAlertCircle,
  FiCpu,
  FiLayers,
  FiPlay,
  FiInfo,
} from 'react-icons/fi';
import { ImageFileState } from '../../types';
import {
  removeImageBackground,
  compositeCutoutOverColor,
  ModelType,
  DeviceType,
  OutputMode,
  RemovalStatus,
  ProgressInfo,
} from './remover-engine';
import { downloadBlob, replaceFileExtension, formatBytes } from '../../lib/file-utils';
import { DropZone } from '../../components/common/DropZone';
import { Checkerboard } from '../../components/common/Checkerboard';
import { generateSampleImage } from './sample-images';

interface BackgroundRemoverProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  // Configuration states
  const [model, setModel] = useState<ModelType>('isnet_fp16');
  const [device, setDevice] = useState<DeviceType>('gpu');
  const [outputMode, setOutputMode] = useState<OutputMode>('foreground');

  // Preview options
  const [backdrop, setBackdrop] = useState<'checker' | 'dark' | 'light' | 'custom'>('checker');
  const [customBgColor, setCustomBgColor] = useState('#ffffff');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'result-only'>('side-by-side');

  // Execution states
  const [status, setStatus] = useState<RemovalStatus>('idle');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [stageText, setStageText] = useState<string>('');
  const [bytesInfo, setBytesInfo] = useState<{ current: number; total: number } | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [executionStats, setExecutionStats] = useState<{
    durationMs: number;
    width: number;
    height: number;
    size: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSampleLoading, setIsSampleLoading] = useState(false);

  // Keep track of object URLs to prevent browser memory leaks
  const activeResultUrlRef = useRef<string | null>(null);
  // Track active execution run to discard stale executions
  const currentRunIdRef = useRef<number>(0);

  const cleanupActiveResultUrl = useCallback(() => {
    if (activeResultUrlRef.current) {
      URL.revokeObjectURL(activeResultUrlRef.current);
      activeResultUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupActiveResultUrl();
    };
  }, [cleanupActiveResultUrl]);

  const runRemoval = useCallback(async () => {
    if (!imageFile) return;

    const runId = ++currentRunIdRef.current;
    setStatus('preparing');
    setProgressPercent(0);
    setStageText('Initializing in-browser neural engine...');
    setBytesInfo(null);
    setErrorMsg(null);

    try {
      const result = await removeImageBackground(imageFile.file, {
        model,
        device,
        outputMode,
        onProgress: (info: ProgressInfo) => {
          if (currentRunIdRef.current !== runId) return;
          setStatus(info.status);
          setProgressPercent(info.percent);
          setStageText(info.message);
          if (info.bytesLoaded !== undefined && info.bytesTotal !== undefined) {
            setBytesInfo({ current: info.bytesLoaded, total: info.bytesTotal });
          }
        },
      });

      if (currentRunIdRef.current !== runId) return;

      cleanupActiveResultUrl();
      activeResultUrlRef.current = result.objectUrl;

      setProcessedUrl(result.objectUrl);
      setProcessedBlob(result.blob);
      setExecutionStats({
        durationMs: result.durationMs,
        width: result.width || imageFile.width,
        height: result.height || imageFile.height,
        size: result.size,
      });
      setStatus('completed');
    } catch (err: unknown) {
      if (currentRunIdRef.current !== runId) return;
      const msg = err instanceof Error ? err.message : 'Background removal failed.';
      setErrorMsg(msg);
      setStatus('failed');
      setStageText('Inference failed');
    }
  }, [imageFile, model, device, outputMode, cleanupActiveResultUrl]);

  // Trigger processing when new image is provided
  useEffect(() => {
    if (!imageFile) {
      cleanupActiveResultUrl();
      setProcessedUrl(null);
      setProcessedBlob(null);
      setExecutionStats(null);
      setStatus('idle');
      setProgressPercent(0);
      setStageText('');
      setBytesInfo(null);
      setErrorMsg(null);
      return;
    }

    runRemoval();
  }, [imageFile, runRemoval, cleanupActiveResultUrl]);

  const handleDownload = () => {
    if (!processedBlob || !imageFile) return;
    const extSuffix = outputMode === 'mask' ? 'alpha-mask.png' : 'no-bg.png';
    const filename = replaceFileExtension(imageFile.name, extSuffix);
    downloadBlob(processedBlob, filename);
  };

  const handleDownloadComposite = async () => {
    if (!processedBlob || !imageFile || backdrop !== 'custom') return;
    try {
      const composite = await compositeCutoutOverColor(
        processedBlob,
        customBgColor,
        imageFile.width,
        imageFile.height
      );
      const filename = replaceFileExtension(imageFile.name, 'composite.png');
      downloadBlob(composite.blob, filename);
      URL.revokeObjectURL(composite.objectUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Composite generation failed.';
      setErrorMsg(msg);
    }
  };

  const loadSample = async (type: 'portrait' | 'product' | 'complex') => {
    try {
      setIsSampleLoading(true);
      const file = await generateSampleImage(type);
      onFileSelect(file);
    } catch {
      setErrorMsg('Failed to generate sample image.');
    } finally {
      setIsSampleLoading(false);
    }
  };

  const isBusy = status === 'preparing' || status === 'processing';

  if (!imageFile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-border bg-surface rounded-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-text-main">
                Background Remover
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                 Zero server uploads.
              </p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 bg-background text-text-muted rounded border border-border">
              WebAssembly / WebGPU
            </span>
          </div>

          <DropZone onFileSelected={onFileSelect} acceptText="PNG, JPEG, WebP, AVIF, BMP" />

          {/* Quick-test sample images */}
          <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs font-semibold text-text-muted mb-3">
              Or load a benchmark test image:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={isSampleLoading}
                onClick={() => loadSample('portrait')}
                className="p-3 text-left rounded border border-border hover:border-primary bg-background hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="text-xs font-bold text-text-main">Portrait / Person</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Tests face, hair strands & edge matting
                </div>
              </button>
              <button
                type="button"
                disabled={isSampleLoading}
                onClick={() => loadSample('product')}
                className="p-3 text-left rounded border border-border hover:border-primary bg-background hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="text-xs font-bold text-text-main">Product Studio</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Tests gadget edges, drop shadows & glass
                </div>
              </button>
              <button
                type="button"
                disabled={isSampleLoading}
                onClick={() => loadSample('complex')}
                className="p-3 text-left rounded border border-border hover:border-primary bg-background hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="text-xs font-bold text-text-main">Complex Pattern</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Tests geometric stripes & intricate boundaries
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Panel */}
        <div className="lg:col-span-1 space-y-5 border border-border bg-surface rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-primary" /> Neural Segmentation
            </h3>
            <button
              onClick={onClear}
              className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" /> Change
            </button>
          </div>

          {/* Real Status & Progress Section */}
          <div className="space-y-2.5 p-3 rounded bg-background border border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-text-muted">Processing Status:</span>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                  status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : status === 'failed'
                    ? 'bg-rose-50 text-rose-800 border border-rose-300'
                    : isBusy
                    ? 'bg-primary-light text-primary border border-primary/30'
                    : 'bg-surface text-text-muted border border-border'
                }`}
              >
                {status}
              </span>
            </div>

            {isBusy && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-text-main">
                  <span className="truncate pr-2">{stageText || 'Processing...'}</span>
                  <span className="font-bold text-primary">{progressPercent}%</span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border">
                  <div
                    className="bg-primary h-full transition-all duration-200"
                    style={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
                  />
                </div>
                {bytesInfo && bytesInfo.total > 0 && (
                  <div className="text-[10px] font-mono text-text-muted text-right">
                    {formatBytes(bytesInfo.current)} / {formatBytes(bytesInfo.total)}
                  </div>
                )}
              </div>
            )}

            {status === 'completed' && executionStats && (
              <div className="pt-1 text-[11px] font-mono text-text-muted flex items-center justify-between">
                <span>Execution time:</span>
                <span className="font-semibold text-emerald-600">
                  {(executionStats.durationMs / 1000).toFixed(2)}s
                </span>
              </div>
            )}

            {status === 'failed' && (
              <button
                type="button"
                onClick={runRemoval}
                className="w-full mt-2 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Retry Processing</span>
              </button>
            )}
          </div>

          {/* Model Architecture Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FiCpu className="w-3.5 h-3.5 text-text-muted" /> Neural Model
              </span>
              <span className="text-[10px] font-mono text-text-muted">IS-Net</span>
            </label>
            <select
              value={model}
              disabled={isBusy}
              onChange={(e) => setModel(e.target.value as ModelType)}
              className="w-full py-1.5 px-2.5 rounded border border-border bg-surface text-xs text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              <option value="isnet_fp16">Balanced FP16 (~80MB, Recommended)</option>
              <option value="isnet_quint8">Fast Quantized INT8 (~40MB, Low Memory)</option>
              <option value="isnet">Full Precision FP32 (~160MB)</option>
            </select>
          </div>

          {/* Device Hardware Target */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main">
              Inference Hardware
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setDevice('gpu')}
                className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${
                  device === 'gpu'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                WebGPU / GPU
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setDevice('cpu')}
                className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${
                  device === 'cpu'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                CPU / WASM
              </button>
            </div>
          </div>

          {/* Output Format Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
              <FiLayers className="w-3.5 h-3.5 text-text-muted" /> Output Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setOutputMode('foreground')}
                className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${
                  outputMode === 'foreground'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                Cutout (PNG)
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => setOutputMode('mask')}
                className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${
                  outputMode === 'mask'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                Alpha Mask
              </button>
            </div>
          </div>

          {/* Re-run button if model or outputMode changed */}
          <div>
            <button
              type="button"
              disabled={isBusy}
              onClick={runRemoval}
              className="w-full py-2 px-3 rounded border border-border hover:bg-background text-xs font-medium text-text-main flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <FiPlay className="w-3 h-3" />
              <span>Re-process with Current Settings</span>
            </button>
          </div>

          {/* Preview Backdrop Selector */}
          <div className="space-y-1.5 pt-3 border-t border-border">
            <label className="text-xs font-semibold text-text-main">
              Preview Backdrop
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setBackdrop('checker')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${
                  backdrop === 'checker'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                Checker
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('dark')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${
                  backdrop === 'dark'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('light')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${
                  backdrop === 'light'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('custom')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${
                  backdrop === 'custom'
                    ? 'border-primary bg-primary-light text-primary font-semibold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                Solid Color
              </button>
            </div>

            {backdrop === 'custom' && (
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-7 h-7 rounded border border-border p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="flex-1 font-mono text-xs px-2 py-1 rounded border border-border bg-surface text-text-main uppercase"
                />
              </div>
            )}
          </div>

          {/* Download Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleDownload}
              disabled={!processedBlob || isBusy}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
            >
              <FiDownload className="w-4 h-4" />
              <span>
                {outputMode === 'mask' ? 'Download Alpha Mask PNG' : 'Download Transparent PNG'}
              </span>
            </button>

            {backdrop === 'custom' && outputMode === 'foreground' && (
              <button
                onClick={handleDownloadComposite}
                disabled={!processedBlob || isBusy}
                className="w-full py-2 px-4 border border-border hover:bg-background disabled:opacity-50 text-text-main rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Download Composite on {customBgColor}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono pt-1">
            <FiInfo className="w-3.5 h-3.5 shrink-0" />
            <span>Files processed locally. Never sent to any server.</span>
          </div>
        </div>

        {/* Right: Previews & Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 border border-border rounded p-0.5 bg-background text-xs">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'side-by-side'
                    ? 'bg-surface text-text-main shadow-none font-semibold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <FiColumns className="w-3.5 h-3.5" /> Side by Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('result-only')}
                className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'result-only'
                    ? 'bg-surface text-text-main shadow-none font-semibold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                <FiEye className="w-3.5 h-3.5" /> Result Isolated
              </button>
            </div>

            {isBusy && (
              <span className="text-xs font-mono text-primary flex items-center gap-1.5">
                <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{stageText || 'Processing...'}</span>
              </span>
            )}
          </div>

          <div className="border border-border bg-surface rounded-lg p-4">
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded">
                <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold">Background removal error</div>
                  <div className="mt-0.5">{errorMsg}</div>
                </div>
              </div>
            )}

            {viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Source */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span>Original Source</span>
                    <span>
                      {imageFile.width}×{imageFile.height}px ({formatBytes(imageFile.size)})
                    </span>
                  </div>
                  <div className="rounded border border-border h-72 sm:h-96 flex items-center justify-center p-2 bg-background overflow-hidden relative">
                    <img
                      src={imageFile.objectUrl}
                      alt="Original image source"
                      className="max-h-full max-w-full object-contain select-none"
                    />
                  </div>
                </div>

                {/* Segmented Result */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-text-muted">
                    <span className="text-primary font-semibold">
                      {outputMode === 'mask' ? 'Alpha Matte' : 'Cutout Output'}
                    </span>
                    <span>{processedBlob ? formatBytes(processedBlob.size) : '...'}</span>
                  </div>
                  <div
                    className="rounded border border-border h-72 sm:h-96 flex items-center justify-center p-2 overflow-hidden relative"
                    style={{
                      backgroundColor:
                        backdrop === 'dark'
                          ? '#171717'
                          : backdrop === 'light'
                          ? '#ffffff'
                          : backdrop === 'custom'
                          ? customBgColor
                          : undefined,
                    }}
                  >
                    {backdrop === 'checker' ? (
                      <Checkerboard className="w-full h-full flex items-center justify-center">
                        {processedUrl ? (
                          <img
                            src={processedUrl}
                            alt="Background removed cutout"
                            className="max-h-full max-w-full object-contain select-none"
                          />
                        ) : isBusy ? (
                          <div className="text-center p-4">
                            <div className="text-xs font-mono text-text-muted">
                              Segmenting foreground...
                            </div>
                          </div>
                        ) : null}
                      </Checkerboard>
                    ) : processedUrl ? (
                      <img
                        src={processedUrl}
                        alt="Background removed cutout"
                        className="max-h-full max-w-full object-contain select-none"
                      />
                    ) : isBusy ? (
                      <div className="text-center p-4">
                        <div className="text-xs font-mono text-text-muted">
                          Segmenting foreground...
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : (
              /* Isolated Result View */
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-text-muted">
                  <span>
                    {outputMode === 'mask' ? 'Alpha Matte Mask' : 'Transparent Cutout Output'}
                  </span>
                  <span>
                    {executionStats
                      ? `${executionStats.width}×${executionStats.height}px (${formatBytes(
                          executionStats.size
                        )})`
                      : `${imageFile.width}×${imageFile.height}px`}
                  </span>
                </div>
                <div
                  className="rounded border border-border h-96 sm:h-120 flex items-center justify-center p-4 overflow-hidden relative"
                  style={{
                    backgroundColor:
                      backdrop === 'dark'
                        ? '#171717'
                        : backdrop === 'light'
                        ? '#ffffff'
                        : backdrop === 'custom'
                        ? customBgColor
                        : undefined,
                  }}
                >
                  {backdrop === 'checker' ? (
                    <Checkerboard className="w-full h-full flex items-center justify-center">
                      {processedUrl ? (
                        <img
                          src={processedUrl}
                          alt="Background removed cutout"
                          className="max-h-full max-w-full object-contain select-none"
                        />
                      ) : isBusy ? (
                        <div className="text-center p-4">
                          <div className="text-xs font-mono text-text-muted">
                            Neural segmentation in progress...
                          </div>
                        </div>
                      ) : null}
                    </Checkerboard>
                  ) : processedUrl ? (
                    <img
                      src={processedUrl}
                      alt="Background removed cutout"
                      className="max-h-full max-w-full object-contain select-none"
                    />
                  ) : isBusy ? (
                    <div className="text-center p-4">
                      <div className="text-xs font-mono text-text-muted">
                        Neural segmentation in progress...
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
