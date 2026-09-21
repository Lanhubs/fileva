import React from 'react';
import { FiSliders, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { CompressionSettings, SupportedFormat } from '../../../types';
import { BrowserCapabilities } from '../../../lib/browser-support';

interface ImageCompressorSettingsProps {
  settings: CompressionSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<CompressionSettings>>;
  capabilities: BrowserCapabilities;
  isProcessing: boolean;
  hasResult: boolean;
  onDownload: () => void;
  onClear: () => void;
}

const TARGET_SIZE_PRESETS = [100, 250, 500, 1000];

const DOWNSCALE_PRESETS = [
  { label: 'FHD 1080p', w: 1920, h: 1080 },
  { label: 'HD 720p', w: 1280, h: 720 },
  { label: 'Small 480p', w: 800, h: 600 },
];

export const ImageCompressorSettings: React.FC<ImageCompressorSettingsProps> = ({
  settings,
  onUpdateSettings,
  capabilities,
  isProcessing,
  hasResult,
  onDownload,
  onClear,
}) => {
  return (
    <div className="space-y-5 border border-border bg-surface rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
          <FiSliders className="w-4 h-4 text-primary" /> Compression Config
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FiRefreshCw className="w-3 h-3" /> Change Image
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-main">
          Output Format
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onUpdateSettings((s) => ({ ...s, format: 'image/webp' }))}
            className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
              settings.format === 'image/webp'
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border hover:bg-background text-text-main'
            }`}
          >
            WebP <span className="text-[10px] text-text-muted block font-sans">Modern efficient</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateSettings((s) => ({ ...s, format: 'image/jpeg' }))}
            className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
              settings.format === 'image/jpeg'
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border hover:bg-background text-text-main'
            }`}
          >
            JPEG <span className="text-[10px] text-text-muted block font-sans">Universal compatibility</span>
          </button>

          <button
            type="button"
            onClick={() => onUpdateSettings((s) => ({ ...s, format: 'image/png' }))}
            className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
              settings.format === 'image/png'
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border hover:bg-background text-text-main'
            }`}
          >
            PNG <span className="text-[10px] text-text-muted block font-sans">Lossless alpha</span>
          </button>

          <button
            type="button"
            disabled={!capabilities.supportsAVIF}
            onClick={() => onUpdateSettings((s) => ({ ...s, format: 'image/avif' }))}
            className={`p-2 rounded border text-left font-mono font-medium transition-colors cursor-pointer ${
              !capabilities.supportsAVIF
                ? 'opacity-40 cursor-not-allowed border-border text-text-muted'
                : settings.format === 'image/avif'
                ? 'border-primary bg-primary-light text-primary'
                : 'border-border hover:bg-background text-text-main'
            }`}
          >
            AVIF <span className="text-[10px] text-text-muted block font-sans">{capabilities.supportsAVIF ? 'Next-gen compact' : 'Unsupported'}</span>
          </button>
        </div>
      </div>

      {settings.format !== 'image/png' && (
        <div className="space-y-3">
          <div className="flex border border-border rounded p-0.5 bg-background text-xs">
            <button
              type="button"
              onClick={() => onUpdateSettings((s) => ({ ...s, mode: 'quality' }))}
              className={`flex-1 py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                settings.mode === 'quality'
                  ? 'bg-surface text-text-main shadow-none font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Quality Slider
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings((s) => ({ ...s, mode: 'target-size' }))}
              className={`flex-1 py-1.5 px-2 rounded font-medium transition-colors cursor-pointer ${
                settings.mode === 'target-size'
                  ? 'bg-surface text-text-main shadow-none font-bold'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Target File Size
            </button>
          </div>

          {settings.mode === 'quality' ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-text-muted">Quality:</span>
                <span className="font-bold text-text-main">
                  {Math.round(settings.quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={Math.round(settings.quality * 100)}
                onChange={(e) =>
                  onUpdateSettings((s) => ({ ...s, quality: Number(e.target.value) / 100 }))
                }
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-text-muted font-mono">
                <span>Smallest (5%)</span>
                <span>Standard (80%)</span>
                <span>Max (100%)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-main flex justify-between">
                <span>Target Size (KB)</span>
                <span className="font-mono text-text-muted">{settings.targetSizeKb} KB</span>
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                step="10"
                value={settings.targetSizeKb || 250}
                onChange={(e) =>
                  onUpdateSettings((s) => ({ ...s, targetSizeKb: Math.max(10, Number(e.target.value)) }))
                }
                className="w-full px-3 py-1.5 text-xs font-mono border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <div className="flex gap-1.5 flex-wrap">
                {TARGET_SIZE_PRESETS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onUpdateSettings((s) => ({ ...s, targetSizeKb: size }))}
                    className="text-[11px] font-mono px-2 py-0.5 rounded border border-border hover:bg-background text-text-muted hover:text-text-main cursor-pointer"
                  >
                    {size >= 1000 ? `${size / 1000}MB` : `${size}KB`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-2 pt-3 border-t border-border">
        <label className="flex items-center gap-2 text-xs font-semibold text-text-main cursor-pointer">
          <input
            type="checkbox"
            checked={settings.resize.enabled}
            onChange={(e) =>
              onUpdateSettings((s) => ({
                ...s,
                resize: { ...s.resize, enabled: e.target.checked },
              }))
            }
            className="rounded accent-primary text-primary focus:ring-primary"
          />
          <span>Downscale Max Dimensions</span>
        </label>

        {settings.resize.enabled && (
          <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
            {DOWNSCALE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() =>
                  onUpdateSettings((s) => ({
                    ...s,
                    resize: { enabled: true, maxWidth: preset.w, maxHeight: preset.h },
                  }))
                }
                className={`p-1.5 rounded border text-center text-[11px] cursor-pointer ${
                  settings.resize.maxWidth === preset.w
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          onClick={onDownload}
          disabled={!hasResult || isProcessing}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
        >
          <FiDownload className="w-4 h-4" />
          <span>Download Compressed Image</span>
        </button>
      </div>
    </div>
  );
};
