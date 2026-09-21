import { useCallback } from 'react';
import { DesignProject, DesignStudioMode, CanvasDimensions } from './types';
import { DEFAULT_PRESET, ALL_PRESETS } from './presets';

interface UseStudioPageActionsProps {
  setProject: React.Dispatch<React.SetStateAction<DesignProject>>;
  activePage: DesignProject['pages'][0];
  pushHistory?: (project: DesignProject) => void;
}

export function useStudioPageActions({ setProject, activePage, pushHistory }: UseStudioPageActionsProps) {
  const handleAddPage = useCallback(() => {
    setProject((prev) => {
      const pageIndex = prev.pages.length + 1;
      const newPage = {
        id: `page-${Date.now()}`,
        title: `${String(pageIndex).padStart(2, '0')} — Feature`,
        background: { ...activePage.background },
        layers: activePage.layers.map((l) => ({
          ...l,
          id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        })),
      };
      const next = {
        ...prev,
        pages: [...prev.pages, newPage],
        activePageIndex: prev.pages.length,
        updatedAt: Date.now(),
      };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, activePage, pushHistory]);

  const handleDuplicatePage = useCallback((index: number) => {
    setProject((prev) => {
      const target = prev.pages[index];
      if (!target) return prev;
      const duplicated = {
        ...target,
        id: `page-${Date.now()}`,
        title: `${target.title} (Copy)`,
        layers: target.layers.map((l) => ({
          ...l,
          id: `layer-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        })),
      };
      const updated = [...prev.pages];
      updated.splice(index + 1, 0, duplicated);
      const next = {
        ...prev,
        pages: updated,
        activePageIndex: index + 1,
        updatedAt: Date.now(),
      };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, pushHistory]);

  const handleDeletePage = useCallback((index: number) => {
    setProject((prev) => {
      if (prev.pages.length <= 1) return prev;
      const updated = prev.pages.filter((_, idx) => idx !== index);
      const next = {
        ...prev,
        pages: updated,
        activePageIndex: Math.max(0, Math.min(index, updated.length - 1)),
        updatedAt: Date.now(),
      };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, pushHistory]);

  const handleMovePage = useCallback((from: number, to: number) => {
    setProject((prev) => {
      if (to < 0 || to >= prev.pages.length) return prev;
      const updated = [...prev.pages];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      const next = {
        ...prev,
        pages: updated,
        activePageIndex: to,
        updatedAt: Date.now(),
      };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, pushHistory]);

  const handleChangeMode = useCallback((mode: DesignStudioMode) => {
    setProject((prev) => {
      let targetPreset: CanvasDimensions = DEFAULT_PRESET;
      if (mode === 'banners') {
        targetPreset =
          ALL_PRESETS.find((p) => p.platform === 'google' && p.deviceType === 'banner') ||
          ALL_PRESETS[8];
      } else if (mode === 'promo') {
        targetPreset = ALL_PRESETS.find((p) => p.platform === 'promo') || ALL_PRESETS[11];
      }

      const next = {
        ...prev,
        mode,
        dimensions: targetPreset,
        presetId: `${targetPreset.platform}-${targetPreset.deviceType}`,
        updatedAt: Date.now(),
      };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, pushHistory]);

  return {
    handleAddPage,
    handleDuplicatePage,
    handleDeletePage,
    handleMovePage,
    handleChangeMode,
  };
}
