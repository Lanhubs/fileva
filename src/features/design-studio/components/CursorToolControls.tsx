import React from 'react';
import {
  FiZoomIn,
  FiZoomOut,
  FiMaximize2,
  FiMousePointer,
  FiMove,
  FiCrosshair,
  FiRotateCcw,
  FiRotateCw,
} from 'react-icons/fi';
import { StudioCursorMode } from '../cursor-types';

interface CursorToolControlsProps {
  cursorMode: StudioCursorMode;
  onChangeCursorMode: (mode: StudioCursorMode) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitCanvas: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const CursorToolControls: React.FC<CursorToolControlsProps> = ({
  cursorMode,
  onChangeCursorMode,
  zoom,
  onZoomChange,
  onFitCanvas,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="hidden md:flex items-center gap-2">
      {/* Undo / Redo buttons */}
      <div className="flex items-center bg-background p-0.5 border border-border rounded">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded transition-colors cursor-pointer text-text-muted hover:text-text-main disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z / Cmd+Z)"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded transition-colors cursor-pointer text-text-muted hover:text-text-main disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y)"
        >
          <FiRotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cursor Mode Changer */}
      <div
        id="studio-cursor-changer"
        className="flex items-center bg-background p-0.5 border border-border rounded"
        title="Cursor Mode (V: Select, H: Hand, Z: Zoom, C: Crosshair)"
      >
        <button
          onClick={() => onChangeCursorMode('select')}
          className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'select'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Select & Transform (V) - Select, move and edit layers"
        >
          <FiMousePointer className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Select</span>
        </button>

        <button
          onClick={() => onChangeCursorMode('hand')}
          className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'hand'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Hand Pan (H or Space) - Pan across the canvas board"
        >
          <FiMove className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Hand</span>
        </button>

        <button
          onClick={() => onChangeCursorMode('zoom-in')}
          className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'zoom-in'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Zoom Tool (Z) - Click canvas to zoom"
        >
          <FiZoomIn className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Zoom</span>
        </button>

        <button
          onClick={() => onChangeCursorMode('crosshair')}
          className={`p-1.5 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'crosshair'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Precision Crosshair (C)"
        >
          <FiCrosshair className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Precision</span>
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="hidden lg:flex items-center gap-1 bg-background p-1 border border-border rounded">
        <button
          onClick={() => onZoomChange(Math.max(0.1, zoom - 0.05))}
          className="p-1 hover:text-primary cursor-pointer text-text-muted"
          title="Zoom Out (Ctrl + -)"
        >
          <FiZoomOut className="w-3.5 h-3.5" />
        </button>
        <span className="font-mono text-[11px] px-1 text-text-muted w-10 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => onZoomChange(Math.min(1.5, zoom + 0.05))}
          className="p-1 hover:text-primary cursor-pointer text-text-muted"
          title="Zoom In (Ctrl + +)"
        >
          <FiZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onFitCanvas}
          className="p-1 hover:text-primary cursor-pointer text-text-muted border-l border-border pl-1.5 ml-0.5"
          title="Fit Canvas (Ctrl + 0)"
        >
          <FiMaximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
