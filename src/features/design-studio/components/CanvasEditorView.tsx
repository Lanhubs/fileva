import React, { useRef, useEffect } from 'react';
import { CanvasPage, CanvasDimensions, Layer, DesignAsset } from '../types';
import { StudioCursorMode } from '../cursor-types';
import { renderPageToCanvas } from '../export-engine';
import { subscribeToFontLoad } from '../font-loader';
import { useCanvasInteractions } from './useCanvasInteractions';
import { CanvasInteractiveOverlay } from './CanvasInteractiveOverlay';

interface CanvasEditorViewProps {
  page: CanvasPage;
  dimensions: CanvasDimensions;
  assets: DesignAsset[];
  selectedLayerId: string | null;
  onSelectLayer: (layerId: string | null) => void;
  onUpdateLayer: (updated: Layer) => void;
  zoom: number;
  previewMode: boolean;
  showGuides: boolean;
  cursorMode?: StudioCursorMode;
  onZoomChange?: (newZoom: number) => void;
}

export const CanvasEditorView: React.FC<CanvasEditorViewProps> = ({
  page,
  dimensions,
  assets,
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer,
  zoom,
  previewMode,
  showGuides,
  cursorMode = 'select',
  onZoomChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedLayer = page.layers.find((l) => l.id === selectedLayerId) || null;

  const {
    panOffset,
    setPanOffset,
    snapGuides,
    handlePointerDownContainer,
    handlePointerMove,
    handlePointerUp,
    handlePointerDownLayer,
    handlePointerDownResize,
  } = useCanvasInteractions({
    pageLayers: page.layers,
    selectedLayer,
    dimensions,
    zoom,
    showGuides,
    cursorMode,
    onSelectLayer,
    onUpdateLayer,
    onZoomChange,
  });

  // Re-render HTML5 Canvas output when page state, dimensions, or assets update, or when a font finishes loading
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!canvasRef.current) return;
      try {
        await renderPageToCanvas(page, dimensions, assets, canvasRef.current);
      } catch (err) {
        if (!isCancelled) {
          console.error('Error rendering preview canvas:', err);
        }
      }
    };

    render();

    const unsubscribe = subscribeToFontLoad(() => {
      if (!isCancelled) {
        render();
      }
    });

    return () => {
      isCancelled = true;
      unsubscribe();
    };
  }, [page, dimensions, assets]);

  return (
    <div
      ref={containerRef}
      id="design-studio-canvas-container"
      onPointerDown={handlePointerDownContainer}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`flex-1 h-full w-full relative overflow-hidden flex items-center justify-center select-none bg-neutral-900/90 ${
        cursorMode === 'hand'
          ? 'cursor-grab active:cursor-grabbing'
          : cursorMode === 'crosshair'
          ? 'cursor-crosshair'
          : cursorMode === 'zoom-in'
          ? 'cursor-zoom-in'
          : 'cursor-default'
      }`}
    >
      <div
        id="canvas-artboard-wrapper"
        className="relative origin-center shadow-2xl transition-transform duration-75 shrink-0"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
        }}
        onClick={(e) => {
          if (cursorMode !== 'hand') {
            e.stopPropagation();
          }
        }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block"
        />

        {showGuides && !previewMode && (
          <>
            {snapGuides.x !== undefined && (
              <div
                className="absolute top-0 bottom-0 border-l border-dashed border-primary z-50 pointer-events-none"
                style={{ left: `${snapGuides.x}px` }}
              />
            )}
            {snapGuides.y !== undefined && (
              <div
                className="absolute left-0 right-0 border-t border-dashed border-primary z-50 pointer-events-none"
                style={{ top: `${snapGuides.y}px` }}
              />
            )}
          </>
        )}

        <CanvasInteractiveOverlay
          layers={page.layers}
          selectedLayerId={selectedLayerId}
          cursorMode={cursorMode}
          previewMode={previewMode}
          onPointerDownLayer={handlePointerDownLayer}
          onPointerDownResize={handlePointerDownResize}
        />
      </div>

      {(panOffset.x !== 0 || panOffset.y !== 0) && (
        <button
          onClick={() => setPanOffset({ x: 0, y: 0 })}
          className="absolute bottom-4 left-4 bg-surface/90 hover:bg-surface border border-border rounded px-2.5 py-1 text-[11px] font-mono text-text-muted hover:text-text-main shadow-xs backdrop-blur-xs cursor-pointer z-20 flex items-center gap-1.5"
          title="Reset board position to center"
        >
          <span>Recenter Board</span>
        </button>
      )}
    </div>
  );
};
