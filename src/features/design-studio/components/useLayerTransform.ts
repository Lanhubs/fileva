import { useCallback } from 'react';
import { Layer } from '../types';
import { DragState, ResizeState, SnapGuides } from './canvas-types';

interface UseLayerTransformProps {
  selectedLayer: Layer | null;
  dragState: DragState | null;
  resizeState: ResizeState | null;
  zoom: number;
  showGuides: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onUpdateLayer: (updated: Layer) => void;
  setSnapGuides: (guides: SnapGuides) => void;
}

export function useLayerTransform({
  selectedLayer,
  dragState,
  resizeState,
  zoom,
  showGuides,
  canvasWidth,
  canvasHeight,
  onUpdateLayer,
  setSnapGuides,
}: UseLayerTransformProps) {
  const handlePointerDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!selectedLayer || !dragState || dragState.layerId !== selectedLayer.id) return;

      const deltaClientX = e.clientX - dragState.startX;
      const deltaClientY = e.clientY - dragState.startY;
      let newX = Math.round(dragState.initialLayerX + deltaClientX * (1 / zoom));
      let newY = Math.round(dragState.initialLayerY + deltaClientY * (1 / zoom));
      const currentGuides: SnapGuides = {};

      if (showGuides) {
        const centerX = (canvasWidth - selectedLayer.width) / 2;
        const centerY = (canvasHeight - selectedLayer.height) / 2;
        if (Math.abs(newX - centerX) < 18) {
          newX = Math.round(centerX);
          currentGuides.x = canvasWidth / 2;
        }
        if (Math.abs(newY - centerY) < 18) {
          newY = Math.round(centerY);
          currentGuides.y = canvasHeight / 2;
        }
      }

      setSnapGuides(currentGuides);
      onUpdateLayer({ ...selectedLayer, x: newX, y: newY });
    },
    [selectedLayer, dragState, zoom, showGuides, canvasWidth, canvasHeight, onUpdateLayer, setSnapGuides]
  );

  const handlePointerResizeMove = useCallback(
    (e: React.PointerEvent) => {
      if (!selectedLayer || !resizeState || resizeState.layerId !== selectedLayer.id) return;

      const deltaClientX = (e.clientX - resizeState.startX) / zoom;
      const deltaClientY = (e.clientY - resizeState.startY) / zoom;
      let newX = resizeState.initialX;
      let newY = resizeState.initialY;
      let newW = resizeState.initialW;
      let newH = resizeState.initialH;

      const isDevice = selectedLayer.type === 'device';
      const aspect = resizeState.initialH / resizeState.initialW;

      if (resizeState.handle === 'br') {
        newW = Math.max(80, resizeState.initialW + deltaClientX);
        newH = isDevice ? newW * aspect : Math.max(40, resizeState.initialH + deltaClientY);
      } else if (resizeState.handle === 'bl') {
        newW = Math.max(80, resizeState.initialW - deltaClientX);
        newX = resizeState.initialX + (resizeState.initialW - newW);
        newH = isDevice ? newW * aspect : Math.max(40, resizeState.initialH + deltaClientY);
      } else if (resizeState.handle === 'tr') {
        newW = Math.max(80, resizeState.initialW + deltaClientX);
        newH = isDevice ? newW * aspect : Math.max(40, resizeState.initialH - deltaClientY);
        newY = resizeState.initialY + (resizeState.initialH - newH);
      } else if (resizeState.handle === 'tl') {
        newW = Math.max(80, resizeState.initialW - deltaClientX);
        newX = resizeState.initialX + (resizeState.initialW - newW);
        newH = isDevice ? newW * aspect : Math.max(40, resizeState.initialH - deltaClientY);
        newY = resizeState.initialY + (resizeState.initialH - newH);
      }

      onUpdateLayer({
        ...selectedLayer,
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    },
    [selectedLayer, resizeState, zoom, onUpdateLayer]
  );

  return { handlePointerDragMove, handlePointerResizeMove };
}
