import React from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

interface ColorExportDrawerProps {
  exportFormat: 'css' | 'tailwind' | 'json';
  setExportFormat: (format: 'css' | 'tailwind' | 'json') => void;
  exportCode: string;
  onCopy: (text: string, key: string) => void;
  isCopied: boolean;
}

export const ColorExportDrawer: React.FC<ColorExportDrawerProps> = ({
  exportFormat,
  setExportFormat,
  exportCode,
  onCopy,
  isCopied,
}) => {
  return (
    <div className="border border-border bg-surface text-text-main rounded-lg p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-text-muted">Export Format:</span>
          <div className="flex gap-1">
            {(['css', 'tailwind', 'json'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`px-2 py-0.5 rounded text-[11px] uppercase cursor-pointer ${
                  exportFormat === fmt
                    ? 'bg-primary text-white font-bold'
                    : 'bg-background text-text-muted border border-border'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => onCopy(exportCode, 'export-code')}
          className="px-2.5 py-1 rounded bg-background hover:bg-surface border border-border text-text-main flex items-center gap-1 cursor-pointer font-sans text-xs"
        >
          {isCopied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
          <span>{isCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      <pre className="p-3 bg-background border border-border rounded overflow-x-auto text-[11px] leading-relaxed text-text-main max-h-48 font-mono">
        {exportCode}
      </pre>
    </div>
  );
};
