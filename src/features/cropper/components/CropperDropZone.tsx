import React from 'react';
import { DropZone } from '../../../components/common/DropZone';

interface CropperDropZoneProps {
  onFileSelect: (file: File) => void;
}

export const CropperDropZone: React.FC<CropperDropZoneProps> = ({ onFileSelect }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="border border-border bg-surface rounded-lg p-6">
        <h2 className="text-lg font-bold text-text-main mb-1">
          Image Cropper
        </h2>
        <p className="text-xs text-text-muted mb-6">
          Pixel-accurate crop box with aspect ratios, 90° rotation, horizontal/vertical flipping, and high-res canvas export.
        </p>
        <DropZone onFileSelected={onFileSelect} acceptText="PNG, JPEG, WebP, AVIF, BMP" />
      </div>
    </div>
  );
};
