import React from 'react';
import { DropZone } from '../../../components/common/DropZone';

interface IconDropZoneProps {
  onFileSelect: (file: File) => void;
}

export const IconDropZone: React.FC<IconDropZoneProps> = ({ onFileSelect }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border border-border bg-surface rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-main mb-1">
          App Icon / Logo Generator
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Generate platform-ready icon sets for Android, iOS, Web Favicons (.ico &amp; PNG), PWA, and Desktop in one click.
        </p>
        <DropZone onFileSelected={onFileSelect} acceptText="PNG, SVG, WebP, JPEG" />
      </div>
    </div>
  );
};
