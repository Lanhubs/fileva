import { useCallback, useRef } from 'react';
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
  const pageActions = useStudioPageActions({ setProject, activePage, pushHistory });
  const creationActions = useStudioLayerCreation({ setProject, setSelectedLayerId, pushHistory });
  const copiedLayerRef = useRef<Layer | null>(null);
  const nudgeDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleUpdateLayer = useCallback(
    (updatedLayer: Layer, commitHistory = false) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        page.layers = page.layers.map((l) => (l.id === updatedLayer.id ? updatedLayer : l));
        pages[prev.activePageIndex] = page;
        const next = { ...prev, pages, updatedAt: Date.now() };
        if (commitHistory) {
          pushHistory(next);
        }
        return next;
      });
    },
    [setProject, pushHistory]
  );

  const handleCommitCurrentProject = useCallback(() => {
    setProject((prev) => {
      pushHistory(prev);
      return prev;
    });
  }, [setProject, pushHistory]);

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
          ...JSON.parse(JSON.stringify(layer)),
          id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          name: `${layer.name} (Copy)`,
          x: layer.x + 24,
          y: layer.y + 24,
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

  const handleCopyLayer = useCallback(
    (layerId: string) => {
      const target = activePage.layers.find((l) => l.id === layerId);
      if (target) {
        copiedLayerRef.current = JSON.parse(JSON.stringify(target));
      }
    },
    [activePage.layers]
  );

  const handlePasteLayer = useCallback(() => {
    if (!copiedLayerRef.current) return;
    const source = copiedLayerRef.current;
    const pasted: Layer = {
      ...JSON.parse(JSON.stringify(source)),
      id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: `${source.name} (Paste)`,
      x: source.x + 24,
      y: source.y + 24,
      zIndex: activePage.layers.length + 1,
    };

    setProject((prev) => {
      const pages = [...prev.pages];
      const page = { ...pages[prev.activePageIndex] };
      page.layers = [...page.layers, pasted];
      pages[prev.activePageIndex] = page;
      const next = { ...prev, pages, updatedAt: Date.now() };
      pushHistory(next);
      setSelectedLayerId(pasted.id);
      return next;
    });
    // Offset subsequent pastes slightly
    copiedLayerRef.current = { ...source, x: source.x + 24, y: source.y + 24 };
  }, [activePage.layers.length, setProject, pushHistory, setSelectedLayerId]);

  const handleCutLayer = useCallback(
    (layerId: string) => {
      handleCopyLayer(layerId);
      handleDeleteLayer(layerId);
    },
    [handleCopyLayer, handleDeleteLayer]
  );

  const handleToggleLayerLock = useCallback(
    (layerId: string) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        page.layers = page.layers.map((l) => (l.id === layerId ? { ...l, locked: !l.locked } : l));
        pages[prev.activePageIndex] = page;
        const next = { ...prev, pages, updatedAt: Date.now() };
        pushHistory(next);
        return next;
      });
    },
    [setProject, pushHistory]
  );

  const handleToggleLayerVisibility = useCallback(
    (layerId: string) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        page.layers = page.layers.map((l) => (l.id === layerId ? { ...l, visible: !l.visible } : l));
        pages[prev.activePageIndex] = page;
        const next = { ...prev, pages, updatedAt: Date.now() };
        pushHistory(next);
        return next;
      });
    },
    [setProject, pushHistory]
  );

  const handleReorderLayerDepth = useCallback(
    (layerId: string, action: 'front' | 'back' | 'forward' | 'backward') => {
      setProject((prev) => {
        const pages = [...prev.pages];
        const page = { ...pages[prev.activePageIndex] };
        const sorted = [...page.layers].sort((a, b) => a.zIndex - b.zIndex);
        const idx = sorted.findIndex((l) => l.id === layerId);
        if (idx === -1) return prev;

        const [item] = sorted.splice(idx, 1);
        if (action === 'front') {
          sorted.push(item);
        } else if (action === 'back') {
          sorted.unshift(item);
        } else if (action === 'forward') {
          sorted.splice(Math.min(idx + 1, sorted.length), 0, item);
        } else if (action === 'backward') {
          sorted.splice(Math.max(0, idx - 1), 0, item);
        }

        // Reassign clean continuous zIndices
        sorted.forEach((l, i) => {
          l.zIndex = i + 1;
        });

        page.layers = sorted;
        pages[prev.activePageIndex] = page;
        const next = { ...prev, pages, updatedAt: Date.now() };
        pushHistory(next);
        return next;
      });
    },
    [setProject, pushHistory]
  );

  const handleReorderLayer = useCallback(
    (layerId: string, direction: 'up' | 'down') => {
      handleReorderLayerDepth(layerId, direction === 'up' ? 'forward' : 'backward');
    },
    [handleReorderLayerDepth]
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
        const next = { ...prev, pages, updatedAt: Date.now() };

        if (nudgeDebounceRef.current) clearTimeout(nudgeDebounceRef.current);
        nudgeDebounceRef.current = setTimeout(() => {
          pushHistory(next);
        }, 350);

        return next;
      });
    },
    [setProject, pushHistory]
  );

  const handleUpdateBackground = useCallback(
    (background: BackgroundConfig) => {
      setProject((prev) => {
        const pages = [...prev.pages];
        pages[prev.activePageIndex] = { ...pages[prev.activePageIndex], background };
        const next = { ...prev, pages, updatedAt: Date.now() };
        pushHistory(next);
        return next;
      });
    },
    [setProject, pushHistory]
  );

  const handleApplyTemplate = useCallback(
    (template: DesignTemplate) => {
      setProject((prev) => {
        const generatedPages = template.createPages(prev.assets);
        const next = {
          ...prev,
          dimensions: template.recommendedDimensions,
          presetId: `${template.recommendedDimensions.platform}-${template.recommendedDimensions.deviceType}`,
          pages: generatedPages,
          activePageIndex: 0,
          updatedAt: Date.now(),
        };
        pushHistory(next);
        return next;
      });
    },
    [setProject, pushHistory]
  );

  return {
    handleUpdateLayer,
    handleCommitCurrentProject,
    handleDeleteLayer,
    handleDuplicateLayer,
    handleCopyLayer,
    handlePasteLayer,
    handleCutLayer,
    handleToggleLayerLock,
    handleToggleLayerVisibility,
    handleReorderLayerDepth,
    handleReorderLayer,
    handleNudgeLayer,
    handleUpdateBackground,
    handleApplyTemplate,
    ...creationActions,
    ...pageActions,
  };
}
