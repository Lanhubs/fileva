import React from 'react';
import { FiFilm, FiTrash2 } from 'react-icons/fi';

interface VideoCompressorHeaderProps {
  hasFile: boolean;
  onReset: () => void;
}

export const VideoCompressorHeader: React.FC<VideoCompressorHeaderProps> = ({
  hasFile,
  onReset,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
      <div>
        <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
          <FiFilm className="text-primary" />
          Video Compressor
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Browser-side H.264 &amp; VP9 WebAssembly video compressor. All frames are processed locally without network uploads.
        </p>
      </div>

      {hasFile && (
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-border bg-surface hover:bg-background text-text-muted hover:text-rose-600 transition-colors cursor-pointer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
            Replace Video
          </button>
        </div>
      )}
    </div>
  );
};
