import React, { useState } from 'react';
import { ImageFileState } from '../../types';
import { checkBrowserCapabilities } from '../../lib/browser-support';
import { DropZone } from '../../components/common/DropZone';
import { ColorExtractorHeader } from './components/ColorExtractorHeader';
import { ColorExportDrawer } from './components/ColorExportDrawer';
import { DominantPaletteSwatches } from './components/DominantPaletteSwatches';
import { PixelLoupeInspector } from './components/PixelLoupeInspector';
import { useColorExtraction } from './useColorExtraction';

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
  const [maxColorCount, setMaxColorCount] = useState(8);

  const {
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
  } = useColorExtraction(imageFile, maxColorCount);

  if (!imageFile) {
    return (
      <div id="color-extractor-empty" className="max-w-4xl mx-auto space-y-6">
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
    <div id="color-extractor-container" className="max-w-6xl mx-auto space-y-6">
      <ColorExtractorHeader
        maxColorCount={maxColorCount}
        setMaxColorCount={setMaxColorCount}
        supportsEyeDropper={capabilities.supportsEyeDropper}
        onNativeEyeDropper={handleNativeEyeDropper}
        showExportModal={showExportModal}
        onToggleExportModal={() => setShowExportModal((prev) => !prev)}
        onDownloadPaletteImage={handleDownloadPaletteImage}
        onClear={onClear}
      />

      {showExportModal && (
        <ColorExportDrawer
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          exportCode={getExportCode()}
          onCopy={copyToClipboard}
          isCopied={copiedKey === 'export-code'}
        />
      )}

      <DominantPaletteSwatches
        colors={colors}
        isExtracting={isExtracting}
        copiedKey={copiedKey}
        onCopy={copyToClipboard}
      />

      <PixelLoupeInspector
        imageFile={imageFile}
        hoveredPixel={hoveredPixel}
        onImageMouseMove={handleImageMouseMove}
        onLoupeClick={() => {
          if (hoveredPixel) {
            copyToClipboard(hoveredPixel.color.hex, 'loupe-click');
          }
        }}
        copiedKey={copiedKey}
        onCopy={copyToClipboard}
      />
    </div>
  );
};
