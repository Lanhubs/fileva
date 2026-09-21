import React from 'react';
import { FiFileText } from 'react-icons/fi';
import { VideoFileState } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';
import { formatDuration, formatBitrate } from '../../../lib/media-utils';

interface VideoMetadataCardProps {
  videoFile: VideoFileState;
}

export const VideoMetadataCard: React.FC<VideoMetadataCardProps> = ({ videoFile }) => {
  return (
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
  );
};
