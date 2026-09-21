import React from 'react';
import { FiFileText } from 'react-icons/fi';
import { AudioFileState } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';
import { formatDuration } from '../../../lib/media-utils';

interface AudioMetadataCardProps {
  audioFile: AudioFileState;
}

export const AudioMetadataCard: React.FC<AudioMetadataCardProps> = ({ audioFile }) => {
  return (
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
  );
};
