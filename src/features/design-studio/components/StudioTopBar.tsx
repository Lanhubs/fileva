import React from 'react';
import { CanvasDimensions, DesignStudioMode } from '../types';
import { StudioCursorMode } from '../cursor-types';
import { StudioTopBarLeft } from './StudioTopBarLeft';
import { CursorToolControls } from './CursorToolControls';
import { FiCommand, FiCheck } from 'react-icons/fi';

interface StudioTopBarProps {
  projectName: string;
  onUpdateProjectName: (name: string) => void;
  dimensions: CanvasDimensions;
  onChangeDimensions: (dimensions: CanvasDimensions) => void;
  mode: DesignStudioMode;
  onChangeMode: (mode: DesignStudioMode) => void;
  cursorMode: StudioCursorMode;
  onChangeCursorMode: (mode: StudioCursorMode) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  historyFeedback?: string | null;
  onOpenShortcutsModal: () => void;
}

export const StudioTopBar: React.FC<StudioTopBarProps> = ({
  projectName,
  onUpdateProjectName,
  dimensions,
  onChangeDimensions,
  mode,
  onChangeMode,
  cursorMode,
  onChangeCursorMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyFeedback,
  onOpenShortcutsModal,
}) => {
  return (
    <div
      id="design-studio-topbar"
      className="bg-surface border-b border-border px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3 text-xs shrink-0 select-none w-full min-w-0"
    >
      {/* Left: Project title, Presets & Studio Mode switcher */}
      <StudioTopBarLeft
        projectName={projectName}
        onUpdateProjectName={onUpdateProjectName}
        dimensions={dimensions}
        onChangeDimensions={onChangeDimensions}
        mode={mode}
        onChangeMode={onChangeMode}
      />

      {/* Center: History Undo/Redo & Cursor Transform Tools */}
      <CursorToolControls
        cursorMode={cursorMode}
        onChangeCursorMode={onChangeCursorMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      {/* Right: History Status Indicator & Accessible Shortcuts Button */}
      <div className="flex items-center gap-2 shrink-0">
        {historyFeedback && (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary border border-primary/20 rounded text-[11px] font-medium animate-fade-in">
            <FiCheck className="w-3 h-3" />
            <span>{historyFeedback}</span>
          </div>
        )}

        <button
          onClick={onOpenShortcutsModal}
          className="px-2.5 py-1.5 bg-background hover:bg-surface border border-border hover:border-primary rounded text-text-main font-medium flex items-center gap-1.5 cursor-pointer text-xs transition-colors shadow-2xs"
          title="Open Studio Keyboard Shortcuts (?)"
        >
          <FiCommand className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Shortcuts</span>
          <kbd className="hidden md:inline px-1 py-0.2 bg-surface border border-border rounded text-[10px] text-text-muted font-mono font-bold">
            ?
          </kbd>
        </button>
      </div>
    </div>
  );
};
