import { useCallback } from 'react';
import {
  DesignProject,
  Layer,
  BackgroundConfig,
  DesignTemplate,
} from './types';
import { useStudioPageActions } from './useStudioPageActions';
import { useStudioLayerCreation } from './useStudioLayerCreation';

interface UseStudioProjectActionsProps {
  setProject: React.Dispatch<React.SetStateAction<DesignProject>>;
  pushHistory: (project: DesignProject) => void;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  activePage: DesignProject['pages'][0];
}

export function useStudioProjectActions({
  setProject,
  pushHistory,
  selectedLayerId,
  setSelectedLayerId,
  activePage,
}: UseStudioProjectActionsProps) {
  const pageActions = useStudioPageActions({ setProject, activePage });
  const creationActions = useStudioLayerCreation({ setProject, setSelectedLayerId });

  const handleUpdateLayer = useCallback(
    (updatedLayer: Layer) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        page.layers = page.layers.map((l) => (l.id === updatedLayer.id ? updatedLayer : l));
        pages[prev.activePageIndex] = page;
        return { ...prev, pages, updatedAt: Date.now() };
      });
    },
    [setProject]
  );

  const handleDeleteLayer = useCallback(
    (layerId: string) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        page.layers = page.layers.filter((l) => l.id !== layerId);
        pages[prev.activePageIndex] = page;
        const next = { ...prev, pages, updatedAt: Date.now() };
        pushHistory(next);
        return next;
      });
      if (selectedLayerId === layerId) setSelectedLayerId(null);
    },
    [setProject, selectedLayerId, setSelectedLayerId, pushHistory]
  );

  const handleDuplicateLayer = useCallback(
    (layerId: string) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        const layer = page.layers.find((l) => l.id === layerId);
        if (!layer) return prev;

        const duplicated: Layer = {
          ...layer,
          id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: `${layer.name} (Copy)`,
          x: layer.x + 20,
          y: layer.y + 20,
          zIndex: page.layers.length + 1,
        };

        page.layers = [...page.layers, duplicated];
        pages[prev.activePageIndex] = page;
        const next = { ...prev, pages, updatedAt: Date.now() };
        pushHistory(next);
        setSelectedLayerId(duplicated.id);
        return next;
      });
    },
    [setProject, pushHistory, setSelectedLayerId]
  );

  const handleReorderLayer = useCallback(
    (layerId: string, direction: 'up' | 'down') => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        const sorted = [...page.layers].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex((l) => l.id === layerId);
        if (idx === -1) return prev;

        if (direction === 'up' && idx < sorted.length - 1) {
          const temp = sorted[idx].zIndex;
          sorted[idx].zIndex = sorted[idx + 1].zIndex;
          sorted[idx + 1].zIndex = temp;
        } else if (direction === 'down' && idx > 0) {
          const temp = sorted[idx].zIndex;
          sorted[idx].zIndex = sorted[idx - 1].zIndex;
          sorted[idx - 1].zIndex = temp;
        }

        page.layers = sorted;
        pages[prev.activePageIndex] = page;
        return { ...prev, pages, updatedAt: Date.now() };
      });
    },
    [setProject]
  );

  const handleNudgeLayer = useCallback(
    (layerId: string, dx: number, dy: number) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        page.layers = page.layers.map((l) =>
          l.id === layerId ? { ...l, x: Math.round(l.x + dx), y: Math.round(l.y + dy) } : l
        );
        pages[prev.activePageIndex] = page;
        return { ...prev, pages, updatedAt: Date.now() };
      });
    },
    [setProject]
  );

  const handleUpdateBackground = useCallback(
    (background: BackgroundConfig) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        pages[prev.activePageIndex] = { ...pages[prev.activePageIndex], background };
        return { ...prev, pages, updatedAt: Date.now() };
      });
    },
    [setProject]
  );

  const handleApplyTemplate = useCallback((template: DesignTemplate) => {
    setProject((prev) => {
      const generatedPages = template.createPages(prev.assets);
      return {
        ...prev,
        dimensions: template.recommendedDimensions,
        presetId: `${template.recommendedDimensions.platform}-${template.recommendedDimensions.deviceType}`,
        pages: generatedPages,
        activePageIndex: 0,
        updatedAt: Date.now(),
      };
    });
  }, [setProject]);

  return {
    handleUpdateLayer,
    handleDeleteLayer,
    handleDuplicateLayer,
    handleReorderLayer,
    handleNudgeLayer,
    handleUpdateBackground,
    handleApplyTemplate,
    ...creationActions,
    ...pageActions,
  };
}
