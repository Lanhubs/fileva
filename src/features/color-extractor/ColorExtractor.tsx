import React, { useState, useEffect, useRef } from 'react';
import {
  FiCopy,
  FiCheck,
  FiDownload,
  FiCode,
  FiRefreshCw,
  FiEye,
  FiCrosshair,
  FiFileText,
} from 'react-icons/fi';
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
import { checkBrowserCapabilities } from '../../lib/browser-support';
import { DropZone } from '../../components/common/DropZone';

interface ColorExtractorProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ColorExtractor: React.FC<ColorExtractorProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  const capabilities = checkBrowserCapabilities();

  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [maxColorCount, setMaxColorCount] = useState(8);
  const [isExtracting, setIsExtracting] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Loupe / Pixel inspection state
  const [hoveredPixel, setHoveredPixel] = useState<{
    x: number;
    y: number;
    color: ExtractedColor;
  } | null>(null);

  // Export snippet format: 'css' | 'tailwind' | 'json'
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

        // Prepare full-size canvas for pixel inspection
        const canvas = document.createElement('canvas');
        canvas.width = imageFile.width;
        canvas.height = imageFile.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0, imageFile.width, imageFile.height);
          imageCanvasRef.current = canvas;
        }

        // Run spatial quantization
        const palette = await extractDominantColors(img, maxColorCount);
        if (isMounted) {
          setColors(palette);
        }
      } catch (err) {
        console.error('Extraction error', err);
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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNativeEyeDropper = async () => {
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
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
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
  };

  const handleDownloadPaletteImage = async () => {
    if (colors.length === 0 || !imageFile) return;
    try {
      const blob = await createPaletteImageBlob(colors);
      const filename = replaceFileExtension(imageFile.name, 'palette.png');
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Palette download error', err);
    }
  };

  const getExportCode = () => {
    switch (exportFormat) {
      case 'css':
        return generateCssSnippet(colors);
      case 'tailwind':
        return generateTailwindSnippet(colors);
      case 'json':
        return generateJsonSnippet(colors);
    }
  };

  if (!imageFile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-border bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-main mb-1">
            Color Extractor & Palette Detector
          </h2>
          <p className="text-xs text-text-muted mb-6">
            Detect dominant colors with spatial quantization, inspect individual pixels, and export to CSS variables, Tailwind, or JSON.
          </p>
          <DropZone onFileSelected={onFileSelect} acceptText="PNG, JPEG, WebP, SVG, BMP" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border border-border bg-surface rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-text-muted">Palette Size:</span>
            <div className="flex border border-border rounded p-0.5 bg-background">
              {[5, 8, 12].map((num) => (
                <button
                  key={num}
                  onClick={() => setMaxColorCount(num)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors cursor-pointer ${
                    maxColorCount === num
                      ? 'bg-surface text-text-main shadow-none font-bold'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {num} Colors
                </button>
              ))}
            </div>
          </div>

          {capabilities.supportsEyeDropper && (
            <button
              onClick={handleNativeEyeDropper}
              className="py-1.5 px-3 rounded border border-border hover:bg-background text-xs font-medium text-text-main flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FiCrosshair className="w-3.5 h-3.5 text-primary" />
              <span>Desktop EyeDropper</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(!showExportModal)}
            className="py-1.5 px-3 bg-surface hover:bg-background text-text-main rounded text-xs font-medium flex items-center gap-1.5 border border-border transition-colors cursor-pointer"
          >
            <FiCode className="w-3.5 h-3.5 text-primary" />
            <span>Export Code</span>
          </button>

          <button
            onClick={handleDownloadPaletteImage}
            className="py-1.5 px-3 bg-primary hover:bg-primary-hover text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span>Download PNG Swatch</span>
          </button>

          <button
            onClick={onClear}
            className="p-1.5 text-text-muted hover:text-rose-600 cursor-pointer transition-colors"
            title="Change image"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Code Export Drawer */}
      {showExportModal && (
        <div className="border border-border bg-surface text-text-main rounded-lg p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-text-muted">Export Format:</span>
              <div className="flex gap-1">
                {(['css', 'tailwind', 'json'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`px-2 py-0.5 rounded text-[11px] uppercase cursor-pointer ${
                      exportFormat === fmt ? 'bg-primary text-white font-bold' : 'bg-background text-text-muted border border-border'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => copyToClipboard(getExportCode(), 'export-code')}
              className="px-2.5 py-1 rounded bg-background hover:bg-surface border border-border text-text-main flex items-center gap-1 cursor-pointer"
            >
              {copiedKey === 'export-code' ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
              <span>{copiedKey === 'export-code' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-3 bg-background border border-border rounded overflow-x-auto text-[11px] leading-relaxed text-text-main max-h-48 font-mono">
            {getExportCode()}
          </pre>
        </div>
      )}

      {/* Dominant Palette Swatches Bar */}
      <div className="border border-border bg-surface rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
            Dominant Color Swatches (Click to copy HEX)
          </h3>
          {isExtracting && (
            <span className="text-xs font-mono text-primary">Quantizing colors...</span>
          )}
        </div>

        {/* Continuous Palette Spectrum Bar */}
        <div className="h-12 w-full flex rounded overflow-hidden border border-border">
          {colors.map((c, i) => (
            <button
              key={c.hex + i}
              onClick={() => copyToClipboard(c.hex, `spectrum-${i}`)}
              style={{ backgroundColor: c.hex, width: `${Math.max(5, c.percentage)}%` }}
              className="h-full group relative focus:outline-hidden transition-all hover:brightness-110 cursor-pointer"
              title={`${c.hex} (${c.percentage}%) - Click to copy`}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold transition-opacity">
                <span
                  className="px-1 py-0.5 rounded shadow-xs flex items-center gap-1"
                  style={{
                    backgroundColor: c.isLight ? '#1A1817' : '#FFFFFF',
                    color: c.isLight ? '#FFFFFF' : '#1A1817',
                  }}
                >
                  {copiedKey === `spectrum-${i}` ? <FiCheck className="w-3 h-3" /> : c.hex}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Grid of Color Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {colors.map((color, index) => (
            <div
              key={color.hex + index}
              className="p-3 border border-border rounded bg-background space-y-2"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded border border-border shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => copyToClipboard(color.hex, `hex-${index}`)}
                      className="font-mono text-xs font-bold text-text-main hover:text-primary flex items-center gap-1 truncate cursor-pointer"
                    >
                      <span>{color.hex}</span>
                      {copiedKey === `hex-${index}` ? (
                        <FiCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      ) : (
                        <FiCopy className="w-3 h-3 text-text-muted shrink-0" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-text-muted block">
                    {color.percentage}% prominence
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border text-[11px] font-mono text-text-muted space-y-1">
                <div
                  onClick={() =>
                    copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, `rgb-${index}`)
                  }
                  className="flex justify-between cursor-pointer hover:text-text-main transition-colors"
                  title="Copy RGB"
                >
                  <span className="text-text-muted">RGB:</span>
                  <span>
                    {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                  </span>
                </div>
                <div
                  onClick={() =>
                    copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`, `hsl-${index}`)
                  }
                  className="flex justify-between cursor-pointer hover:text-text-main transition-colors"
                  title="Copy HSL"
                >
                  <span className="text-text-muted">HSL:</span>
                  <span>
                    {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Loupe & Pixel Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-border bg-surface rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Interactive Pixel Loupe (Hover over image to inspect)</span>
            <span>{imageFile.width}×{imageFile.height}px</span>
          </div>

          <div className="rounded border border-border h-80 sm:h-96 flex items-center justify-center p-2 bg-background overflow-hidden relative cursor-crosshair">
            <img
              src={imageFile.objectUrl}
              alt="Source inspected"
              onMouseMove={handleImageMouseMove}
              onClick={() => {
                if (hoveredPixel) {
                  copyToClipboard(hoveredPixel.color.hex, 'loupe-click');
                }
              }}
              className="max-h-full max-w-full object-contain select-none"
            />
          </div>
        </div>

        {/* Loupe Inspector Box */}
        <div className="lg:col-span-1 border border-border bg-surface rounded-lg p-5 space-y-4">
          <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted font-bold">
            Pixel Coordinates & Values
          </h4>

          {hoveredPixel ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-16 h-16 rounded border border-border shrink-0"
                  style={{ backgroundColor: hoveredPixel.color.hex }}
                />
                <div>
                  <div className="text-lg font-bold font-mono text-text-main">
                    {hoveredPixel.color.hex}
                  </div>
                  <div className="text-xs font-mono text-text-muted">
                    X: {hoveredPixel.x}, Y: {hoveredPixel.y}
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <button
                  onClick={() => copyToClipboard(hoveredPixel.color.hex, 'inspect-hex')}
                  className="w-full p-2 rounded bg-background border border-border hover:bg-surface flex items-center justify-between cursor-pointer"
                >
                  <span className="text-text-muted">HEX</span>
                  <span className="font-bold text-text-main">
                    {hoveredPixel.color.hex}
                  </span>
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `rgb(${hoveredPixel.color.rgb.r}, ${hoveredPixel.color.rgb.g}, ${hoveredPixel.color.rgb.b})`,
                      'inspect-rgb'
                    )
                  }
                  className="w-full p-2 rounded bg-background border border-border hover:bg-surface flex items-center justify-between cursor-pointer"
                >
                  <span className="text-text-muted">RGB</span>
                  <span className="font-bold text-text-main">
                    {hoveredPixel.color.rgb.r}, {hoveredPixel.color.rgb.g}, {hoveredPixel.color.rgb.b}
                  </span>
                </button>

                <button
                  onClick={() =>
                    copyToClipboard(
                      `hsl(${hoveredPixel.color.hsl.h}, ${hoveredPixel.color.hsl.s}%, ${hoveredPixel.color.hsl.l}%)`,
                      'inspect-hsl'
                    )
                  }
                  className="w-full p-2 rounded bg-background border border-border hover:bg-surface flex items-center justify-between cursor-pointer"
                >
                  <span className="text-text-muted">HSL</span>
                  <span className="font-bold text-text-main">
                    {hoveredPixel.color.hsl.h}°, {hoveredPixel.color.hsl.s}%, {hoveredPixel.color.hsl.l}%
                  </span>
                </button>
              </div>

              {copiedKey && (
                <div className="text-xs text-emerald-600 font-mono text-center flex items-center justify-center gap-1">
                  <FiCheck /> Copied to clipboard
                </div>
              )}
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded">
              <FiEye className="w-6 h-6 text-text-muted mb-2" />
              <p className="text-xs text-text-muted">
                Move cursor over the image to inspect any specific pixel. Click to copy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
