import React from 'react';
import { ShapeLayer } from '../types';

interface ShapeLayerInspectorProps {
  layer: ShapeLayer;
  onUpdateLayer: (layer: ShapeLayer) => void;
}

export const ShapeLayerInspector: React.FC<ShapeLayerInspectorProps> = ({
  layer,
  onUpdateLayer,
}) => {
  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-text-muted block mb-1">Shape Kind</label>
          <select
            value={layer.shapeKind}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                shapeKind: e.target.value as ShapeLayer['shapeKind'],
              })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded"
          >
            <option value="rounded-rect">Rounded Rect</option>
            <option value="rectangle">Rectangle</option>
            <option value="circle">Circle</option>
            <option value="pill">Pill</option>
            <option value="line">Line</option>
          </select>
        </div>

        <div>
          <label className="text-text-muted block mb-1">Corner Radius</label>
          <input
            type="number"
            value={layer.cornerRadius || 0}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                cornerRadius: Number(e.target.value) || 0,
              })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded"
          />
        </div>
      </div>

      <div>
        <label className="text-text-muted block mb-1">Fill Color</label>
        <div className="flex items-center gap-1.5">
          <input
            type="color"
            value={layer.fillColor}
            onChange={(e) => onUpdateLayer({ ...layer, fillColor: e.target.value })}
            className="w-7 h-7 rounded border border-border cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={layer.fillColor}
            onChange={(e) => onUpdateLayer({ ...layer, fillColor: e.target.value })}
            className="w-full px-2 py-1 bg-background border border-border rounded text-[11px] font-mono"
          />
        </div>
      </div>
    </div>
  );
};
