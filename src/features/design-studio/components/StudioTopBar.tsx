import React from 'react';
import { CanvasDimensions, DesignStudioMode } from '../types';
import { StudioCursorMode } from '../cursor-types';
import { StudioTopBarLeft } from './StudioTopBarLeft';
import { CursorToolControls } from './CursorToolControls';
import { StudioTopBarActions } from './StudioTopBarActions';

interface StudioTopBarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  dimensions: CanvasDimensions;
  onChangeDimensions: (dimensions: CanvasDimensions) => void;
  mode: DesignStudioMode;
  onChangeMode: (mode: DesignStudioMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitCanvas: () => void;
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
  onUploadScreenshot: (file: File) => void;
  onOpenTemplates: () => void;
  isExporting: boolean;
  exportProgress?: { current: number; total: number };
  cursorMode: StudioCursorMode;
  onChangeCursorMode: (mode: StudioCursorMode) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  projectName,
  onUpdateProjectName,
  dimensions,
  onChangeDimensions,
  mode,
  onChangeMode,
  zoom,
  onZoomChange,
  onFitCanvas,
  previewMode,
  onTogglePreviewMode,
  onExportCurrent,
  onExportAll,
  onUploadScreenshot,
  onOpenTemplates,
  isExporting,
  exportProgress,
  cursorMode,
  onChangeCursorMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {
  return (
    <div
      id="design-studio-topbar"
      className="bg-surface border-b border-border px-4 py-2.5 flex items-center justify-between gap-3 text-xs shrink-0 select-none overflow-x-auto"
    >
      <StudioTopBarLeft
        projectName={projectName}
        onUpdateProjectName={onUpdateProjectName}
        dimensions={dimensions}
        onChangeDimensions={onChangeDimensions}
        mode={mode}
        onChangeMode={onChangeMode}
      />

      <CursorToolControls
        cursorMode={cursorMode}
        onChangeCursorMode={onChangeCursorMode}
        zoom={zoom}
        onZoomChange={onZoomChange}
        onFitCanvas={onFitCanvas}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      <StudioTopBarActions
        previewMode={previewMode}
        onTogglePreviewMode={onTogglePreviewMode}
        onExportCurrent={onExportCurrent}
        onExportAll={onExportAll}
        onUploadScreenshot={onUploadScreenshot}
        onOpenTemplates={onOpenTemplates}
        isExporting={isExporting}
        exportProgress={exportProgress}
      />
    </div>
  );
};
