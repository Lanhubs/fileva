import React from 'react';
import { FiSliders } from 'react-icons/fi';
import { CanvasDimensions, DesignStudioMode } from '../types';
import { CANVAS_PRESET_GROUPS } from '../presets';

interface StudioTopBarLeftProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  dimensions: CanvasDimensions;
  onChangeDimensions: (dimensions: CanvasDimensions) => void;
  mode: DesignStudioMode;
  onChangeMode: (mode: DesignStudioMode) => void;
}

export const StudioTopBarLeft: React.FC<StudioTopBarLeftProps> = ({
  projectName,
  onUpdateProjectName,
  dimensions,
  onChangeDimensions,
  mode,
  onChangeMode,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
      <div className="flex bg-background p-0.5 border border-border rounded text-[11px] sm:text-xs">
        <button
          onClick={() => onChangeMode('screenshots')}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-medium cursor-pointer transition-colors ${
            mode === 'screenshots'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="App Store Screenshots Mode"
        >
          <span className="hidden xl:inline">Screenshots</span>
          <span className="xl:hidden">Screens</span>
        </button>
        <button
          onClick={() => onChangeMode('banners')}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-medium cursor-pointer transition-colors ${
            mode === 'banners'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Feature Graphic & Banners"
        >
          Banners
        </button>
        <button
          onClick={() => onChangeMode('promo')}
          className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded font-medium cursor-pointer transition-colors ${
            mode === 'promo'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Promo Tiles & Ads"
        >
          Promo
        </button>
      </div>

      <input
        type="text"
        value={projectName}
        onChange={(e) => onUpdateProjectName(e.target.value)}
        className="font-semibold text-text-main bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-1.5 sm:px-2 py-0.5 sm:py-1 w-20 sm:w-28 md:w-32 lg:w-40 text-xs truncate"
        placeholder="Project Title"
      />

      <div className="flex items-center gap-1 sm:gap-1.5 border-l border-border pl-1.5 sm:pl-2.5">
        <FiSliders className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted shrink-0" />
        <select
          value={`${dimensions.width}x${dimensions.height}`}
          onChange={(e) => {
            const [w, h] = e.target.value.split('x').map(Number);
            const found = CANVAS_PRESET_GROUPS.flatMap((g) => g.presets).find(
              (p) => p.width === w && p.height === h
            );
            if (found) onChangeDimensions(found);
          }}
          className="bg-background border border-border rounded px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] text-text-main cursor-pointer w-24 sm:w-32 md:w-36 lg:w-44 truncate"
        >
          {CANVAS_PRESET_GROUPS.map((group) => (
            <optgroup key={group.id} label={group.name}>
              {group.presets.map((preset) => (
                <option
                  key={`${preset.width}x${preset.height}-${preset.label}`}
                  value={`${preset.width}x${preset.height}`}
                >
                  {preset.label} ({preset.width}×{preset.height})
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  );
};
