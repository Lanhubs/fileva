import React from 'react';
import { BackgroundConfig } from '../types';

interface BackgroundInspectorProps {
  background: BackgroundConfig;
  onUpdateBackground: (bg: BackgroundConfig) => void;
}

export const BackgroundInspector: React.FC<BackgroundInspectorProps> = ({
  background,
  onUpdateBackground,
}) => {
  return (
    <div className="p-4 space-y-4 bg-surface">
      <span className="font-bold text-text-main uppercase tracking-wider text-[10px]">
        Canvas Background
      </span>

      <div className="grid grid-cols-3 gap-1 bg-background p-1 border border-border rounded">
        {(['solid', 'gradient', 'transparent'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              if (mode === 'gradient') {
                onUpdateBackground({
                  type: 'gradient',
                  color: background.color || '#0F172A',
                  gradient: {
                    type: 'linear',
                    angle: 160,
                    stops: [
                      { color: '#1E293B', offset: 0 },
                      { color: '#0F172A', offset: 1 },
                    ],
                  },
                });
              } else {
                onUpdateBackground({
                  ...background,
                  type: mode,
                });
              }
            }}
            className={`py-1 text-center capitalize rounded cursor-pointer ${
              background.type === mode
                ? 'bg-surface font-semibold text-text-main border border-border shadow-xs'
                : 'text-text-muted hover:text-text-main'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {background.type === 'solid' && (
        <div className="space-y-2">
          <label className="text-text-muted block">Solid Background Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.color || '#0F172A'}
              onChange={(e) => onUpdateBackground({ ...background, color: e.target.value })}
              className="w-8 h-8 rounded border border-border cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={background.color || '#0F172A'}
              onChange={(e) => onUpdateBackground({ ...background, color: e.target.value })}
              className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded font-mono text-xs"
            />
          </div>
        </div>
      )}

      {background.type === 'gradient' && background.gradient && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-text-muted block mb-1">Start Color</label>
              <input
                type="color"
                value={background.gradient.stops[0]?.color || '#1E293B'}
                onChange={(e) => {
                  const stops = [...(background.gradient?.stops || [])];
                  stops[0] = { color: e.target.value, offset: 0 };
                  onUpdateBackground({
                    ...background,
                    gradient: { ...background.gradient!, stops },
                  });
                }}
                className="w-full h-8 rounded border border-border cursor-pointer"
              />
            </div>

            <div>
              <label className="text-text-muted block mb-1">End Color</label>
              <input
                type="color"
                value={background.gradient.stops[1]?.color || '#0F172A'}
                onChange={(e) => {
                  const stops = [...(background.gradient?.stops || [])];
                  stops[1] = { color: e.target.value, offset: 1 };
                  onUpdateBackground({
                    ...background,
                    gradient: { ...background.gradient!, stops },
                  });
                }}
                className="w-full h-8 rounded border border-border cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-text-muted block mb-1">
              Gradient Angle ({background.gradient.angle || 160}°)
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={background.gradient.angle || 160}
              onChange={(e) =>
                onUpdateBackground({
                  ...background,
                  gradient: { ...background.gradient!, angle: Number(e.target.value) },
                })
              }
              className="w-full accent-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
};
