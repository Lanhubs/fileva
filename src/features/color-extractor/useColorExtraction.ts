import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageFileState, ExtractedColor } from '../../types';
import {
  extractDominantColors,
  generateCssSnippet,
  generateTailwindSnippet,
  generateJsonSnippet,
  createPaletteImageBlob,
  rgbToHex,
  rgbToHsl,
  getLuminance,
} from '../../lib/color-utils';
import { loadImageElement, downloadBlob, replaceFileExtension } from '../../lib/file-utils';

export function useColorExtraction(imageFile: ImageFileState | null, maxColorCount: number) {
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [hoveredPixel, setHoveredPixel] = useState<{
    x: number;
    y: number;
    color: ExtractedColor;
  } | null>(null);

  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'json'>('css');
  const [showExportModal, setShowExportModal] = useState(false);

  const imageCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setColors([]);
      setHoveredPixel(null);
      return;
    }

    let isMounted = true;
    setIsExtracting(true);

    const runExtraction = async () => {
      try {
        const img = await loadImageElement(imageFile.objectUrl);

        const canvas = document.createElement('canvas');
        canvas.width = imageFile.width;
        canvas.height = imageFile.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, imageFile.width, imageFile.height);
          imageCanvasRef.current = canvas;
        }

        const palette = await extractDominantColors(img, maxColorCount);
        if (isMounted) {
          setColors(palette);
        }
      } catch (err) {
        console.error('Color extraction error', err);
      } finally {
        if (isMounted) setIsExtracting(false);
      }
    };

    const timer = setTimeout(runExtraction, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageFile, maxColorCount]);

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const handleNativeEyeDropper = useCallback(async () => {
    if (!('EyeDropper' in window)) return;
    try {
      // @ts-expect-error EyeDropper is experimental browser API
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result && result.sRGBHex) {
        copyToClipboard(result.sRGBHex, 'native-eyedropper');
      }
    } catch {
      // User cancelled
    }
  }, [copyToClipboard]);

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!imageCanvasRef.current || !imageFile) return;

      const img = e.currentTarget;
      const rect = img.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width;
      const yRatio = (e.clientY - rect.top) / rect.height;

      const pixelX = Math.min(imageFile.width - 1, Math.max(0, Math.floor(xRatio * imageFile.width)));
      const pixelY = Math.min(imageFile.height - 1, Math.max(0, Math.floor(yRatio * imageFile.height)));

      const ctx = imageCanvasRef.current.getContext('2d');
      if (!ctx) return;

      const p = ctx.getImageData(pixelX, pixelY, 1, 1).data;
      const hex = rgbToHex(p[0], p[1], p[2]);
      const hsl = rgbToHsl(p[0], p[1], p[2]);
      const isLight = getLuminance(p[0], p[1], p[2]) > 0.45;

      setHoveredPixel({
        x: pixelX,
        y: pixelY,
        color: {
          hex,
          rgb: { r: p[0], g: p[1], b: p[2] },
          hsl,
          percentage: 0,
          isLight,
        },
      });
    },
    [imageFile]
  );

  const handleDownloadPaletteImage = useCallback(async () => {
    if (colors.length === 0 || !imageFile) return;
    try {
      const blob = await createPaletteImageBlob(colors);
      const filename = replaceFileExtension(imageFile.name, 'palette.png');
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Palette download error', err);
    }
  }, [colors, imageFile]);

  const getExportCode = useCallback(() => {
    switch (exportFormat) {
      case 'css':
        return generateCssSnippet(colors);
      case 'tailwind':
        return generateTailwindSnippet(colors);
      case 'json':
        return generateJsonSnippet(colors);
    }
  }, [exportFormat, colors]);

  return {
    colors,
    isExtracting,
    copiedKey,
    hoveredPixel,
    exportFormat,
    setExportFormat,
    showExportModal,
    setShowExportModal,
    copyToClipboard,
    handleNativeEyeDropper,
    handleImageMouseMove,
    handleDownloadPaletteImage,
    getExportCode,
  };
}
