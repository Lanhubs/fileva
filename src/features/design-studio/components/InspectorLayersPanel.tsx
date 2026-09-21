import React, { useRef } from 'react';
import { FiType, FiSmartphone, FiSquare, FiImage } from 'react-icons/fi';
import {
  Layer,
  DeviceLayer,
  TextLayer,
  ShapeLayer,
  BackgroundConfig,
  DesignAsset,
} from '../types';
import { LayerTransformControls } from './LayerTransformControls';
import { TextLayerInspector } from './TextLayerInspector';
import { DeviceLayerInspector } from './DeviceLayerInspector';
import { ShapeLayerInspector } from './ShapeLayerInspector';
import { BackgroundInspector } from './BackgroundInspector';
import { LayersTree } from './LayersTree';

interface InspectorLayersPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onUpdateLayer: (updated: Layer) => void;
  onDeleteLayer: (layerId: string) => void;
  onDuplicateLayer: (layerId: string) => void;
  onReorderLayer: (layerId: string, direction: 'up' | 'down') => void;
  background: BackgroundConfig;
  onUpdateBackground: (bg: BackgroundConfig) => void;
  assets: DesignAsset[];
  onAddTextLayer: () => void;
  onAddShapeLayer: () => void;
  onAddDeviceLayer: () => void;
  onUploadAsset: (file: File) => void;
}

export const InspectorLayersPanel: React.FC<InspectorLayersPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  onReorderLayer,
  background,
  onUpdateBackground,
  assets,
  onAddTextLayer,
  onAddShapeLayer,
  onAddDeviceLayer,
  onUploadAsset,
}) => {
  const assetFileInputRef = useRef<HTMLInputElement>(null);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <div className="w-80 shrink-0 bg-surface border-l border-border h-full flex flex-col text-xs text-text-main overflow-hidden">
      {/* Top Action Buttons: Add Element */}
      <div className="p-3 border-b border-border bg-background/50 flex items-center justify-between gap-1.5 shrink-0">
        <button
          onClick={onAddTextLayer}
          className="flex-1 py-1.5 px-2 bg-surface hover:bg-background border border-border rounded font-medium flex items-center justify-center gap-1.5 cursor-pointer text-text-main"
          title="Add Text Layer"
        >
          <FiType className="w-3.5 h-3.5 text-primary" />
          <span>Text</span>
        </button>
        <button
          onClick={onAddDeviceLayer}
          className="flex-1 py-1.5 px-2 bg-surface hover:bg-background border border-border rounded font-medium flex items-center justify-center gap-1.5 cursor-pointer text-text-main"
          title="Add Device Frame"
        >
          <FiSmartphone className="w-3.5 h-3.5 text-primary" />
          <span>Device</span>
        </button>
        <button
          onClick={onAddShapeLayer}
          className="flex-1 py-1.5 px-2 bg-surface hover:bg-background border border-border rounded font-medium flex items-center justify-center gap-1.5 cursor-pointer text-text-main"
          title="Add Shape Layer"
        >
          <FiSquare className="w-3.5 h-3.5 text-primary" />
          <span>Shape</span>
        </button>
        <button
          onClick={() => assetFileInputRef.current?.click()}
          className="p-1.5 bg-surface hover:bg-background border border-border rounded font-medium flex items-center justify-center cursor-pointer text-text-main"
          title="Import Media File"
        >
          <FiImage className="w-3.5 h-3.5 text-primary" />
        </button>
        <input
          ref={assetFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onUploadAsset(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border">
        {selectedLayer ? (
          <div className="p-4 space-y-4 bg-surface">
            <LayerTransformControls
              layer={selectedLayer}
              onUpdateLayer={onUpdateLayer}
              onDeleteLayer={onDeleteLayer}
              onDuplicateLayer={onDuplicateLayer}
            />

            {selectedLayer.type === 'text' && (
              <TextLayerInspector
                layer={selectedLayer as TextLayer}
                onUpdateLayer={onUpdateLayer}
              />
            )}

            {selectedLayer.type === 'device' && (
              <DeviceLayerInspector
                layer={selectedLayer as DeviceLayer}
                assets={assets}
                onUpdateLayer={onUpdateLayer}
              />
            )}

            {selectedLayer.type === 'shape' && (
              <ShapeLayerInspector
                layer={selectedLayer as ShapeLayer}
                onUpdateLayer={onUpdateLayer}
              />
            )}
          </div>
        ) : (
          <BackgroundInspector
            background={background}
            onUpdateBackground={onUpdateBackground}
          />
        )}

        <LayersTree
          layers={layers}
          selectedLayerId={selectedLayerId}
          onSelectLayer={onSelectLayer}
          onUpdateLayer={onUpdateLayer}
          onReorderLayer={onReorderLayer}
        />
      </div>
    </div>
  );
};
