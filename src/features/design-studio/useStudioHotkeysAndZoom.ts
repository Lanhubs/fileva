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
  onCopySelectedLayer?: () => void;
  onPasteLayer?: () => void;
  onCutSelectedLayer?: () => void;
  onToggleLayerLock?: () => void;
  onToggleLayerVisibility?: () => void;
  onReorderLayerDepth?: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  onDeselectLayer?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onNudgeSelectedLayer?: (dx: number, dy: number) => void;
  onFitCanvas?: () => void;
  onAddTextLayer?: () => void;
  onAddShapeLayer?: () => void;
  onAddDeviceLayer?: () => void;
  onTogglePreviewMode?: () => void;
  onExportCurrent?: () => void;
  onExportAll?: () => void;
  onOpenShortcutsModal?: () => void;
}

export function useStudioHotkeysAndZoom({
  dimensions,
  setZoom,
  setCursorMode,
  selectedLayerId,
  onDeleteSelectedLayer,
  onDuplicateSelectedLayer,
  onCopySelectedLayer,
  onPasteLayer,
  onCutSelectedLayer,
  onToggleLayerLock,
  onToggleLayerVisibility,
  onReorderLayerDepth,
  onDeselectLayer,
  onUndo,
  onRedo,
  onNudgeSelectedLayer,
  onFitCanvas,
  onAddTextLayer,
  onAddShapeLayer,
  onAddDeviceLayer,
  onTogglePreviewMode,
  onExportCurrent,
  onExportAll,
  onOpenShortcutsModal,
}: UseStudioHotkeysAndZoomProps) {
  useEffect(() => {
    const calcFitZoom = () => {
      const availWidth = window.innerWidth - (window.innerWidth >= 1024 ? 420 : 80);
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
      const activeElement = document.activeElement as HTMLElement | null;
      const activeTag = activeElement?.tagName;
      const isInputActive =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag || '') || activeElement?.isContentEditable;

      // When inside text inputs: Escape blurs input, and plain letters shouldn't trigger shortcuts
      if (isInputActive) {
        if (e.key === 'Escape') {
          activeElement?.blur();
        }
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

      // Copy: Cmd/Ctrl + C
      if (cmdOrCtrl && key === 'c' && selectedLayerId) {
        e.preventDefault();
        onCopySelectedLayer?.();
        return;
      }

      // Paste: Cmd/Ctrl + V
      if (cmdOrCtrl && key === 'v') {
        e.preventDefault();
        onPasteLayer?.();
        return;
      }

      // Cut: Cmd/Ctrl + X
      if (cmdOrCtrl && key === 'x' && selectedLayerId) {
        e.preventDefault();
        onCutSelectedLayer?.();
        return;
      }

      // Duplicate: Cmd/Ctrl + D
      if (cmdOrCtrl && key === 'd' && selectedLayerId) {
        e.preventDefault();
        onDuplicateSelectedLayer?.();
        return;
      }

      // Lock / Unlock: Cmd/Ctrl + L
      if (cmdOrCtrl && key === 'l' && selectedLayerId) {
        e.preventDefault();
        onToggleLayerLock?.();
        return;
      }

      // Visibility: Cmd/Ctrl + Shift + H OR Cmd/Ctrl + H
      if (cmdOrCtrl && (key === 'h' || (key === 'h' && e.shiftKey)) && selectedLayerId) {
        e.preventDefault();
        onToggleLayerVisibility?.();
        return;
      }

      // Export Page: Cmd/Ctrl + S OR Cmd/Ctrl + E
      if (cmdOrCtrl && !e.shiftKey && (key === 's' || key === 'e')) {
        e.preventDefault();
        onExportCurrent?.();
        return;
      }

      // Export All Pages (ZIP): Cmd/Ctrl + Shift + E
      if (cmdOrCtrl && e.shiftKey && key === 'e') {
        e.preventDefault();
        onExportAll?.();
        return;
      }

      // Help / Shortcuts Cheatsheet: ? OR Shift + / OR Cmd/Ctrl + /
      if (key === '?' || (cmdOrCtrl && key === '/')) {
        e.preventDefault();
        onOpenShortcutsModal?.();
        return;
      }

      // Zoom shortcuts: Cmd/Ctrl + (+/-/0/1/2)
      if (cmdOrCtrl && (key === '=' || key === '+')) {
        e.preventDefault();
        setZoom((prev) => Math.min(2.0, Number((prev + 0.05).toFixed(2))));
        return;
      }
      if (cmdOrCtrl && (key === '-' || key === '_')) {
        e.preventDefault();
        setZoom((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))));
        return;
      }
      if (cmdOrCtrl && key === '0') {
        e.preventDefault();
        onFitCanvas?.();
        return;
      }
      if (cmdOrCtrl && key === '1') {
        e.preventDefault();
        setZoom(1.0);
        return;
      }
      if (cmdOrCtrl && key === '2') {
        e.preventDefault();
        setZoom(0.5);
        return;
      }

      // Layer depth reordering: [ and ]
      if (key === '[' && selectedLayerId) {
        e.preventDefault();
        onReorderLayerDepth?.(e.shiftKey ? 'back' : 'backward');
        return;
      }
      if (key === ']' && selectedLayerId) {
        e.preventDefault();
        onReorderLayerDepth?.(e.shiftKey ? 'front' : 'forward');
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

      // Quick Creation shortcuts: T (text), S or R (shape), D or F (device)
      if (key === 't' && !cmdOrCtrl) {
        e.preventDefault();
        onAddTextLayer?.();
        return;
      }
      if ((key === 's' || key === 'r') && !cmdOrCtrl) {
        e.preventDefault();
        onAddShapeLayer?.();
        return;
      }
      if ((key === 'd' || key === 'f') && !cmdOrCtrl && !selectedLayerId) {
        e.preventDefault();
        onAddDeviceLayer?.();
        return;
      }

      // Preview mode: P
      if (key === 'p' && !cmdOrCtrl) {
        e.preventDefault();
        onTogglePreviewMode?.();
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
    onCopySelectedLayer,
    onPasteLayer,
    onCutSelectedLayer,
    onToggleLayerLock,
    onToggleLayerVisibility,
    onReorderLayerDepth,
    onDeselectLayer,
    onUndo,
    onRedo,
    onNudgeSelectedLayer,
    onFitCanvas,
    onAddTextLayer,
    onAddShapeLayer,
    onAddDeviceLayer,
    onTogglePreviewMode,
    onExportCurrent,
    onExportAll,
    onOpenShortcutsModal,
    setCursorMode,
    setZoom,
  ]);
}

