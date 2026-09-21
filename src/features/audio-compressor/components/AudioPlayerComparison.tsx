import React from 'react';
import { FiRadio, FiCheckCircle } from 'react-icons/fi';
import { AudioFileState, AudioCompressionResult } from '../../../types';
import { formatBytes } from '../../../lib/file-utils';
import { formatDuration } from '../../../lib/media-utils';

interface AudioPlayerComparisonProps {
  audioFile: AudioFileState;
  result: AudioCompressionResult | null;
}

export const AudioPlayerComparison: React.FC<AudioPlayerComparisonProps> = ({
  audioFile,
  result,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-main flex items-center gap-1.5">
            <FiRadio className="text-primary" />
            Original Audio Stream
          </span>
          <span className="font-mono text-text-muted">
            {formatBytes(audioFile.size)} • {formatDuration(audioFile.duration)}
          </span>
        </div>
        <audio
          src={audioFile.objectUrl}
          controls
          className="w-full h-10"
        />
      </div>

      <div className="p-5 bg-surface border border-border rounded-lg space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text-main flex items-center gap-1.5">
            <FiCheckCircle className="text-emerald-600" />
            Compressed Output Stream
          </span>
          <span className="font-mono text-emerald-600">
            {result ? `${formatBytes(result.size)} • ${formatDuration(result.duration)}` : 'Awaiting compression'}
          </span>
        </div>
        {result ? (
          <audio
            src={result.objectUrl}
            controls
            className="w-full h-10"
          />
        ) : (
          <div className="p-6 text-center text-text-muted text-xs border border-dashed border-border rounded">
            Click "Compress Audio Locally" on the left to generate the compressed track.
          </div>
        )}
      </div>
    </div>
  );
};
