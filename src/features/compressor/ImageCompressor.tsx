import React from 'react';
import { ImageFileState } from '../../types';
import { useImageCompressor } from './hooks/useImageCompressor';
import { ImageDropZone } from './components/ImageDropZone';
import { ImageCompressorSettings } from './components/ImageCompressorSettings';
import { ImageMetricsCard } from './components/ImageMetricsCard';
import { ImageViewerComparison } from './components/ImageViewerComparison';

interface ImageCompressorProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const ImageCompressor: React.FC<ImageCompressorProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  const {
    capabilities,
    settings,
    setSettings,
    result,
    isProcessing,
    errorMsg,
    viewMode,
    setViewMode,
    toggleActive,
    setToggleActive,
    handleDownload,
  } = useImageCompressor(imageFile);

  if (!imageFile) {
    return <ImageDropZone onFileSelect={onFileSelect} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ImageCompressorSettings
            settings={settings}
            onUpdateSettings={setSettings}
            capabilities={capabilities}
            isProcessing={isProcessing}
            hasResult={Boolean(result)}
            onDownload={handleDownload}
            onClear={onClear}
          />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <ImageMetricsCard
            originalSize={imageFile.size}
            originalWidth={imageFile.width}
            originalHeight={imageFile.height}
            result={result}
            format={settings.format}
          />

          <ImageViewerComparison
            imageFile={imageFile}
            result={result}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            toggleActive={toggleActive}
            onToggleActiveChange={setToggleActive}
            isProcessing={isProcessing}
            errorMsg={errorMsg}
          />
        </div>
      </div>
    </div>
  );
};
