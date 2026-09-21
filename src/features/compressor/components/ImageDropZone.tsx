import React from 'react';
import { DropZone } from '../../../components/common/DropZone';

interface ImageDropZoneProps {
  onFileSelect: (file: File) => void;
}

export const ImageDropZone: React.FC<ImageDropZoneProps> = ({ onFileSelect }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border border-border bg-surface rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-main mb-1">
          Image Compressor
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Compress JPEG, PNG, WebP, and AVIF images locally. Supports quality control and target file size binary search.
        </p>
        <DropZone onFileSelected={onFileSelect} acceptText="JPEG, PNG, WebP, AVIF, BMP" />
      </div>
    </div>
  );
};
