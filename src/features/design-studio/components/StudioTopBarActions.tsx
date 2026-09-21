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
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-2.5 py-1.5 bg-background hover:bg-surface border border-border hover:border-primary rounded text-text-main flex items-center gap-1.5 cursor-pointer font-medium"
        title="Import Application Screenshot"
      >
        <FiUpload className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">Import Screenshot</span>
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
        className="px-2.5 py-1.5 bg-background hover:bg-surface border border-border hover:border-primary rounded text-text-main flex items-center gap-1.5 cursor-pointer font-medium"
      >
        <FiGrid className="w-3.5 h-3.5 text-primary" />
        <span className="hidden sm:inline">Templates</span>
      </button>

      <button
        onClick={onTogglePreviewMode}
        className={`px-2.5 py-1.5 border rounded flex items-center gap-1.5 cursor-pointer font-medium transition-colors ${
          previewMode
            ? 'bg-primary text-white border-primary'
            : 'bg-background hover:bg-surface border-border text-text-main'
        }`}
        title={previewMode ? 'Return to Editor' : 'Clean Preview'}
      >
        {previewMode ? <FiEdit2 className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
        <span>{previewMode ? 'Edit' : 'Preview'}</span>
      </button>

      <button
        onClick={onExportCurrent}
        disabled={isExporting}
        className="px-3 py-1.5 bg-surface hover:bg-background border border-border rounded text-text-main font-medium flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        <FiDownload className="w-3.5 h-3.5 text-primary" />
        <span>Export Current</span>
      </button>

      <button
        onClick={onExportAll}
        disabled={isExporting}
        className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white rounded font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
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
