import React from 'react';
import { ImageFileState } from '../../../types';
import { CropBoxState } from '../hooks/useImageCropper';

interface CropperStageProps {
  imageFile: ImageFileState;
  cropBox: CropBoxState;
  flipH: boolean;
  flipV: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPointerDown: (action: string, e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
}

export const CropperStage: React.FC<CropperStageProps> = ({
  imageFile,
  cropBox,
  flipH,
  flipV,
  containerRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-text-muted">
        <span>Interactive Crop Box (Drag handles or pan center)</span>
        <span>Source: {imageFile.width}×{imageFile.height}px</span>
      </div>

      <div
        ref={containerRef}
        id="cropper-stage"
        className="relative border border-border bg-[#181716] rounded-lg h-96 sm:h-125 flex items-center justify-center p-4 overflow-hidden select-none touch-none"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* Display Base Image */}
        <div
          className="relative max-h-full max-w-full inline-block"
          style={{
            transform: `scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
          }}
        >
          <img
            src={imageFile.objectUrl}
            alt="Crop preview target"
            className="max-h-115 max-w-full object-contain pointer-events-none block"
          />

          {/* Crop Box Overlay */}
          <div
            className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] cursor-move touch-none"
            style={{
              left: `${cropBox.x}%`,
              top: `${cropBox.y}%`,
              width: `${cropBox.w}%`,
              height: `${cropBox.h}%`,
            }}
            onPointerDown={(e) => onPointerDown('move', e)}
          >
            {/* Rule of Thirds Grid Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div className="border-r border-b border-white/30" />
              <div />
            </div>

            {/* Resize Handles */}
            {/* Corner SE */}
            <div
              className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-slate-900 cursor-se-resize touch-none"
              onPointerDown={(e) => onPointerDown('se', e)}
            />
            {/* Right Edge E */}
            <div
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-5 bg-white border border-slate-900 cursor-e-resize touch-none"
              onPointerDown={(e) => onPointerDown('e', e)}
            />
            {/* Bottom Edge S */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border border-slate-900 cursor-s-resize touch-none"
              onPointerDown={(e) => onPointerDown('s', e)}
            />
            {/* Left Edge W */}
            <div
              className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-5 bg-white border border-slate-900 cursor-w-resize touch-none"
              onPointerDown={(e) => onPointerDown('w', e)}
            />
            {/* Top Edge N */}
            <div
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border border-slate-900 cursor-n-resize touch-none"
              onPointerDown={(e) => onPointerDown('n', e)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
