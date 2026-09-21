import React from 'react';
import {
  FiSliders,
  FiRefreshCw,
  FiArchive,
  FiGlobe,
  FiCode,
} from 'react-icons/fi';
import { IconGenerationConfig } from '../icon-engine';
import { IconPreviewShape } from '../hooks/useAppIconGenerator';

interface IconGeneratorSettingsProps {
  config: IconGenerationConfig;
  onUpdateConfig: React.Dispatch<React.SetStateAction<IconGenerationConfig>>;
  previewShape: IconPreviewShape;
  onPreviewShapeChange: (shape: IconPreviewShape) => void;
  isPackagingZip: boolean;
  showCodeSnippet: boolean;
  onToggleCodeSnippet: () => void;
  onDownloadZip: () => void;
  onDownloadIco: () => void;
  onClear: () => void;
}

const PREVIEW_SHAPES: { id: IconPreviewShape; label: string }[] = [
  { id: 'ios', label: 'iOS' },
  { id: 'squircle', label: 'Android' },
  { id: 'circle', label: 'Circle' },
  { id: 'square', label: 'Square' },
];

export const IconGeneratorSettings: React.FC<IconGeneratorSettingsProps> = ({
  config,
  onUpdateConfig,
  previewShape,
  onPreviewShapeChange,
  isPackagingZip,
  showCodeSnippet,
  onToggleCodeSnippet,
  onDownloadZip,
  onDownloadIco,
  onClear,
}) => {
  return (
    <div className="space-y-5 border border-border bg-surface rounded-lg p-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
          <FiSliders className="w-4 h-4 text-primary" /> Icon Parameters
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FiRefreshCw className="w-3 h-3" /> Change
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-main flex justify-between">
          <span>Background Color</span>
          <span className="font-mono text-text-muted">{config.backgroundColor}</span>
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateConfig((c) => ({ ...c, backgroundColor: 'transparent' }))}
            className={`flex-1 py-1.5 px-2 rounded border text-xs font-medium transition-colors cursor-pointer ${
              config.backgroundColor === 'transparent'
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            Transparent
          </button>
          <button
            type="button"
            onClick={() => onUpdateConfig((c) => ({ ...c, backgroundColor: '#ffffff' }))}
            className={`flex-1 py-1.5 px-2 rounded border text-xs font-medium transition-colors cursor-pointer ${
              config.backgroundColor === '#ffffff'
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            White
          </button>
          <button
            type="button"
            onClick={() => onUpdateConfig((c) => ({ ...c, backgroundColor: '#1A1817' }))}
            className={`flex-1 py-1.5 px-2 rounded border text-xs font-medium transition-colors cursor-pointer ${
              config.backgroundColor === '#1A1817' || config.backgroundColor === '#0f172a'
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            Dark
          </button>
        </div>
        {config.backgroundColor !== 'transparent' && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="color"
              value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
              onChange={(e) => onUpdateConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
              className="w-8 h-8 rounded border border-border cursor-pointer p-0"
            />
            <input
              type="text"
              value={config.backgroundColor}
              onChange={(e) => onUpdateConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
              className="flex-1 px-2.5 py-1 text-xs font-mono border border-border rounded bg-surface text-text-main focus:outline-hidden focus:border-primary"
              placeholder="#ffffff"
            />
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-text-muted">Safe Padding:</span>
          <span className="font-bold text-text-main">{config.paddingPercent}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="40"
          value={config.paddingPercent}
          onChange={(e) =>
            onUpdateConfig((c) => ({ ...c, paddingPercent: Number(e.target.value) }))
          }
          className="w-full accent-primary cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-muted font-mono">
          <span>Full Bleed (0%)</span>
          <span>Recommended (12%)</span>
          <span>Generous (40%)</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-main">
          Logo Fit Mode
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onUpdateConfig((c) => ({ ...c, fitMode: 'contain' }))}
            className={`py-1.5 px-3 rounded border font-medium text-center transition-colors cursor-pointer ${
              config.fitMode === 'contain'
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            Contain (Aspect Ratio)
          </button>
          <button
            type="button"
            onClick={() => onUpdateConfig((c) => ({ ...c, fitMode: 'cover' }))}
            className={`py-1.5 px-3 rounded border font-medium text-center transition-colors cursor-pointer ${
              config.fitMode === 'cover'
                ? 'border-primary bg-primary-light text-primary font-bold'
                : 'border-border text-text-main hover:bg-background'
            }`}
          >
            Cover (Fill Bounds)
          </button>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <label className="text-xs font-semibold text-text-main">
          Preview Frame Shape
        </label>
        <div className="grid grid-cols-4 gap-1 text-xs">
          {PREVIEW_SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onPreviewShapeChange(s.id)}
              className={`py-1 rounded border text-center text-[11px] font-medium transition-colors cursor-pointer ${
                previewShape === s.id
                  ? 'border-primary bg-primary-light text-primary font-bold'
                  : 'border-border text-text-muted hover:text-text-main hover:bg-background'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-3 border-t border-border">
        <button
          onClick={onDownloadZip}
          disabled={isPackagingZip}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
        >
          <FiArchive className="w-4 h-4" />
          <span>{isPackagingZip ? 'Packaging In-Memory ZIP...' : 'Download Complete Package (.ZIP)'}</span>
        </button>

        <button
          onClick={onDownloadIco}
          className="w-full py-2 px-3 bg-surface hover:bg-background text-text-main rounded font-medium text-xs flex items-center justify-center gap-2 border border-border transition-colors cursor-pointer"
        >
          <FiGlobe className="w-3.5 h-3.5 text-primary" />
          <span>Download Multi-Resolution favicon.ico</span>
        </button>

        <button
          onClick={onToggleCodeSnippet}
          className="w-full py-1.5 px-3 text-text-muted hover:text-text-main rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <FiCode className="w-3.5 h-3.5" />
          <span>{showCodeSnippet ? 'Hide PWA & HTML Tags' : 'View PWA & HTML Code'}</span>
        </button>
      </div>
    </div>
  );
};
