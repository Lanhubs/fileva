import React, { useRef } from 'react';
import { FiVideo, FiZap, FiAlertTriangle } from 'react-icons/fi';

interface VideoDropZoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (type: 'motion' | 'compact') => void;
  isGeneratingSample: boolean;
  inspectError: string | null;
}

export const VideoDropZone: React.FC<VideoDropZoneProps> = ({
  onFileSelect,
  onSampleSelect,
  isGeneratingSample,
  inspectError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border hover:border-primary rounded-lg p-8 sm:p-12 text-center cursor-pointer transition-colors bg-surface"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-matroska,.mp4,.webm,.mov"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileSelect(e.target.files[0]);
              e.target.value = '';
            }
          }}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-primary-light rounded-full text-primary">
            <FiVideo className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-main">
              Drop your video here, or <span className="text-primary underline">browse</span>
            </p>
            <p className="text-xs text-text-muted mt-1">
              Supports MP4 (H.264), WebM (VP8/VP9), and MOV. Processed entirely on your CPU/GPU.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-background border border-border rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-text-main flex items-center gap-1.5">
              <FiZap className="w-3.5 h-3.5 text-amber-500" />
              Quick Test Benchmarks
            </span>
            <p className="text-xs text-text-muted">
              Don't have a video on hand? Generate a local procedural test video directly from canvas:
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isGeneratingSample}
              onClick={() => onSampleSelect('motion')}
              className="px-3 py-1.5 text-xs font-medium rounded bg-surface border border-border text-text-main hover:bg-background disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isGeneratingSample ? 'Rendering...' : '720p Motion (3s)'}
            </button>
            <button
              type="button"
              disabled={isGeneratingSample}
              onClick={() => onSampleSelect('compact')}
              className="px-3 py-1.5 text-xs font-medium rounded bg-surface border border-border text-text-main hover:bg-background disabled:opacity-50 cursor-pointer transition-colors"
            >
              {isGeneratingSample ? 'Rendering...' : '360p Compact (3s)'}
            </button>
          </div>
        </div>
      </div>

      {inspectError && (
        <div className="p-3 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
          <FiAlertTriangle className="shrink-0" />
          <span>{inspectError}</span>
        </div>
      )}
    </div>
  );
};
