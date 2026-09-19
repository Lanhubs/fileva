import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiDownload,
  FiCrop,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  LuFlipHorizontal,
  LuFlipVertical,
} from 'react-icons/lu';
import { ImageFileState, AspectRatioOption, SupportedFormat, CropArea } from '../../types';
import { exportCroppedImage, CropExportOptions } from './cropper-engine';
import { downloadBlob, replaceFileExtension, formatBytes } from '../../lib/file-utils';
import { DropZone } from '../../components/common/DropZone';

interface ImageCropperProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState<SupportedFormat>('image/png');
  const [quality, setQuality] = useState(0.9);
  const [isExporting, setIsExporting] = useState(false);

  // Normalized crop box in percentage (0 to 100)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  // Drag interaction state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragActionRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initBox: typeof cropBox }>({
    startX: 0,
    startY: 0,
    initBox: cropBox,
  });

  // Calculate ratio number from option
  const getRatioValue = useCallback((ratio: AspectRatioOption): number | null => {
    switch (ratio) {
      case '1:1': return 1;
      case '16:9': return 16 / 9;
      case '4:3': return 4 / 3;
      case '3:2': return 3 / 2;
      case '2:3': return 2 / 3;
      case '9:16': return 9 / 16;
      case '21:9': return 21 / 9;
      default: return null;
    }
  }, []);

  // Reset crop to center with given ratio
  const applyAspectRatio = useCallback((ratio: AspectRatioOption) => {
    setAspectRatio(ratio);
    if (!imageFile) return;

    const r = getRatioValue(ratio);
    if (!r) {
      setCropBox({ x: 10, y: 10, w: 80, h: 80 });
      return;
    }

    const imgRatio = imageFile.width / imageFile.height;
    // We want cropBox in percentage coords where w% and h% map to (w * imgW) / (h * imgH) = r
    // Thus (w / h) * imgRatio = r => w / h = r / imgRatio
    const boxRatio = r / imgRatio;

    let w = 80;
    let h = w / boxRatio;

    if (h > 90) {
      h = 90;
      w = h * boxRatio;
    }
    if (w > 90) {
      w = 90;
      h = w / boxRatio;
    }

    const x = Math.max(0, (100 - w) / 2);
    const y = Math.max(0, (100 - h) / 2);

    setCropBox({ x, y, w, h });
  }, [imageFile, getRatioValue]);

  // Reset when image changes
  useEffect(() => {
    if (imageFile) {
      applyAspectRatio('free');
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
    }
  }, [imageFile, applyAspectRatio]);

  // Pointer drag handling for mouse & touch
  const handlePointerDown = (action: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    dragActionRef.current = action;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initBox: { ...cropBox },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragActionRef.current || !containerRef.current) return;
    e.preventDefault();

    const rect = containerRef.current.getBoundingClientRect();
    const deltaXPct = ((e.clientX - dragStartRef.current.startX) / rect.width) * 100;
    const deltaYPct = ((e.clientY - dragStartRef.current.startY) / rect.height) * 100;

    const { initBox } = dragStartRef.current;
    const ratio = getRatioValue(aspectRatio);
    const imgRatio = imageFile ? imageFile.width / imageFile.height : 1;
    const boxRatioMultiplier = ratio ? ratio / imgRatio : null;

    let newX = initBox.x;
    let newY = initBox.y;
    let newW = initBox.w;
    let newH = initBox.h;

    const minPct = 5;

    switch (dragActionRef.current) {
      case 'move':
        newX = Math.min(Math.max(0, initBox.x + deltaXPct), 100 - initBox.w);
        newY = Math.min(Math.max(0, initBox.y + deltaYPct), 100 - initBox.h);
        break;

      case 'e':
        newW = Math.min(Math.max(minPct, initBox.w + deltaXPct), 100 - initBox.x);
        if (boxRatioMultiplier) {
          newH = Math.min(newW / boxRatioMultiplier, 100 - initBox.y);
          newW = newH * boxRatioMultiplier;
        }
        break;

      case 'w': {
        const potentialW = Math.max(minPct, initBox.w - deltaXPct);
        const maxAllowedW = initBox.x + initBox.w;
        newW = Math.min(potentialW, maxAllowedW);
        newX = initBox.x + (initBox.w - newW);
        if (boxRatioMultiplier) {
          newH = Math.min(newW / boxRatioMultiplier, 100 - initBox.y);
          newW = newH * boxRatioMultiplier;
          newX = initBox.x + (initBox.w - newW);
        }
        break;
      }

      case 's':
        newH = Math.min(Math.max(minPct, initBox.h + deltaYPct), 100 - initBox.y);
        if (boxRatioMultiplier) {
          newW = Math.min(newH * boxRatioMultiplier, 100 - initBox.x);
          newH = newW / boxRatioMultiplier;
        }
        break;

      case 'n': {
        const potentialH = Math.max(minPct, initBox.h - deltaYPct);
        const maxAllowedH = initBox.y + initBox.h;
        newH = Math.min(potentialH, maxAllowedH);
        newY = initBox.y + (initBox.h - newH);
        if (boxRatioMultiplier) {
          newW = Math.min(newH * boxRatioMultiplier, 100 - initBox.x);
          newH = newW / boxRatioMultiplier;
          newY = initBox.y + (initBox.h - newH);
        }
        break;
      }

      case 'se':
        newW = Math.min(Math.max(minPct, initBox.w + deltaXPct), 100 - initBox.x);
        newH = Math.min(Math.max(minPct, initBox.h + deltaYPct), 100 - initBox.y);
        if (boxRatioMultiplier) {
          const wBasedH = newW / boxRatioMultiplier;
          if (wBasedH <= 100 - initBox.y) {
            newH = wBasedH;
          } else {
            newH = 100 - initBox.y;
            newW = newH * boxRatioMultiplier;
          }
        }
        break;
    }

    setCropBox({
      x: Math.max(0, Math.min(100 - newW, newX)),
      y: Math.max(0, Math.min(100 - newH, newY)),
      w: Math.max(minPct, Math.min(100, newW)),
      h: Math.max(minPct, Math.min(100, newH)),
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragActionRef.current) {
      dragActionRef.current = null;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
    }
  };

  // Convert percentage crop to absolute image pixels
  const getAbsoluteCropPixels = (): CropArea => {
    if (!imageFile) return { x: 0, y: 0, width: 0, height: 0 };
    return {
      x: Math.round((cropBox.x / 100) * imageFile.width),
      y: Math.round((cropBox.y / 100) * imageFile.height),
      width: Math.round((cropBox.w / 100) * imageFile.width),
      height: Math.round((cropBox.h / 100) * imageFile.height),
    };
  };

  const cropPixels = getAbsoluteCropPixels();

  const handleExport = async () => {
    if (!imageFile || isExporting) return;
    setIsExporting(true);

    try {
      const options: CropExportOptions = {
        format,
        quality,
        rotationDegrees: rotation,
        flipH,
        flipV,
      };

      const res = await exportCroppedImage(
        imageFile.objectUrl,
        imageFile.width,
        imageFile.height,
        cropPixels,
        options
      );

      let ext = 'png';
      if (format === 'image/jpeg') ext = 'jpg';
      else if (format === 'image/webp') ext = 'webp';

      const filename = replaceFileExtension(imageFile.name, `cropped.${ext}`);
      downloadBlob(res.blob, filename);
    } catch (err) {
      console.error('Export error', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!imageFile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-border bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-main mb-1">
            Image Cropper
          </h2>
          <p className="text-xs text-text-muted mb-6">
            Pixel-accurate crop box with aspect ratios, 90° rotation, horizontal/vertical flipping, and high-res canvas export.
          </p>
          <DropZone onFileSelected={onFileSelect} acceptText="PNG, JPEG, WebP, AVIF, BMP" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Crop Configuration */}
        <div className="lg:col-span-1 space-y-5 border border-border bg-surface rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
              <FiCrop className="w-4 h-4 text-primary" /> Crop Parameters
            </h3>
            <button
              onClick={onClear}
              className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" /> Change
            </button>
          </div>

          {/* Output Dimensions Display */}
          <div className="p-3 rounded bg-background border border-border space-y-1">
            <div className="text-[11px] font-mono text-text-muted uppercase">Crop Dimensions</div>
            <div className="text-lg font-bold font-mono text-text-main">
              {cropPixels.width} × {cropPixels.height} px
            </div>
            <div className="text-[11px] font-mono text-text-muted">
              Origin: X {cropPixels.x}, Y {cropPixels.y}
            </div>
          </div>

          {/* Aspect Ratio Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-main">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
              {[
                { id: 'free', label: 'Free' },
                { id: '1:1', label: '1:1' },
                { id: '16:9', label: '16:9' },
                { id: '4:3', label: '4:3' },
                { id: '3:2', label: '3:2' },
                { id: '2:3', label: '2:3' },
                { id: '9:16', label: '9:16' },
                { id: '21:9', label: '21:9' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => applyAspectRatio(r.id as AspectRatioOption)}
                  className={`py-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                    aspectRatio === r.id
                      ? 'border-primary bg-primary-light text-primary font-bold'
                      : 'border-border text-text-main hover:bg-background'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transform Controls (Flips) */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-text-main">
              Transformations
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFlipH(!flipH)}
                className={`py-1.5 px-3 rounded border font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  flipH
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                <LuFlipHorizontal className="w-3.5 h-3.5 text-primary" />
                <span>Flip Horizontal</span>
              </button>

              <button
                type="button"
                onClick={() => setFlipV(!flipV)}
                className={`py-1.5 px-3 rounded border font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  flipV
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                <LuFlipVertical className="w-3.5 h-3.5 text-primary" />
                <span>Flip Vertical</span>
              </button>
            </div>
          </div>

          {/* Export Format & Quality */}
          <div className="space-y-3 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-text-main">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
              {[
                { id: 'image/png' as SupportedFormat, label: 'PNG' },
                { id: 'image/jpeg' as SupportedFormat, label: 'JPEG' },
                { id: 'image/webp' as SupportedFormat, label: 'WebP' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={`py-1.5 rounded border text-center font-medium transition-colors cursor-pointer ${
                    format === f.id
                      ? 'border-primary bg-primary-light text-primary font-bold'
                      : 'border-border text-text-main hover:bg-background'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {format !== 'image/png' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-muted">Export Quality:</span>
                  <span className="font-bold text-text-main">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(Number(e.target.value) / 100)}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Download Button */}
          <div className="pt-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
            >
              <FiDownload className="w-4 h-4" />
              <span>{isExporting ? 'Cropping Canvas...' : 'Download Cropped Image'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Canvas Stage */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Interactive Crop Box (Drag handles or pan center)</span>
            <span>Source: {imageFile.width}×{imageFile.height}px</span>
          </div>

          <div
            ref={containerRef}
            id="cropper-stage"
            className="relative border border-border bg-[#181716] rounded-lg h-96 sm:h-125 flex items-center justify-center p-4 overflow-hidden select-none touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
                onPointerDown={(e) => handlePointerDown('move', e)}
              >
                {/* Rule of Thirds Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-r border-b border-white/30" />
                  <div className="border-b border-white/30" />
                  <div className="border-r border-white/30" />
                  <div className="border-r border-white/30" />
                  <div />
                </div>

                {/* Resize Handles */}
                {/* Corner SE */}
                <div
                  className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border border-slate-900 cursor-se-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('se', e)}
                />
                {/* Right Edge E */}
                <div
                  className="absolute top-1/2 -right-2 -translate-y-1/2 w-3 h-5 bg-white border border-slate-900 cursor-e-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('e', e)}
                />
                {/* Bottom Edge S */}
                <div
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border border-slate-900 cursor-s-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('s', e)}
                />
                {/* Left Edge W */}
                <div
                  className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-5 bg-white border border-slate-900 cursor-w-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('w', e)}
                />
                {/* Top Edge N */}
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-3 bg-white border border-slate-900 cursor-n-resize touch-none"
                  onPointerDown={(e) => handlePointerDown('n', e)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
