import { useState, useRef, useCallback } from 'react';
import { Layer, CanvasDimensions } from '../types';
import { DragState, ResizeState, SnapGuides, PanOffset } from './canvas-types';
import { StudioCursorMode } from '../cursor-types';
import { useLayerTransform } from './useLayerTransform';

interface UseCanvasInteractionsProps {
  pageLayers: Layer[];
  selectedLayer: Layer | null;
  dimensions: CanvasDimensions;
  zoom: number;
  showGuides: boolean;
  cursorMode: StudioCursorMode;
  onSelectLayer: (layerId: string | null) => void;
  onUpdateLayer: (updated: Layer) => void;
  onZoomChange?: (newZoom: number) => void;
  onCommitHistory?: () => void;
}

export function useCanvasInteractions({
  selectedLayer,
  dimensions,
  zoom,
  showGuides,
  cursorMode,
  onSelectLayer,
  onUpdateLayer,
  onZoomChange,
  onCommitHistory,
}: UseCanvasInteractionsProps) {
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number }>({
    clientX: 0,
    clientY: 0,
    startX: 0,
    startY: 0,
  });

  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);
  const [snapGuides, setSnapGuides] = useState<SnapGuides>({});

  const { handlePointerDragMove, handlePointerResizeMove } = useLayerTransform({
    selectedLayer,
    dragState,
    resizeState,
    zoom,
    showGuides,
    canvasWidth: dimensions.width,
    canvasHeight: dimensions.height,
    onUpdateLayer,
    setSnapGuides,
  });

  const handlePointerDownContainer = (e: React.PointerEvent) => {
    if (cursorMode === 'hand' || e.button === 1 || e.altKey) {
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        startX: panOffset.x,
        startY: panOffset.y,
      };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      return;
    }

    if (cursorMode === 'zoom-in' && onZoomChange) {
      const zoomDelta = e.altKey ? -0.1 : 0.1;
      onZoomChange(Math.max(0.1, Math.min(2.0, Number((zoom + zoomDelta).toFixed(2)))));
      return;
    }

    onSelectLayer(null);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning) {
        setPanOffset({
          x: panStartRef.current.startX + (e.clientX - panStartRef.current.clientX),
          y: panStartRef.current.startY + (e.clientY - panStartRef.current.clientY),
        });
        return;
      }
      handlePointerDragMove(e);
      handlePointerResizeMove(e);
    },
    [isPanning, handlePointerDragMove, handlePointerResizeMove]
  );

  const handlePointerUp = useCallback(() => {
    if (dragState || resizeState) {
      onCommitHistory?.();
    }
    setIsPanning(false);
    setDragState(null);
    setResizeState(null);
    setSnapGuides({});
  }, [dragState, resizeState, onCommitHistory]);

  const handlePointerDownLayer = (e: React.PointerEvent, layer: Layer) => {
    if (cursorMode === 'hand') return;
    if (cursorMode === 'zoom-in' && onZoomChange) {
      const zoomDelta = e.altKey ? -0.1 : 0.1;
      onZoomChange(Math.max(0.1, Math.min(2.0, Number((zoom + zoomDelta).toFixed(2)))));
      return;
    }
    e.stopPropagation();
    onSelectLayer(layer.id);
    if (layer.locked) return;

    setDragState({
      layerId: layer.id,
      startX: e.clientX,
      startY: e.clientY,
      initialLayerX: layer.x,
      initialLayerY: layer.y,
    });
  };

  const handlePointerDownResize = (e: React.PointerEvent, handle: 'tl' | 'tr' | 'bl' | 'br') => {
    if (!selectedLayer || selectedLayer.locked) return;
    e.stopPropagation();

    setResizeState({
      layerId: selectedLayer.id,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: selectedLayer.x,
      initialY: selectedLayer.y,
      initialW: selectedLayer.width,
      initialH: selectedLayer.height,
    });
  };

  return {
    panOffset,
    setPanOffset,
    snapGuides,
    handlePointerDownContainer,
    handlePointerMove,
    handlePointerUp,
    handlePointerDownLayer,
    handlePointerDownResize,
  };
}
