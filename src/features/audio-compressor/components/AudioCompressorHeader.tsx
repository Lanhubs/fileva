import React from 'react';
import { FiVolume2, FiTrash2 } from 'react-icons/fi';

interface AudioCompressorHeaderProps {
  hasFile: boolean;
  onReset: () => void;
}

export const AudioCompressorHeader: React.FC<AudioCompressorHeaderProps> = ({
  hasFile,
  onReset,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
          <FiVolume2 className="text-primary" />
          Audio Compressor
        </h2>
        <p className="text-xs text-text-muted mt-1">
          In-browser MP3, AAC, and Opus audio encoder. Resample rates, downmix to mono, or apply perceptual psychoacoustic compression.
        </p>
      </div>

      {hasFile && (
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface hover:bg-background text-text-muted hover:text-rose-600 transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Replace Audio
          </button>
        </div>
      )}
    </div>
  );
};
