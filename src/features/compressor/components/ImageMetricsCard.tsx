import React from 'react';
import { CompressionResult, SupportedFormat } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';

interface ImageMetricsCardProps {
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  result: CompressionResult | null;
  format: SupportedFormat;
}

export const ImageMetricsCard: React.FC<ImageMetricsCardProps> = ({
  originalSize,
  originalWidth,
  originalHeight,
  result,
  format,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border border-border bg-surface rounded-lg p-4">
      <div>
        <div className="text-[11px] font-mono text-text-muted uppercase">Original</div>
        <div className="text-base font-bold font-mono text-text-main">
          {formatBytes(originalSize)}
        </div>
        <div className="text-[10px] text-text-muted font-mono">
          {originalWidth}×{originalHeight}px
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
          {format.replace('image/', '')}
        </div>
        <div className="text-[10px] text-text-muted">
          {format === 'image/png' ? 'Lossless' : 'Lossy encoded'}
        </div>
      </div>
    </div>
  );
};
