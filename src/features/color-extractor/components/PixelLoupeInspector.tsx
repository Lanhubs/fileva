import React from 'react';
import { FiEye, FiCheck } from 'react-icons/fi';
import { ImageFileState, ExtractedColor } from '../../../types';

interface PixelLoupeInspectorProps {
  imageFile: ImageFileState;
  hoveredPixel: {
    x: number;
    y: number;
    color: ExtractedColor;
  } | null;
  onImageMouseMove: (e: React.MouseEvent<HTMLImageElement>) => void;
  onLoupeClick: () => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export const PixelLoupeInspector: React.FC<PixelLoupeInspectorProps> = ({
  imageFile,
  hoveredPixel,
  onImageMouseMove,
  onLoupeClick,
  copiedKey,
  onCopy,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 border border-border bg-surface rounded-lg p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-text-muted">
          <span>Interactive Pixel Loupe (Hover over image to inspect)</span>
          <span>
            {imageFile.width}×{imageFile.height}px
          </span>
        </div>

        <div className="rounded border border-border h-80 sm:h-96 flex items-center justify-center p-2 bg-background overflow-hidden relative cursor-crosshair">
          <img
            src={imageFile.objectUrl}
            alt="Source inspected"
            onMouseMove={onImageMouseMove}
            onClick={onLoupeClick}
            className="max-h-full max-w-full object-contain select-none"
          />
        </div>
      </div>

      {/* Loupe Inspector Box */}
      <div className="lg:col-span-1 border border-border bg-surface rounded-lg p-5 space-y-4">
        <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
          Pixel Coordinates & Values
        </h4>

        {hoveredPixel ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded border border-border shrink-0 shadow-xs"
                style={{ backgroundColor: hoveredPixel.color.hex }}
              />
              <div>
                <div className="text-lg font-bold font-mono text-text-main">
                  {hoveredPixel.color.hex}
                </div>
                <div className="text-xs font-mono text-text-muted">
                  X: {hoveredPixel.x}, Y: {hoveredPixel.y}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <button
                onClick={() => onCopy(hoveredPixel.color.hex, 'inspect-hex')}
                className="w-full p-2 rounded bg-background border border-border hover:bg-surface flex items-center justify-between cursor-pointer"
              >
                <span className="text-text-muted">HEX</span>
                <span className="font-bold text-text-main">
                  {hoveredPixel.color.hex}
                </span>
              </button>

              <button
                onClick={() =>
                  onCopy(
                    `rgb(${hoveredPixel.color.rgb.r}, ${hoveredPixel.color.rgb.g}, ${hoveredPixel.color.rgb.b})`,
                    'inspect-rgb'
                  )
                }
                className="w-full p-2 rounded bg-background border border-border hover:bg-surface flex items-center justify-between cursor-pointer"
              >
                <span className="text-text-muted">RGB</span>
                <span className="font-bold text-text-main">
                  {hoveredPixel.color.rgb.r}, {hoveredPixel.color.rgb.g}, {hoveredPixel.color.rgb.b}
                </span>
              </button>

              <button
                onClick={() =>
                  onCopy(
                    `hsl(${hoveredPixel.color.hsl.h}, ${hoveredPixel.color.hsl.s}%, ${hoveredPixel.color.hsl.l}%)`,
                    'inspect-hsl'
                  )
                }
                className="w-full p-2 rounded bg-background border border-border hover:bg-surface flex items-center justify-between cursor-pointer"
              >
                <span className="text-text-muted">HSL</span>
                <span className="font-bold text-text-main">
                  {hoveredPixel.color.hsl.h}°, {hoveredPixel.color.hsl.s}%, {hoveredPixel.color.hsl.l}%
                </span>
              </button>
            </div>

            {copiedKey && (
              <div className="text-xs text-emerald-600 font-mono text-center flex items-center justify-center gap-1">
                <FiCheck /> Copied to clipboard
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded">
            <FiEye className="w-6 h-6 text-text-muted mb-2" />
            <p className="text-xs text-text-muted">
              Move cursor over the image to inspect any specific pixel. Click to copy.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
