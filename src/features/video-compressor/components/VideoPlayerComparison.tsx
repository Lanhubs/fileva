import React from 'react';
import { FiAlertTriangle, FiFilm } from 'react-icons/fi';
import { VideoFileState, VideoCompressionResult } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';
import { VideoProgressInfo } from '../video-engine';
import { CompressionFailureInfo, VideoPreviewTab } from '../hooks/useVideoCompressor';

interface VideoPlayerComparisonProps {
  videoFile: VideoFileState;
  result: VideoCompressionResult | null;
  status: VideoProgressInfo['status'];
  stageMessage: string;
  failureInfo: CompressionFailureInfo | null;
  activeTab: VideoPreviewTab;
  onTabChange: (tab: VideoPreviewTab) => void;
}

export const VideoPlayerComparison: React.FC<VideoPlayerComparisonProps> = ({
  videoFile,
  result,
  status,
  stageMessage,
  failureInfo,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="p-5 bg-surface border border-border rounded-lg space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => onTabChange('comparison')}
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
              onClick={() => onTabChange('preview-compressed')}
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
            onClick={() => onTabChange('preview-original')}
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

      {activeTab === 'comparison' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};
