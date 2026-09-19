import React, { useRef, useState, useEffect } from 'react';
import { FiUploadCloud,  FiAlertCircle } from 'react-icons/fi';
import { isValidImageFile } from '../../lib/file-utils';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  acceptText?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileSelected,
  acceptText = 'PNG, JPEG, WebP, AVIF, SVG, BMP',
  maxSizeMb = 50,
  disabled = false,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support clipboard paste (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileValidation(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [disabled]);

  const handleFileValidation = (file: File) => {
    setErrorMsg(null);
    if (!isValidImageFile(file)) {
      setErrorMsg(`Unsupported file type: ${file.type || file.name}. Please provide an image file.`);
      return;
    }

    const fileSizeMb = file.size / (1024 * 1024);
    if (fileSizeMb > maxSizeMb) {
      setErrorMsg(`File exceeds maximum size of ${maxSizeMb}MB (${fileSizeMb.toFixed(1)}MB).`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileValidation(e.target.files[0]);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        id="drop-zone-area"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative flex flex-col hover:border-primary items-center justify-center p-8 sm:p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors select-none ${
          isDragOver
            ? 'border-primary bg-primary-light/40'
            : 'border-border bg-background hover:bg-surface'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        aria-label="Upload image"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="w-12 h-12 mb-4 flex items-center justify-center rounded border border-border bg-surface text-primary shadow-none">
          <FiUploadCloud className="w-6 h-6" />
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-text-main mb-1">
            Drop your image here, or{' '}
            <span className="text-primary font-semibold underline underline-offset-2">browse</span>
          </p>
          <p className="text-xs text-text-muted mb-3">
            Supports {acceptText} (up to {maxSizeMb}MB)
          </p>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-text-muted bg-surface rounded border border-border">
            <span className="text-text-main font-semibold">Tip:</span> Paste directly from clipboard (Ctrl+V / Cmd+V)
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mt-3 flex items-start gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded">
          <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">{errorMsg}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setErrorMsg(null);
            }}
            className="text-rose-700 hover:text-rose-900 font-bold cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};
