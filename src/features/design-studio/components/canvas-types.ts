import { Layer } from '../types';

export interface DragState {
  layerId: string;
  startX: number;
  startY: number;
  initialLayerX: number;
  initialLayerY: number;
}

export interface ResizeState {
  layerId: string;
  handle: 'tl' | 'tr' | 'bl' | 'br';
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
}

export interface PanOffset {
  x: number;
  y: number;
}

export interface SnapGuides {
  x?: number;
  y?: number;
}

export interface LayerHandlesProps {
  isSelected: boolean;
  isLocked: boolean;
  onResizeStart: (e: React.PointerEvent, handle: 'tl' | 'tr' | 'bl' | 'br') => void;
}
