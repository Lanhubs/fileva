import React from 'react';
import { FiCheckCircle, FiDownload } from 'react-icons/fi';
import { AudioCompressionResult } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';
import { formatBitrate } from '../../../lib/media-utils';

interface AudioCompressionResultCardProps {
  result: AudioCompressionResult;
  originalSize: number;
  onDownload: () => void;
}

export const AudioCompressionResultCard: React.FC<AudioCompressionResultCardProps> = ({
  result,
  originalSize,
  onDownload,
}) => {
  return (
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
          onClick={onDownload}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded shadow-none transition-colors cursor-pointer"
        >
          <FiDownload className="w-3.5 h-3.5" />
          Download Audio ({formatBytes(result.size)})
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-background rounded border border-border text-center">
          <span className="text-[11px] text-text-muted block">Original</span>
          <span className="text-sm font-mono font-bold text-text-main">
            {formatBytes(originalSize)}
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
  );
};
