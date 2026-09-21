import React from 'react';
import { DeviceLayer, DesignAsset, DeviceModel } from '../types';

interface DeviceLayerInspectorProps {
  layer: DeviceLayer;
  assets: DesignAsset[];
  onUpdateLayer: (layer: DeviceLayer) => void;
}

export const DeviceLayerInspector: React.FC<DeviceLayerInspectorProps> = ({
  layer,
  assets,
  onUpdateLayer,
}) => {
  return (
    <div className="space-y-3 pt-2 border-t border-border">
      <div>
        <label className="text-text-muted block mb-1">Device Model</label>
        <select
          value={layer.deviceModel}
          onChange={(e) =>
            onUpdateLayer({
              ...layer,
              deviceModel: e.target.value as DeviceModel,
            })
          }
          className="w-full px-2 py-1.5 bg-background border border-border rounded"
        >
          <option value="iphone-16-pro">iPhone 16 Pro (Dynamic Island)</option>
          <option value="iphone-15">iPhone 15 Pro</option>
          <option value="pixel-9-pro">Google Pixel 9 Pro (Punch-hole)</option>
          <option value="galaxy-s24">Samsung Galaxy S24</option>
          <option value="ipad-pro">iPad Pro 13"</option>
          <option value="macbook-pro">MacBook Pro</option>
          <option value="browser-window">Clean Browser Window</option>
        </select>
      </div>

      <div>
        <label className="text-text-muted block mb-1">Screen Content (Screenshot)</label>
        {assets.length === 0 ? (
          <div className="p-2 border border-dashed border-border rounded text-center text-text-muted text-[11px]">
            No screenshots imported yet. Use the upload button above.
          </div>
        ) : (
          <select
            value={layer.screenshotAssetId || ''}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                screenshotAssetId: e.target.value || undefined,
              })
            }
            className="w-full px-2 py-1.5 bg-background border border-border rounded"
          >
            <option value="">-- Blank Screen --</option>
            {assets.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({a.width}×{a.height})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-text-muted block mb-1">Chassis Finish</label>
          <select
            value={layer.color}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                color: e.target.value as DeviceLayer['color'],
              })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded capitalize"
          >
            <option value="titanium">Titanium</option>
            <option value="midnight">Midnight</option>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div>
          <label className="text-text-muted block mb-1">Screenshot Scale</label>
          <input
            type="number"
            step="0.05"
            min="0.5"
            max="2"
            value={layer.screenshotScale || 1}
            onChange={(e) =>
              onUpdateLayer({
                ...layer,
                screenshotScale: Number(e.target.value) || 1,
              })
            }
            className="w-full px-2 py-1 bg-background border border-border rounded"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer pt-1">
        <input
          type="checkbox"
          checked={layer.showShadow}
          onChange={(e) =>
            onUpdateLayer({
              ...layer,
              showShadow: e.target.checked,
            })
          }
          className="rounded text-primary focus:ring-primary"
        />
        <span>Cast Ambient Shadow</span>
      </label>
    </div>
  );
};
