import { useState, useCallback } from 'react';
import { DesignProject, CanvasPage } from './types';
import { exportPageToBlob, exportAllPagesToZip } from './export-engine';
import { downloadBlob } from '../../lib/file-utils';

interface UseStudioExportProps {
  project: DesignProject;
  activePage: CanvasPage;
  setErrorNotification: (msg: string | null) => void;
}

export function useStudioExport({
  project,
  activePage,
  setErrorNotification,
}: UseStudioExportProps) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number } | undefined>();

  const handleExportCurrent = useCallback(async () => {
    try {
      setIsExporting(true);
      setErrorNotification(null);
      const blob = await exportPageToBlob(
        activePage,
        project.dimensions,
        project.assets,
        'image/png'
      );
      const cleanName = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-${String(
        project.activePageIndex + 1
      ).padStart(2, '0')}.png`;
      downloadBlob(blob, cleanName);
    } catch (err) {
      setErrorNotification(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setIsExporting(false);
    }
  }, [activePage, project.dimensions, project.assets, project.name, project.activePageIndex, setErrorNotification]);

  const handleExportAll = useCallback(async () => {
    try {
      setIsExporting(true);
      setErrorNotification(null);
      setExportProgress({ current: 0, total: project.pages.length });

      const zipBlob = await exportAllPagesToZip(
        project.pages,
        project.dimensions,
        project.assets,
        project.name,
        'image/png',
        (curr, total) => setExportProgress({ current: curr, total })
      );

      const cleanZipName = `${project.name
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-')}-screenshots.zip`;

      downloadBlob(zipBlob, cleanZipName);
    } catch (err) {
      setErrorNotification(err instanceof Error ? err.message : 'Batch export failed.');
    } finally {
      setIsExporting(false);
      setExportProgress(undefined);
    }
  }, [project.pages, project.dimensions, project.assets, project.name, setErrorNotification]);

  return {
    isExporting,
    exportProgress,
    handleExportCurrent,
    handleExportAll,
  };
}
