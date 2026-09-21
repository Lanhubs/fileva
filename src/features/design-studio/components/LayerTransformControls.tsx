import React from 'react';
import { FiCopy, FiTrash2 } from 'react-icons/fi';
import { Layer } from '../types';

interface LayerTransformProps {
  layer: Layer;
  onUpdateLayer: (updated: Layer) => void;
  onDeleteLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
}

export const LayerTransformControls: React.FC<LayerTransformProps> = ({
  layer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-bold text-text-main uppercase tracking-wider text-[10px]">
          {layer.type} Properties
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDuplicateLayer(layer.id)}
            className="p-1 rounded text-text-muted hover:text-text-main hover:bg-background cursor-pointer"
            title="Duplicate Layer"
          >
            <FiCopy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteLayer(layer.id)}
            className="p-1 rounded text-text-muted hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
            title="Delete Layer"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <label className="text-text-muted block mb-1">X Position (px)</label>
          <input
            type="number"
            value={layer.x}
            onChange={(e) => onUpdateLayer({ ...layer, x: Number(e.target.value) || 0 })}
            className="w-full px-2 py-1 bg-background border border-border rounded text-text-main"
          />
        </div>
        <div>
          <label className="text-text-muted block mb-1">Y Position (px)</label>
          <input
            type="number"
            value={layer.y}
            onChange={(e) => onUpdateLayer({ ...layer, y: Number(e.target.value) || 0 })}
            className="w-full px-2 py-1 bg-background border border-border rounded text-text-main"
          />
        </div>
        <div>
          <label className="text-text-muted block mb-1">Width (px)</label>
          <input
            type="number"
            value={layer.width}
            onChange={(e) =>
              onUpdateLayer({ ...layer, width: Math.max(10, Number(e.target.value) || 10) })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded text-text-main"
          />
        </div>
        <div>
          <label className="text-text-muted block mb-1">Height (px)</label>
          <input
            type="number"
            value={layer.height}
            onChange={(e) =>
              onUpdateLayer({ ...layer, height: Math.max(10, Number(e.target.value) || 10) })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded text-text-main"
          />
        </div>
        <div>
          <label className="text-text-muted block mb-1">Rotation (°)</label>
          <input
            type="number"
            value={layer.rotation || 0}
            onChange={(e) => onUpdateLayer({ ...layer, rotation: Number(e.target.value) || 0 })}
            className="w-full px-2 py-1 bg-background border border-border rounded text-text-main"
          />
        </div>
        <div>
          <label className="text-text-muted block mb-1">Opacity (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={Math.round(layer.opacity * 100)}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                opacity: Math.max(0, Math.min(1, (Number(e.target.value) || 0) / 100)),
              })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded text-text-main"
          />
        </div>
      </div>
    </>
  );
};
