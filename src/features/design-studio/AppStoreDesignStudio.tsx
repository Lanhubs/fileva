import React, { useState, useEffect, useCallback } from 'react';
import { DesignProject } from './types';
import { DEFAULT_PRESET } from './presets';
import { createNewProject, saveProjectToStorage, loadProjectFromStorage } from './storage';
import { StudioTopBar } from './components/StudioTopBar';
import { CanvasEditorView } from './components/CanvasEditorView';
import { InspectorLayersPanel } from './components/InspectorLayersPanel';
import { PageReorderBar } from './components/PageReorderBar';
import { TemplateSelectorModal } from './components/TemplateSelectorModal';
import { StudioCursorMode } from './cursor-types';
import { useStudioProjectActions } from './useStudioProjectActions';
import { useStudioExport } from './useStudioExport';
import { useScreenshotUpload } from './useScreenshotUpload';
import { useStudioHotkeysAndZoom } from './useStudioHotkeysAndZoom';
import { useStudioHistory } from './useStudioHistory';
import { preloadCommonStudioFonts } from './font-loader';

interface AppStoreDesignStudioProps {
  initialFile?: File | null;
}

export const AppStoreDesignStudio: React.FC<AppStoreDesignStudioProps> = ({
  initialFile,
}) => {
  const [project, setProject] = useState<DesignProject>(() => {
    const saved = loadProjectFromStorage();
    if (saved) return saved;
    return createNewProject('My App Store Screenshots', DEFAULT_PRESET);
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(0.28);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [showGuides] = useState<boolean>(true);
  const [cursorMode, setCursorMode] = useState<StudioCursorMode>('select');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const activePage = project.pages[project.activePageIndex] || project.pages[0];

  useEffect(() => {
    saveProjectToStorage(project);
  }, [project]);

  const { canUndo, canRedo, pushHistory, handleUndo, handleRedo } = useStudioHistory(
    project,
    setProject
  );

  const projectActions = useStudioProjectActions({
    setProject,
    pushHistory,
    selectedLayerId,
    setSelectedLayerId,
    activePage,
  });

  const { isExporting, exportProgress, handleExportCurrent, handleExportAll } = useStudioExport({
    project,
    activePage,
    setErrorNotification,
  });

  const { handleUploadScreenshot } = useScreenshotUpload({
    setProject,
    pushHistory,
    setErrorNotification,
  });

  const handleFitCanvas = useCallback(() => {
    const availWidth = window.innerWidth - (window.innerWidth >= 1024 ? 400 : 80);
    const availHeight = window.innerHeight - 240;
    const fitZoom = Math.min(availWidth / project.dimensions.width, availHeight / project.dimensions.height, 0.45);
    setZoom(Math.max(0.12, Math.min(1.2, Number(fitZoom.toFixed(2)))));
  }, [project.dimensions]);

  useStudioHotkeysAndZoom({
    dimensions: project.dimensions,
    setZoom,
    setCursorMode,
    selectedLayerId,
    onDeleteSelectedLayer: () => {
      if (selectedLayerId) projectActions.handleDeleteLayer(selectedLayerId);
    },
    onDuplicateSelectedLayer: () => {
      if (selectedLayerId) projectActions.handleDuplicateLayer(selectedLayerId);
    },
    onDeselectLayer: () => setSelectedLayerId(null),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onNudgeSelectedLayer: (dx, dy) => {
      if (selectedLayerId) projectActions.handleNudgeLayer(selectedLayerId, dx, dy);
    },
    onFitCanvas: handleFitCanvas,
  });

  useEffect(() => {
    preloadCommonStudioFonts();
    if (initialFile) handleUploadScreenshot(initialFile);
  }, [initialFile, handleUploadScreenshot]);

  return (
    <div id="app-store-design-studio" className="flex flex-col h-full w-full bg-background overflow-hidden select-none">
      <StudioTopBar
        projectName={project.name}
        onUpdateProjectName={(name) => setProject((p) => ({ ...p, name }))}
        dimensions={project.dimensions}
        onChangeDimensions={(dims) => setProject((p) => ({ ...p, dimensions: dims, updatedAt: Date.now() }))}
        mode={project.mode}
        onChangeMode={projectActions.handleChangeMode}
        zoom={zoom}
        onZoomChange={setZoom}
        onFitCanvas={handleFitCanvas}
        previewMode={previewMode}
        onTogglePreviewMode={() => setPreviewMode(!previewMode)}
        onExportCurrent={handleExportCurrent}
        onExportAll={handleExportAll}
        onUploadScreenshot={handleUploadScreenshot}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        isExporting={isExporting}
        exportProgress={exportProgress}
        cursorMode={cursorMode}
        onChangeCursorMode={setCursorMode}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
      />

      {errorNotification && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center justify-between">
          <span>{errorNotification}</span>
          <button onClick={() => setErrorNotification(null)} className="font-bold hover:text-rose-900 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <CanvasEditorView
          page={activePage}
          dimensions={project.dimensions}
          assets={project.assets}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={projectActions.handleUpdateLayer}
          zoom={zoom}
          previewMode={previewMode}
          showGuides={showGuides}
          cursorMode={cursorMode}
          onZoomChange={setZoom}
        />

        {!previewMode && (
          <InspectorLayersPanel
            layers={activePage.layers}
            selectedLayerId={selectedLayerId}
            onSelectLayer={setSelectedLayerId}
            onUpdateLayer={projectActions.handleUpdateLayer}
            onDeleteLayer={projectActions.handleDeleteLayer}
            onDuplicateLayer={projectActions.handleDuplicateLayer}
            onReorderLayer={projectActions.handleReorderLayer}
            background={activePage.background}
            onUpdateBackground={projectActions.handleUpdateBackground}
            assets={project.assets}
            onAddTextLayer={projectActions.handleAddTextLayer}
            onAddShapeLayer={projectActions.handleAddShapeLayer}
            onAddDeviceLayer={projectActions.handleAddDeviceLayer}
            onUploadAsset={handleUploadScreenshot}
          />
        )}
      </div>

      <PageReorderBar
        pages={project.pages}
        activePageIndex={project.activePageIndex}
        onSelectPage={(index) => {
          setSelectedLayerId(null);
          setProject((p) => ({ ...p, activePageIndex: index }));
        }}
        onAddPage={projectActions.handleAddPage}
        onDuplicatePage={projectActions.handleDuplicatePage}
        onDeletePage={projectActions.handleDeletePage}
        onMovePage={projectActions.handleMovePage}
      />

      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyTemplate={projectActions.handleApplyTemplate}
        currentDimensions={project.dimensions}
      />
    </div>
  );
};
