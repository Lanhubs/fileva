import React from 'react';
import { ImageFileState } from '../../types';
import { useImageCropper } from './hooks/useImageCropper';
import { CropperDropZone } from './components/CropperDropZone';
import { CropperSettings } from './components/CropperSettings';
import { CropperStage } from './components/CropperStage';

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
  const {
    aspectRatio,
    applyAspectRatio,
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
  } = useImageCropper(imageFile);

  if (!imageFile) {
    return <CropperDropZone onFileSelect={onFileSelect} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Crop Configuration */}
        <div className="lg:col-span-1">
          <CropperSettings
            cropPixels={cropPixels}
            aspectRatio={aspectRatio}
            onApplyAspectRatio={applyAspectRatio}
            flipH={flipH}
            onToggleFlipH={() => setFlipH((prev) => !prev)}
            flipV={flipV}
            onToggleFlipV={() => setFlipV((prev) => !prev)}
            format={format}
            onFormatChange={setFormat}
            quality={quality}
            onQualityChange={setQuality}
            isExporting={isExporting}
            onExport={handleExport}
            onClear={onClear}
          />
        </div>

        {/* Right Column: Interactive Canvas Stage */}
        <div className="lg:col-span-2">
          <CropperStage
            imageFile={imageFile}
            cropBox={cropBox}
            flipH={flipH}
            flipV={flipV}
            containerRef={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
      </div>
    </div>
  );
};
