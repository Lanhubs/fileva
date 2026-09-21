import React from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import { ExtractedColor } from '../../../types';

interface DominantPaletteSwatchesProps {
  colors: ExtractedColor[];
  isExtracting: boolean;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const DominantPaletteSwatches: React.FC<DominantPaletteSwatchesProps> = ({
  colors,
  isExtracting,
  copiedKey,
  onCopy,
}) => {
  return (
    <div className="border border-border bg-surface rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
          Dominant Color Swatches (Click to copy HEX)
        </h3>
        {isExtracting && (
          <span className="text-xs font-mono text-primary">Quantizing colors...</span>
        )}
      </div>

      {/* Continuous Palette Spectrum Bar */}
      <div className="h-12 w-full flex rounded overflow-hidden border border-border">
        {colors.map((c, i) => (
          <button
            key={c.hex + i}
            onClick={() => onCopy(c.hex, `spectrum-${i}`)}
            style={{ backgroundColor: c.hex, width: `${Math.max(5, c.percentage)}%` }}
            className="h-full group relative focus:outline-hidden transition-all hover:brightness-110 cursor-pointer"
            title={`${c.hex} (${c.percentage}%) - Click to copy`}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold transition-opacity">
              <span
                className="px-1 py-0.5 rounded shadow-xs flex items-center gap-1"
                style={{
                  backgroundColor: c.isLight ? '#1A1817' : '#FFFFFF',
                  color: c.isLight ? '#FFFFFF' : '#1A1817',
                }}
              >
                {copiedKey === `spectrum-${i}` ? <FiCheck className="w-3 h-3" /> : c.hex}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Grid of Color Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
        {colors.map((color, index) => (
          <div
            key={color.hex + index}
            className="p-3 border border-border rounded bg-background space-y-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded border border-border shrink-0 shadow-xs"
                style={{ backgroundColor: color.hex }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onCopy(color.hex, `hex-${index}`)}
                    className="font-mono text-xs font-bold text-text-main hover:text-primary flex items-center gap-1 truncate cursor-pointer"
                  >
                    <span>{color.hex}</span>
                    {copiedKey === `hex-${index}` ? (
                      <FiCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <FiCopy className="w-3 h-3 text-text-muted shrink-0" />
                    )}
                  </button>
                </div>
                <span className="text-[10px] font-mono text-text-muted block">
                  {color.percentage}% prominence
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border text-[11px] font-mono text-text-muted space-y-1">
              <div
                onClick={() =>
                  onCopy(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, `rgb-${index}`)
                }
                className="flex justify-between cursor-pointer hover:text-text-main transition-colors"
                title="Copy RGB"
              >
                <span className="text-text-muted">RGB:</span>
                <span>
                  {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                </span>
              </div>
              <div
                onClick={() =>
                  onCopy(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, `hsl-${index}`)
                }
                className="flex justify-between cursor-pointer hover:text-text-main transition-colors"
                title="Copy HSL"
              >
                <span className="text-text-muted">HSL:</span>
                <span>
                  {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
