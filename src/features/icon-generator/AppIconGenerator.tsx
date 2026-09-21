import React from 'react';
import { ImageFileState } from '../../types';
import { useAppIconGenerator } from './hooks/useAppIconGenerator';
import { IconDropZone } from './components/IconDropZone';
import { IconGeneratorSettings } from './components/IconGeneratorSettings';
import { IconDeviceSimulators } from './components/IconDeviceSimulators';
import { IconHtmlSnippetDrawer } from './components/IconHtmlSnippetDrawer';
import { IconPresetsTable } from './components/IconPresetsTable';

interface AppIconGeneratorProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const AppIconGenerator: React.FC<AppIconGeneratorProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  const {
    config,
    setConfig,
    activeCategory,
    setActiveCategory,
    previewShape,
    setPreviewShape,
    isPackagingZip,
    previewDataUrls,
    showCodeSnippet,
    setShowCodeSnippet,
    copiedSnippet,
    filteredPresets,
    getBorderRadiusClass,
    handleDownloadSinglePreset,
    handleDownloadIcoFavicon,
    handleDownloadZipPackage,
    handleCopySnippet,
  } = useAppIconGenerator(imageFile);

  if (!imageFile) {
    return <IconDropZone onFileSelect={onFileSelect} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <IconGeneratorSettings
            config={config}
            onUpdateConfig={setConfig}
            previewShape={previewShape}
            onPreviewShapeChange={setPreviewShape}
            isPackagingZip={isPackagingZip}
            showCodeSnippet={showCodeSnippet}
            onToggleCodeSnippet={() => setShowCodeSnippet((prev) => !prev)}
            onDownloadZip={handleDownloadZipPackage}
            onDownloadIco={handleDownloadIcoFavicon}
            onClear={onClear}
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <IconDeviceSimulators
            previewDataUrls={previewDataUrls}
            borderRadiusClass={getBorderRadiusClass()}
          />

          {showCodeSnippet && (
            <IconHtmlSnippetDrawer
              copiedSnippet={copiedSnippet}
              onCopySnippet={handleCopySnippet}
            />
          )}

          <IconPresetsTable
            filteredPresets={filteredPresets}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onDownloadSinglePreset={handleDownloadSinglePreset}
          />
        </div>
      </div>
    </div>
  );
};
