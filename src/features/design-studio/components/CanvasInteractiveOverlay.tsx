import React from 'react';
import { Layer } from '../types';
import { StudioCursorMode } from '../cursor-types';

interface CanvasInteractiveOverlayProps {
  layers: Layer[];
  selectedLayerId: string | null;
  cursorMode: StudioCursorMode;
  previewMode: boolean;
  onPointerDownLayer: (e: React.PointerEvent, layer: Layer) => void;
  onPointerDownResize: (e: React.PointerEvent, handle: 'tl' | 'tr' | 'bl' | 'br') => void;
}

export const CanvasInteractiveOverlay: React.FC<CanvasInteractiveOverlayProps> = ({
  layers,
  selectedLayerId,
  cursorMode,
  previewMode,
  onPointerDownLayer,
  onPointerDownResize,
}) => {
  if (previewMode) return null;

  return (
    <div className={`absolute inset-0 ${cursorMode === 'hand' ? 'pointer-events-none' : 'pointer-events-auto'}`}>
      {layers
        .filter((l) => l.visible)
        .map((layer) => {
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              id={`layer-element-${layer.id}`}
              onPointerDown={(e) => onPointerDownLayer(e, layer)}
              className={`absolute ${
                cursorMode === 'hand'
                  ? 'cursor-grab'
                  : cursorMode === 'crosshair'
                  ? 'cursor-crosshair'
                  : cursorMode === 'zoom-in'
                  ? 'cursor-zoom-in'
                  : 'cursor-move'
              } ${
                isSelected
                  ? 'ring-2 ring-primary ring-offset-2 ring-offset-transparent'
                  : 'hover:ring-1 hover:ring-primary/50'
              }`}
              style={{
                left: `${layer.x}px`,
                top: `${layer.y}px`,
                width: `${layer.width}px`,
                height: `${layer.height}px`,
                transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                zIndex: layer.zIndex,
              }}
            >
              {isSelected && !layer.locked && cursorMode === 'select' && (
                <>
                  <div
                    className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-primary rounded-full cursor-nwse-resize z-50"
                    onPointerDown={(e) => onPointerDownResize(e, 'tl')}
                  />
                  <div
                    className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-primary rounded-full cursor-nesw-resize z-50"
                    onPointerDown={(e) => onPointerDownResize(e, 'tr')}
                  />
                  <div
                    className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-primary rounded-full cursor-nesw-resize z-50"
                    onPointerDown={(e) => onPointerDownResize(e, 'bl')}
                  />
                  <div
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-primary rounded-full cursor-nwse-resize z-50"
                    onPointerDown={(e) => onPointerDownResize(e, 'br')}
                  />
                </>
              )}
            </div>
          );
        })}
    </div>
  );
};
