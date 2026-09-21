import React from 'react';
import { FiColumns, FiEye, FiAlertCircle } from 'react-icons/fi';
import { ImageFileState, CompressionResult } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';
import { Checkerboard } from '../../../components/common/Checkerboard';
import { ImageViewMode, ImageToggleTarget } from '../hooks/useImageCompressor';

interface ImageViewerComparisonProps {
  imageFile: ImageFileState;
  result: CompressionResult | null;
  viewMode: ImageViewMode;
  onViewModeChange: (mode: ImageViewMode) => void;
  toggleActive: ImageToggleTarget;
  onToggleActiveChange: (target: ImageToggleTarget) => void;
  isProcessing: boolean;
  errorMsg: string | null;
}

export const ImageViewerComparison: React.FC<ImageViewerComparisonProps> = ({
  imageFile,
  result,
  viewMode,
  onViewModeChange,
  toggleActive,
  onToggleActiveChange,
  isProcessing,
  errorMsg,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 border border-border rounded p-0.5 bg-background text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('side-by-side')}
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
            onClick={() => onViewModeChange('toggle')}
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

      <div className="border border-border bg-surface rounded-lg p-4 overflow-hidden">
        {errorMsg && (
          <div className="mb-3 flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded">
            <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-text-muted">
                <span>Original Source</span>
                <span>{formatBytes(imageFile.size)}</span>
              </div>
              <Checkerboard className="rounded border border-border h-64 sm:h-80 flex items-center justify-center p-2">
                <img
                  src={imageFile.objectUrl}
                  alt="Original"
                  className="max-h-full max-w-full object-contain"
                />
              </Checkerboard>
            </div>

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
                    alt="Compressed"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-xs font-mono text-text-muted">Processing compression...</div>
                )}
              </Checkerboard>
            </div>
          </div>
        ) : (
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
                  onClick={() => onToggleActiveChange('original')}
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
                  onClick={() => onToggleActiveChange('compressed')}
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
  );
};
