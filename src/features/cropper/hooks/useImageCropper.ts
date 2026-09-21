import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ImageFileState, AspectRatioOption, SupportedFormat, CropArea } from '../../../types';
import { exportCroppedImage, CropExportOptions } from '../cropper-engine';
import { downloadBlob, replaceFileExtension } from '../../../lib/file-utils';

export interface CropBoxState {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function useImageCropper(imageFile: ImageFileState | null) {
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [format, setFormat] = useState<SupportedFormat>('image/png');
  const [quality, setQuality] = useState(0.9);
  const [isExporting, setIsExporting] = useState(false);

  // Normalized crop box in percentage (0 to 100)
  const [cropBox, setCropBox] = useState<CropBoxState>({
    x: 10,
    y: 10,
    w: 80,
    h: 80,
  });

  // Drag interaction state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragActionRef = useRef<string | null>(null);
  const dragStartRef = useRef<{ startX: number; startY: number; initBox: CropBoxState }>({
    startX: 0,
    startY: 0,
    initBox: cropBox,
  });

  // Calculate ratio number from option
  const getRatioValue = useCallback((ratio: AspectRatioOption): number | null => {
    switch (ratio) {
      case '1:1':
        return 1;
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      case '3:2':
        return 3 / 2;
      case '2:3':
        return 2 / 3;
      case '9:16':
        return 9 / 16;
      case '21:9':
        return 21 / 9;
      default:
        return null;
    }
  }, []);

  // Reset crop to center with given ratio
  const applyAspectRatio = useCallback(
    (ratio: AspectRatioOption) => {
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
    },
    [imageFile, getRatioValue]
  );

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
  const getAbsoluteCropPixels = useCallback((): CropArea => {
    if (!imageFile) return { x: 0, y: 0, width: 0, height: 0 };
    return {
      x: Math.round((cropBox.x / 100) * imageFile.width),
      y: Math.round((cropBox.y / 100) * imageFile.height),
      width: Math.round((cropBox.w / 100) * imageFile.width),
      height: Math.round((cropBox.h / 100) * imageFile.height),
    };
  }, [cropBox, imageFile]);

  const cropPixels = getAbsoluteCropPixels();

  const handleExport = useCallback(async () => {
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
  }, [imageFile, isExporting, format, quality, rotation, flipH, flipV, cropPixels]);

  return {
    aspectRatio,
    applyAspectRatio,
    rotation,
    setRotation,
    flipH,
    setFlipH,
    flipV,
    setFlipV,
    format,
    setFormat,
    quality,
    setQuality,
    isExporting,
    cropBox,
    cropPixels,
    containerRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleExport,
  };
}
