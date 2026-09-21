import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { IconPreset } from '../../../types';
import { IconCategory } from '../hooks/useAppIconGenerator';

interface IconPresetsTableProps {
  filteredPresets: IconPreset[];
  activeCategory: IconCategory;
  onCategoryChange: (category: IconCategory) => void;
  onDownloadSinglePreset: (preset: IconPreset) => void;
}

const CATEGORIES: IconCategory[] = ['all', 'android', 'ios', 'web', 'pwa', 'desktop'];

export const IconPresetsTable: React.FC<IconPresetsTableProps> = ({
  filteredPresets,
  activeCategory,
  onCategoryChange,
  onDownloadSinglePreset,
}) => {
  return (
    <div className="border border-border bg-surface rounded-lg p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border mb-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-text-main">
          Target Platform Presets ({filteredPresets.length})
        </h4>

        <div className="flex flex-wrap gap-1 text-xs font-mono">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-2 py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-white font-bold'
                  : 'bg-background text-text-muted hover:text-text-main border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-border text-xs">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="py-2.5 flex items-center justify-between hover:bg-background px-2 rounded transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-text-muted w-20 shrink-0">
                {preset.width}×{preset.height}
              </span>
              <div>
                <div className="font-medium text-text-main flex items-center gap-2">
                  <span>{preset.name}</span>
                  {preset.maskable && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      maskable
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-text-muted font-mono">
                  {preset.filename} • {preset.description}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDownloadSinglePreset(preset)}
              className="p-1.5 rounded hover:bg-background text-text-muted hover:text-text-main transition-colors cursor-pointer"
              title={`Download ${preset.filename}`}
              aria-label={`Download ${preset.filename}`}
            >
              <FiDownload className="w-4 h-4 text-primary" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
