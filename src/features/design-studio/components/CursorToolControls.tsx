import React from 'react';
import {
  FiMousePointer,
  FiMove,
  FiZoomIn,
  FiCrosshair,
  FiRotateCcw,
  FiRotateCw,
} from 'react-icons/fi';
import { StudioCursorMode } from '../cursor-types';

interface CursorToolControlsProps {
  cursorMode: StudioCursorMode;
  onChangeCursorMode: (mode: StudioCursorMode) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const CursorToolControls: React.FC<CursorToolControlsProps> = ({
  cursorMode,
  onChangeCursorMode,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      {/* Undo / Redo buttons */}
      <div className="flex items-center bg-background p-0.5 border border-border rounded shadow-2xs">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1 sm:p-1.5 rounded transition-colors cursor-pointer text-text-muted hover:text-text-main hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z / Cmd+Z)"
        >
          <FiRotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1 sm:p-1.5 rounded transition-colors cursor-pointer text-text-muted hover:text-text-main hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y)"
        >
          <FiRotateCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Cursor Tool Selector */}
      <div
        id="studio-cursor-changer"
        className="flex items-center bg-background p-0.5 border border-border rounded shadow-2xs"
        title="Cursor Mode (V: Select, H: Hand, Z: Zoom, C: Crosshair)"
      >
        <button
          onClick={() => onChangeCursorMode('select')}
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'select'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Select & Transform (V)"
        >
          <FiMousePointer className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onChangeCursorMode('hand')}
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'hand'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Hand Pan Canvas (H or Space)"
        >
          <FiMove className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onChangeCursorMode('zoom-in')}
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'zoom-in'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Zoom Tool (Z — Alt+Click to zoom out)"
        >
          <FiZoomIn className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onChangeCursorMode('crosshair')}
          className={`px-2 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium ${
            cursorMode === 'crosshair'
              ? 'bg-surface text-primary font-semibold shadow-xs'
              : 'text-text-muted hover:text-text-main'
          }`}
          title="Precision Crosshair (C)"
        >
          <FiCrosshair className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Crosshair</span>
        </button>
      </div>
    </div>
  );
};
