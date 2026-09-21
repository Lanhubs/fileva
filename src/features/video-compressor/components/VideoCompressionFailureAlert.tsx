import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { VideoFormat, VideoResolutionPreset } from '../../../types';
import { CompressionFailureInfo } from '../hooks/useVideoCompressor';

interface VideoCompressionFailureAlertProps {
  failureInfo: CompressionFailureInfo | null;
  stageMessage: string;
  format: VideoFormat;
  resolution: VideoResolutionPreset;
  onSwitchFormat: (format: VideoFormat) => void;
  onSwitchResolution: (resolution: VideoResolutionPreset) => void;
  onRetry: () => void;
}

export const VideoCompressionFailureAlert: React.FC<VideoCompressionFailureAlertProps> = ({
  failureInfo,
  stageMessage,
  format,
  resolution,
  onSwitchFormat,
  onSwitchResolution,
  onRetry,
}) => {
  return (
    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2.5">
      <div className="flex items-start gap-2.5">
        <FiAlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <strong className="block font-bold text-rose-950 text-xs">Compression Failed</strong>
            <span className="text-[11px] text-rose-700">The video encoder was unable to complete the job.</span>
          </div>

          <div className="p-2.5 bg-white/90 border border-rose-200 rounded text-xs space-y-1">
            <span className="font-bold text-rose-900 block text-[11px] uppercase tracking-wider">
              Reason for Failure:
            </span>
            <p className="text-rose-950 text-xs font-medium leading-relaxed wrap-break-word">
              {failureInfo?.reason || stageMessage || 'Encoding pipeline encountered an error.'}
            </p>
          </div>

          {failureInfo?.suggestion && (
            <div className="text-xs text-rose-900 bg-rose-100/60 p-2 rounded border border-rose-200/70">
              <span className="font-semibold text-rose-950">Recommended Solution: </span>
              <span>{failureInfo.suggestion}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {format === 'webm' && (
              <button
                type="button"
                onClick={() => onSwitchFormat('mp4')}
                className="px-2 py-1 text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer transition-colors shadow-none"
              >
                Switch to MP4 &amp; Retry
              </button>
            )}
            {resolution === 'original' && (
              <button
                type="button"
                onClick={() => onSwitchResolution('720p')}
                className="px-2 py-1 text-[11px] font-semibold bg-white border border-rose-300 hover:bg-rose-50 text-rose-900 rounded cursor-pointer transition-colors"
              >
                Downscale to 720p &amp; Retry
              </button>
            )}
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-white border border-rose-300 hover:bg-rose-50 text-rose-900 rounded cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>

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
  );
};
