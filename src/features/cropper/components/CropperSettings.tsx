import React from 'react';
import { FiCrop, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { LuFlipHorizontal, LuFlipVertical } from 'react-icons/lu';
import { AspectRatioOption, SupportedFormat, CropArea } from '../../../types';

interface CropperSettingsProps {
  cropPixels: CropArea;
  aspectRatio: AspectRatioOption;
  onApplyAspectRatio: (ratio: AspectRatioOption) => void;
  flipH: boolean;
  onToggleFlipH: () => void;
  flipV: boolean;
  onToggleFlipV: () => void;
  format: SupportedFormat;
  onFormatChange: (format: SupportedFormat) => void;
  quality: number;
  onQualityChange: (quality: number) => void;
  isExporting: boolean;
  onExport: () => void;
  onClear: () => void;
}

const ASPECT_RATIO_OPTIONS: { id: AspectRatioOption; label: string }[] = [
  { id: 'free', label: 'Free' },
  { id: '1:1', label: '1:1' },
  { id: '16:9', label: '16:9' },
  { id: '4:3', label: '4:3' },
  { id: '3:2', label: '3:2' },
  { id: '2:3', label: '2:3' },
  { id: '9:16', label: '9:16' },
  { id: '21:9', label: '21:9' },
];

const EXPORT_FORMATS: { id: SupportedFormat; label: string }[] = [
  { id: 'image/png', label: 'PNG' },
  { id: 'image/jpeg', label: 'JPEG' },
  { id: 'image/webp', label: 'WebP' },
];

export const CropperSettings: React.FC<CropperSettingsProps> = ({
  cropPixels,
  aspectRatio,
  onApplyAspectRatio,
  flipH,
  onToggleFlipH,
  flipV,
  onToggleFlipV,
  format,
  onFormatChange,
  quality,
  onQualityChange,
  isExporting,
  onExport,
  onClear,
}) => {
  return (
    <div className="space-y-5 border border-border bg-surface rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
          <FiCrop className="w-4 h-4 text-primary" /> Crop Parameters
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FiRefreshCw className="w-3 h-3" /> Change
        </button>
      </div>

      {/* Output Dimensions Display */}
      <div className="p-3 rounded bg-background border border-border space-y-1">
        <div className="text-[11px] font-mono text-text-muted uppercase">Crop Dimensions</div>
        <div className="text-lg font-bold font-mono text-text-main">
          {cropPixels.width} × {cropPixels.height} px
        </div>
        <div className="text-[11px] font-mono text-text-muted">
          Origin: X {cropPixels.x}, Y {cropPixels.y}
        </div>
      </div>

      {/* Aspect Ratio Options */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-main">
          Aspect Ratio
        </label>
        <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
          {ASPECT_RATIO_OPTIONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onApplyAspectRatio(r.id)}
              className={`py-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                aspectRatio === r.id
                  ? 'border-primary bg-primary-light text-primary font-bold'
                  : 'border-border text-text-main hover:bg-background'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transform Controls (Flips) */}
      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-semibold text-text-main">
          Transformations
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={onToggleFlipH}
            className={`py-1.5 px-3 rounded border font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              flipH
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            <LuFlipHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>Flip Horizontal</span>
          </button>

          <button
            type="button"
            onClick={onToggleFlipV}
            className={`py-1.5 px-3 rounded border font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              flipV
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            <LuFlipVertical className="w-3.5 h-3.5 text-primary" />
            <span>Flip Vertical</span>
          </button>
        </div>
      </div>

      {/* Export Format & Quality */}
      <div className="space-y-3 pt-2 border-t border-border">
        <label className="text-xs font-semibold text-text-main">
          Export Format
        </label>
        <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFormatChange(f.id)}
              className={`py-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                format === f.id
                  ? 'border-primary bg-primary-light text-primary font-bold'
                  : 'border-border text-text-main hover:bg-background'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {format !== 'image/png' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted">Export Quality:</span>
              <span className="font-bold text-text-main">
                {Math.round(quality * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round(quality * 100)}
              onChange={(e) => onQualityChange(Number(e.target.value) / 100)}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Download Button */}
      <div className="pt-2">
        <button
          onClick={onExport}
          disabled={isExporting}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
        >
          <FiDownload className="w-4 h-4" />
          <span>{isExporting ? 'Cropping Canvas...' : 'Download Cropped Image'}</span>
        </button>
      </div>
    </div>
  );
};
