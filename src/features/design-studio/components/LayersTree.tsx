import React from 'react';
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiUnlock,
  FiChevronUp,
  FiChevronDown,
  FiType,
  FiSmartphone,
  FiSquare,
  FiImage,
} from 'react-icons/fi';
import { Layer } from '../types';

interface LayersTreeProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onUpdateLayer: (updated: Layer) => void;
  onReorderLayer: (layerId: string, direction: 'up' | 'down') => void;
}

export const LayersTree: React.FC<LayersTreeProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onReorderLayer,
}) => {
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-text-main uppercase tracking-wider text-[10px]">
          Layers ({layers.length})
        </span>
      </div>

      <div className="space-y-1">
        {sortedLayers.map((layer) => {
          const isSelected = layer.id === selectedLayerId;

          return (
            <div
              key={layer.id}
              onClick={() => onSelectLayer(layer.id)}
              className={`group flex items-center justify-between p-2 rounded border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-primary-light/50 border-primary text-primary font-medium'
                  : 'border-border bg-surface hover:bg-background text-text-main'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                {layer.type === 'text' && <FiType className="w-3.5 h-3.5 shrink-0" />}
                {layer.type === 'device' && <FiSmartphone className="w-3.5 h-3.5 shrink-0" />}
                {layer.type === 'shape' && <FiSquare className="w-3.5 h-3.5 shrink-0" />}
                {layer.type === 'image' && <FiImage className="w-3.5 h-3.5 shrink-0" />}
                <span className="truncate text-xs">{layer.name}</span>
              </div>

              <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderLayer(layer.id, 'up');
                  }}
                  className="p-1 hover:text-primary cursor-pointer"
                  title="Bring Forward"
                >
                  <FiChevronUp className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReorderLayer(layer.id, 'down');
                  }}
                  className="p-1 hover:text-primary cursor-pointer"
                  title="Send Backward"
                >
                  <FiChevronDown className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer({ ...layer, visible: !layer.visible });
                  }}
                  className="p-1 hover:text-primary cursor-pointer"
                  title={layer.visible ? 'Hide' : 'Show'}
                >
                  {layer.visible ? (
                    <FiEye className="w-3 h-3" />
                  ) : (
                    <FiEyeOff className="w-3 h-3 text-text-muted" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateLayer({ ...layer, locked: !layer.locked });
                  }}
                  className="p-1 hover:text-primary cursor-pointer"
                  title={layer.locked ? 'Unlock' : 'Lock'}
                >
                  {layer.locked ? (
                    <FiLock className="w-3 h-3 text-amber-600" />
                  ) : (
                    <FiUnlock className="w-3 h-3 text-text-muted" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
