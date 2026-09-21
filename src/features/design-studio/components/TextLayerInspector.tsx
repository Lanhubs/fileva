import React, { useMemo } from 'react';
import { TextLayer } from '../types';
import { FontFamilyPicker } from './FontFamilyPicker';
import { findStudioFont } from '../fonts';

interface TextLayerInspectorProps {
  layer: TextLayer;
  onUpdateLayer: (layer: TextLayer) => void;
}

export const TextLayerInspector: React.FC<TextLayerInspectorProps> = ({ layer, onUpdateLayer }) => {
  const currentFont = useMemo(() => findStudioFont(layer.fontFamily), [layer.fontFamily]);
  const availableWeights = useMemo(() => {
    return currentFont?.weights || [400, 500, 600, 700, 800, 900];
  }, [currentFont]);

  return (
    <div className="space-y-3.5 pt-2 border-t border-border">
      {/* Font Family Selector */}
      <FontFamilyPicker
        value={layer.fontFamily}
        onChange={(fontFamily, selectedFont) => {
          let updatedWeight = layer.fontWeight;
          if (selectedFont?.weights && !selectedFont.weights.includes(updatedWeight)) {
            updatedWeight = (selectedFont.weights.includes(700)
              ? 700
              : selectedFont.weights[0]) as typeof layer.fontWeight;
          }
          onUpdateLayer({ ...layer, fontFamily, fontWeight: updatedWeight });
        }}
      />

      {/* Text Content */}
      <div>
        <label className="text-[11px] font-semibold text-text-muted block mb-1">Text Content</label>
        <textarea
          rows={3}
          value={layer.text}
          onChange={(e) => onUpdateLayer({ ...layer, text: e.target.value })}
          className="w-full p-2 bg-background border border-border rounded text-text-main text-xs focus:ring-1 focus:ring-primary focus:outline-hidden"
          placeholder="Enter headline or caption..."
        />
      </div>

      {/* Font Size & Weight */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-semibold text-text-muted block mb-1">Size (px)</label>
          <input
            type="number"
            value={layer.fontSize}
            min={12}
            max={320}
            onChange={(e) => onUpdateLayer({ ...layer, fontSize: Number(e.target.value) || 12 })}
            className="w-full px-2 py-1 bg-background border border-border rounded text-xs"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-text-muted block mb-1">Weight</label>
          <select
            value={layer.fontWeight}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                fontWeight: Number(e.target.value) as 400 | 500 | 600 | 700 | 800 | 900,
              })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded text-xs"
          >
            {availableWeights.map((w) => (
              <option key={w} value={w}>
                {w === 400
                  ? 'Regular (400)'
                  : w === 500
                  ? 'Medium (500)'
                  : w === 600
                  ? 'Semibold (600)'
                  : w === 700
                  ? 'Bold (700)'
                  : w === 800
                  ? 'Extrabold (800)'
                  : 'Black (900)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Color & Alignment */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[11px] font-semibold text-text-muted block mb-1">Color</label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={layer.color}
              onChange={(e) => onUpdateLayer({ ...layer, color: e.target.value })}
              className="w-7 h-7 rounded border border-border cursor-pointer shrink-0"
            />
            <input
              type="text"
              value={layer.color}
              onChange={(e) => onUpdateLayer({ ...layer, color: e.target.value })}
              className="w-full px-2 py-1 bg-background border border-border rounded text-[11px] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-text-muted block mb-1">Alignment</label>
          <div className="flex border border-border rounded overflow-hidden">
            {(['left', 'center', 'right'] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onUpdateLayer({ ...layer, textAlign: align })}
                className={`flex-1 py-1 text-xs capitalize cursor-pointer text-center ${
                  layer.textAlign === align
                    ? 'bg-primary text-white font-bold'
                    : 'bg-background hover:bg-surface text-text-muted'
                }`}
              >
                {align[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Letter Spacing & Text Transform */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/60">
        <div>
          <label className="text-[11px] font-semibold text-text-muted block mb-1">
            Tracking ({layer.letterSpacing || 0}px)
          </label>
          <input
            type="range"
            min={-3}
            max={12}
            step={0.5}
            value={layer.letterSpacing || 0}
            onChange={(e) => onUpdateLayer({ ...layer, letterSpacing: Number(e.target.value) })}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold text-text-muted block mb-1">Case</label>
          <div className="flex border border-border rounded overflow-hidden text-[10px]">
            {(
              [
                { id: 'none', label: 'Aa' },
                { id: 'uppercase', label: 'AA' },
                { id: 'capitalize', label: 'Ab' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onUpdateLayer({ ...layer, textTransform: opt.id })}
                className={`flex-1 py-1 cursor-pointer font-mono font-medium text-center ${
                  (layer.textTransform || 'none') === opt.id
                    ? 'bg-primary text-white font-bold'
                    : 'bg-background hover:bg-surface text-text-muted'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
