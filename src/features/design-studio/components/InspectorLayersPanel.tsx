import React, { useRef } from 'react';
import {
  FiType,
  FiSmartphone,
  FiSquare,
  FiImage,
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiDownload,
  FiPackage,
  FiEye,
  FiEdit2,
  FiUpload,
  FiGrid,
  FiHelpCircle,
} from 'react-icons/fi';
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
  // Controls moved from top bar for accessible ergonomics
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitCanvas: () => void;
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
  isExporting: boolean;
  exportProgress?: { current: number; total: number };
  onUploadScreenshot: (file: File) => void;
  onOpenTemplates: () => void;
  onOpenShortcutsModal: () => void;
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
  zoom,
  onZoomChange,
  onFitCanvas,
  previewMode,
  onTogglePreviewMode,
  onExportCurrent,
  onExportAll,
  isExporting,
  exportProgress,
  onUploadScreenshot,
  onOpenTemplates,
  onOpenShortcutsModal,
}) => {
  const assetFileInputRef = useRef<HTMLInputElement>(null);
  const screenshotFileInputRef = useRef<HTMLInputElement>(null);
  const selectedLayer = layers.find((l) => l.id === selectedLayerId) || null;

  return (
    <div
      id="studio-sidebar-panel"
      className="w-80 shrink-0 bg-surface border-l border-border h-full flex flex-col text-xs text-text-main overflow-hidden shadow-xs select-none"
    >
      {/* SECTION 1: Canvas & Export Controls (Relocated from TopBar for accessibility) */}
      <div className="p-3 border-b border-border bg-background/60 flex flex-col gap-2.5 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
          <span className="uppercase tracking-wider">Canvas & Export</span>
          <button
            onClick={onOpenShortcutsModal}
            className="flex items-center gap-1 text-[11px] text-primary hover:underline cursor-pointer"
            title="View Keyboard Shortcuts (?)"
          >
            <FiHelpCircle className="w-3.5 h-3.5" />
            <span>Shortcuts</span>
          </button>
        </div>

        {/* Primary Export & Preview Row */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onExportAll}
            disabled={isExporting}
            className="flex-1 py-1.5 px-2 bg-primary hover:bg-primary-hover text-white rounded font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-xs disabled:opacity-50 transition-colors"
            title="Export all artboard pages as .ZIP package (Cmd/Ctrl + Shift + E)"
          >
            <FiPackage className="w-3.5 h-3.5" />
            <span>
              {isExporting && exportProgress
                ? `Exporting (${exportProgress.current}/${exportProgress.total})...`
                : 'Export All'}
            </span>
          </button>

          <button
            onClick={onExportCurrent}
            disabled={isExporting}
            className="py-1.5 px-2.5 bg-surface hover:bg-background border border-border hover:border-primary rounded text-text-main font-medium flex items-center justify-center gap-1 cursor-pointer text-xs disabled:opacity-50 transition-colors"
            title="Export Current Page as PNG (Cmd/Ctrl + E)"
          >
            <FiDownload className="w-3.5 h-3.5 text-primary" />
            <span>Page</span>
          </button>

          <button
            onClick={onTogglePreviewMode}
            className={`p-1.5 border rounded flex items-center justify-center cursor-pointer transition-colors ${
              previewMode
                ? 'bg-primary text-white border-primary'
                : 'bg-surface hover:bg-background border-border text-text-main hover:border-primary'
            }`}
            title={previewMode ? 'Exit Clean Preview (P)' : 'Clean Preview Mode (P)'}
          >
            {previewMode ? <FiEdit2 className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Zoom Controls & Quick Access Tools */}
        <div className="flex items-center justify-between gap-1.5">
          {/* Zoom Controller */}
          <div className="flex items-center bg-surface border border-border rounded p-0.5 shadow-2xs">
            <button
              onClick={() => onZoomChange(Math.max(0.1, Number((zoom - 0.05).toFixed(2))))}
              className="p-1 hover:text-primary text-text-muted hover:bg-background rounded cursor-pointer transition-colors"
              title="Zoom Out (Cmd/Ctrl + -)"
            >
              <FiZoomOut className="w-3 h-3" />
            </button>

            <button
              onClick={() => onZoomChange(1.0)}
              className="px-1.5 py-0.5 text-[11px] font-mono text-text-main hover:text-primary cursor-pointer transition-colors"
              title="Click to reset to 100% (Cmd/Ctrl + 1)"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={() => onZoomChange(Math.min(2.0, Number((zoom + 0.05).toFixed(2))))}
              className="p-1 hover:text-primary text-text-muted hover:bg-background rounded cursor-pointer transition-colors"
              title="Zoom In (Cmd/Ctrl + +)"
            >
              <FiZoomIn className="w-3 h-3" />
            </button>

            <button
              onClick={onFitCanvas}
              className="p-1 border-l border-border pl-1.5 text-text-muted hover:text-primary hover:bg-background rounded cursor-pointer transition-colors"
              title="Fit Artboard to Viewport (Cmd/Ctrl + 0)"
            >
              <FiMaximize2 className="w-3 h-3" />
            </button>
          </div>

          {/* Screenshot Upload & Layout Presets */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => screenshotFileInputRef.current?.click()}
              className="p-1.5 bg-surface hover:bg-background border border-border hover:border-primary rounded text-text-main cursor-pointer flex items-center gap-1 transition-colors"
              title="Upload App Screenshot (Replaces device screen)"
            >
              <FiUpload className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px]">Screen</span>
            </button>
            <input
              ref={screenshotFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  onUploadScreenshot(e.target.files[0]);
                  e.target.value = '';
                }
              }}
            />

            <button
              onClick={onOpenTemplates}
              className="p-1.5 bg-surface hover:bg-background border border-border hover:border-primary rounded text-text-main cursor-pointer flex items-center gap-1 transition-colors"
              title="Explore Design Templates & Layouts"
            >
              <FiGrid className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px]">Presets</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: Add Element Action Bar */}
      <div className="p-2.5 border-b border-border bg-background/30 flex items-center justify-between gap-1.5 shrink-0">
        <button
          onClick={onAddTextLayer}
          className="flex-1 py-1.5 px-2 bg-surface hover:bg-background border border-border hover:border-primary rounded font-medium flex items-center justify-center gap-1 cursor-pointer text-text-main transition-colors"
          title="Add Text Headline (T)"
        >
          <FiType className="w-3.5 h-3.5 text-primary" />
          <span>Text</span>
        </button>
        <button
          onClick={onAddDeviceLayer}
          className="flex-1 py-1.5 px-2 bg-surface hover:bg-background border border-border hover:border-primary rounded font-medium flex items-center justify-center gap-1 cursor-pointer text-text-main transition-colors"
          title="Add Device Frame (D)"
        >
          <FiSmartphone className="w-3.5 h-3.5 text-primary" />
          <span>Device</span>
        </button>
        <button
          onClick={onAddShapeLayer}
          className="flex-1 py-1.5 px-2 bg-surface hover:bg-background border border-border hover:border-primary rounded font-medium flex items-center justify-center gap-1 cursor-pointer text-text-main transition-colors"
          title="Add Shape Accent (S)"
        >
          <FiSquare className="w-3.5 h-3.5 text-primary" />
          <span>Shape</span>
        </button>
        <button
          onClick={() => assetFileInputRef.current?.click()}
          className="p-1.5 bg-surface hover:bg-background border border-border hover:border-primary rounded font-medium flex items-center justify-center cursor-pointer text-text-main transition-colors"
          title="Import Media File / Asset"
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

      {/* SECTION 3: Contextual Inspector & Layers Tree */}
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
