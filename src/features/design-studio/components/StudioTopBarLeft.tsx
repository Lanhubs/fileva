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
    <div className="flex items-center gap-3 shrink-0">
      <div className="flex bg-background p-0.5 border border-border rounded">
        <button
          onClick={() => onChangeMode('screenshots')}
          className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
            mode === 'screenshots'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Screenshots
        </button>
        <button
          onClick={() => onChangeMode('banners')}
          className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
            mode === 'banners'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Banners
        </button>
        <button
          onClick={() => onChangeMode('promo')}
          className={`px-2.5 py-1 rounded font-medium cursor-pointer transition-colors ${
            mode === 'promo'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
        >
          Promo
        </button>
      </div>

      <input
        type="text"
        value={projectName}
        onChange={(e) => onUpdateProjectName(e.target.value)}
        className="font-semibold text-text-main bg-transparent border border-transparent hover:border-border focus:border-primary rounded px-2 py-1 max-w-40 sm:max-w-56"
        placeholder="Project Title"
      />

      <div className="flex items-center gap-1.5 border-l border-border pl-3">
        <FiSliders className="w-3.5 h-3.5 text-text-muted shrink-0" />
        <select
          value={`${dimensions.width}x${dimensions.height}`}
          onChange={(e) => {
            const [w, h] = e.target.value.split('x').map(Number);
            const found = CANVAS_PRESET_GROUPS.flatMap((g) => g.presets).find(
              (p) => p.width === w && p.height === h
            );
            if (found) onChangeDimensions(found);
          }}
          className="bg-background border border-border rounded px-2 py-1 text-[11px] text-text-main cursor-pointer max-w-48 sm:max-w-64 truncate"
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
