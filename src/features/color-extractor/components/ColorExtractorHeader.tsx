import React from 'react';
import { FiCrosshair, FiCode, FiDownload, FiRefreshCw } from 'react-icons/fi';

interface ColorExtractorHeaderProps {
  maxColorCount: number;
  setMaxColorCount: (count: number) => void;
  supportsEyeDropper: boolean;
  onNativeEyeDropper: () => void;
  showExportModal: boolean;
  onToggleExportModal: () => void;
  onDownloadPaletteImage: () => void;
  onClear: () => void;
}

export const ColorExtractorHeader: React.FC<ColorExtractorHeaderProps> = ({
  maxColorCount,
  setMaxColorCount,
  supportsEyeDropper,
  onNativeEyeDropper,
  showExportModal,
  onToggleExportModal,
  onDownloadPaletteImage,
  onClear,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface rounded-lg p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-text-muted">Palette Size:</span>
          <div className="flex border border-border rounded p-0.5 bg-background">
            {[5, 8, 12].map((num) => (
              <button
                key={num}
                onClick={() => setMaxColorCount(num)}
                className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                  maxColorCount === num
                    ? 'bg-surface text-text-main shadow-none font-bold'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {num} Colors
              </button>
            ))}
          </div>
        </div>

        {supportsEyeDropper && (
          <button
            onClick={onNativeEyeDropper}
            className="py-1.5 px-3 rounded border border-border hover:bg-background text-xs font-medium text-text-main flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FiCrosshair className="w-3.5 h-3.5 text-primary" />
            <span>Desktop EyeDropper</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleExportModal}
          className={`py-1.5 px-3 rounded text-xs font-medium flex items-center gap-1.5 border transition-colors cursor-pointer ${
            showExportModal
              ? 'bg-primary text-white border-primary'
              : 'bg-surface hover:bg-background text-text-main border-border'
          }`}
        >
          <FiCode className="w-3.5 h-3.5 text-primary" />
          <span>Export Code</span>
        </button>

        <button
          onClick={onDownloadPaletteImage}
          className="py-1.5 px-3 bg-primary hover:bg-primary-hover text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
        >
          <FiDownload className="w-3.5 h-3.5" />
          <span>Download PNG Swatch</span>
        </button>

        <button
          onClick={onClear}
          className="p-1.5 text-text-muted hover:text-rose-600 cursor-pointer transition-colors"
          title="Change image"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
