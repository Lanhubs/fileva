import { useEffect } from 'react';
import { StudioCursorMode } from './cursor-types';
import { CanvasDimensions } from './types';

interface UseStudioHotkeysAndZoomProps {
  dimensions: CanvasDimensions;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  setCursorMode: React.Dispatch<React.SetStateAction<StudioCursorMode>>;
  selectedLayerId?: string | null;
  onDeleteSelectedLayer?: () => void;
  onDuplicateSelectedLayer?: () => void;
  onDeselectLayer?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onNudgeSelectedLayer?: (dx: number, dy: number) => void;
  onFitCanvas?: () => void;
}

export function useStudioHotkeysAndZoom({
  dimensions,
  setZoom,
  setCursorMode,
  selectedLayerId,
  onDeleteSelectedLayer,
  onDuplicateSelectedLayer,
  onDeselectLayer,
  onUndo,
  onRedo,
  onNudgeSelectedLayer,
  onFitCanvas,
}: UseStudioHotkeysAndZoomProps) {
  useEffect(() => {
    const calcFitZoom = () => {
      const availWidth = window.innerWidth - (window.innerWidth >= 1024 ? 400 : 80);
      const availHeight = window.innerHeight - 240;
      const fitW = availWidth / dimensions.width;
      const fitH = availHeight / dimensions.height;
      const calculated = Math.min(fitW, fitH, 0.45);
      setZoom(Math.max(0.12, Math.min(1.2, Number(calculated.toFixed(2)))));
    };

    calcFitZoom();
    window.addEventListener('resize', calcFitZoom);
    return () => window.removeEventListener('resize', calcFitZoom);
  }, [dimensions, setZoom]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      const isContentEditable = (e.target as HTMLElement)?.isContentEditable;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const key = e.key.toLowerCase();

      // Undo: Cmd/Ctrl + Z
      if (cmdOrCtrl && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo?.();
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z OR Cmd/Ctrl + Y
      if ((cmdOrCtrl && key === 'z' && e.shiftKey) || (cmdOrCtrl && key === 'y')) {
        e.preventDefault();
        onRedo?.();
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && key === 'd') {
        if (selectedLayerId) {
          e.preventDefault();
          onDuplicateSelectedLayer?.();
        }
        return;
      }

      // Zoom shortcuts: Cmd/Ctrl + (+/-/0)
      if (cmdOrCtrl && (key === '=' || key === '+')) {
        e.preventDefault();
        setZoom((prev) => Math.min(1.5, Number((prev + 0.05).toFixed(2))));
        return;
      }
      if (cmdOrCtrl && key === '-') {
        e.preventDefault();
        setZoom((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))));
        return;
      }
      if (cmdOrCtrl && key === '0') {
        e.preventDefault();
        onFitCanvas?.();
        return;
      }

      // Delete / Backspace
      if (key === 'delete' || key === 'backspace') {
        if (selectedLayerId) {
          e.preventDefault();
          onDeleteSelectedLayer?.();
        }
        return;
      }

      // Escape key to deselect
      if (key === 'escape') {
        onDeselectLayer?.();
        return;
      }

      // Arrow keys to nudge selected layer
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key) && selectedLayerId) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (key === 'arrowup') onNudgeSelectedLayer?.(0, -step);
        else if (key === 'arrowdown') onNudgeSelectedLayer?.(0, step);
        else if (key === 'arrowleft') onNudgeSelectedLayer?.(-step, 0);
        else if (key === 'arrowright') onNudgeSelectedLayer?.(step, 0);
        return;
      }

      // Cursor Tools hotkeys
      if (key === 'v') setCursorMode('select');
      else if (key === 'h') setCursorMode('hand');
      else if (key === 'z') setCursorMode('zoom-in');
      else if (key === 'c') setCursorMode('crosshair');
      else if (e.code === 'Space' && !e.repeat) {
        setCursorMode((prev) => (prev === 'hand' ? 'select' : 'hand'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedLayerId,
    onDeleteSelectedLayer,
    onDuplicateSelectedLayer,
    onDeselectLayer,
    onUndo,
    onRedo,
    onNudgeSelectedLayer,
    onFitCanvas,
    setCursorMode,
    setZoom,
  ]);
}
