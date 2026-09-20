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
import TestSamples from './components/test-samples';
import DownloadActionButtons from './components/dowload-action-buttons';
import PreviewBackdropSelector from './components/PreviewBackdropSelector';
import ProgressIndicatorSection from './components/progressIndicatorSection';
import IsolatedResultView from './components/IsolatedResultView';
import SegmentedResult from './components/SegmentedResult';
import LeftConfigurationPanel from './components/LeftConfigurationPanel';

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

          </div>

          <DropZone onFileSelected={onFileSelect} acceptText="PNG, JPEG, WebP, AVIF, BMP" />
          <TestSamples isSampleLoading={isSampleLoading} loadSample={loadSample} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration Panel */}
      
        <LeftConfigurationPanel 
        backdrop={backdrop} 
        bytesInfo={bytesInfo} 
        customBgColor={customBgColor} 
        device={device} 
        executionStats={executionStats}
        formatBytes={formatBytes}
        handleDownload={handleDownload}
        handleDownloadComposite={handleDownloadComposite}
        isBusy
        model={model}
        onClear={onClear}
        outputMode={outputMode}
        setBackdrop={setBackdrop}
        progressPercent={progressPercent}
        runRemoval={runRemoval}
        setCustomBgColor={setCustomBgColor}
        setDevice={setDevice}
        setModel={setModel}
        setOutputMode={setOutputMode}
        stageText={stageText}
        
        />
        {/* Right: Previews & Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 border border-border rounded p-0.5 bg-background text-xs">
              <button
                type="button"
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${viewMode === 'side-by-side'
                  ? 'bg-surface text-text-main shadow-none font-semibold'
                  : 'text-text-muted hover:text-text-main'
                  }`}
              >
                <FiColumns className="w-3.5 h-3.5" /> Side by Side
              </button>
              <button
                type="button"
                onClick={() => setViewMode('result-only')}
                className={`px-3 py-1 rounded font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${viewMode === 'result-only'
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


                <SegmentedResult
                  backdrop={backdrop}
                  customBgColor={customBgColor}
                  isBusy
                  outputMode={outputMode}
                  processedBlob={processedBlob}
                  processedUrl={processedUrl}

                />
              </div>
            ) : (
              /* Isolated Result View */
              <IsolatedResultView
                backdrop={backdrop}
                customBgColor={customBgColor}
                executionStats={executionStats}
                formatBytes={formatBytes}
                imageFile={imageFile}
                isBusy={isBusy}
                outputMode={outputMode}
                processedUrl={processedUrl}

              />

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

