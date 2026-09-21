import React, { useRef } from 'react';
import { FiDownload, FiPackage, FiUpload, FiGrid, FiEdit2, FiEye } from 'react-icons/fi';

interface StudioTopBarActionsProps {
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onExportCurrent: () => void;
  onExportAll: () => void;
  onUploadScreenshot: (file: File) => void;
  onOpenTemplates: () => void;
  isExporting: boolean;
  exportProgress?: { current: number; total: number };
}

export const StudioTopBarActions: React.FC<StudioTopBarActionsProps> = ({
  previewMode,
  onTogglePreviewMode,
  onExportCurrent,
  onExportAll,
  onUploadScreenshot,
  onOpenTemplates,
  isExporting,
  exportProgress,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-1.5 sm:px-2 sm:py-1 bg-background hover:bg-surface border border-border hover:border-primary rounded text-text-main flex items-center gap-1 sm:gap-1.5 cursor-pointer font-medium text-xs"
        title="Import Application Screenshot"
      >
        <FiUpload className="w-3.5 h-3.5 text-primary" />
        <span className="hidden xl:inline">Screenshot</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            onUploadScreenshot(e.target.files[0]);
            e.target.value = '';
          }
        }}
      />

      <button
        onClick={onOpenTemplates}
        className="p-1.5 sm:px-2 sm:py-1 bg-background hover:bg-surface border border-border hover:border-primary rounded text-text-main flex items-center gap-1 sm:gap-1.5 cursor-pointer font-medium text-xs"
        title="Open Templates"
      >
        <FiGrid className="w-3.5 h-3.5 text-primary" />
        <span className="hidden xl:inline">Templates</span>
      </button>

      <button
        onClick={onTogglePreviewMode}
        className={`p-1.5 sm:px-2 sm:py-1 border rounded flex items-center gap-1 sm:gap-1.5 cursor-pointer font-medium text-xs transition-colors ${
          previewMode
            ? 'bg-primary text-white border-primary'
            : 'bg-background hover:bg-surface border-border text-text-main'
        }`}
        title={previewMode ? 'Return to Editor' : 'Clean Preview'}
      >
        {previewMode ? <FiEdit2 className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
        <span className="hidden lg:inline">{previewMode ? 'Edit' : 'Preview'}</span>
      </button>

      <button
        onClick={onExportCurrent}
        disabled={isExporting}
        className="p-1.5 sm:px-2 sm:py-1 bg-surface hover:bg-background border border-border rounded text-text-main font-medium flex items-center gap-1 sm:gap-1.5 cursor-pointer text-xs disabled:opacity-50"
        title="Export Current Artboard Page (PNG)"
      >
        <FiDownload className="w-3.5 h-3.5 text-primary" />
        <span className="hidden lg:inline">Page</span>
      </button>

      <button
        onClick={onExportAll}
        disabled={isExporting}
        className="px-2 py-1 sm:px-2.5 sm:py-1 bg-primary hover:bg-primary-hover text-white rounded font-semibold flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-xs text-xs disabled:opacity-50"
        title="Export All Pages (ZIP)"
      >
        <FiPackage className="w-3.5 h-3.5" />
        <span>
          {isExporting && exportProgress
            ? `Exporting (${exportProgress.current}/${exportProgress.total})...`
            : 'Export All'}
        </span>
      </button>
    </div>
  );
};
