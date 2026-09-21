import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToolId, ImageFileState } from '../../types';
import { Dashboard } from '../../pages/Dashboard';
import { AppStoreDesignStudio } from '../../features/design-studio/AppStoreDesignStudio';
import { VideoCompressor } from '../../features/video-compressor/VideoCompressor';
import { AudioCompressor } from '../../features/audio-compressor/AudioCompressor';
import { BackgroundRemover } from '../../features/background-remover/BackgroundRemover';
import { ImageCompressor } from '../../features/compressor/ImageCompressor';
import { AppIconGenerator } from '../../features/icon-generator/AppIconGenerator';
import { ColorExtractor } from '../../features/color-extractor/ColorExtractor';
import { ImageCropper } from '../../features/cropper/ImageCropper';

interface AppRoutesProps {
  activeFile: ImageFileState | null;
  onSelectTool: (tool: ToolId) => void;
  onLoadFile: (file: File) => Promise<void>;
  onClearFile: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({
  activeFile,
  onSelectTool,
  onLoadFile,
  onClearFile,
}) => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Dashboard
            onSelectTool={onSelectTool}
            onFileUploaded={(file) => {
              onLoadFile(file);
              navigate('/image-compressor');
            }}
          />
        }
      />
      <Route
        path="/design-studio"
        element={<AppStoreDesignStudio initialFile={activeFile?.file} />}
      />
      <Route
        path="/app-store-design-studio"
        element={<Navigate to="/design-studio" replace />}
      />
      <Route path="/video-compressor" element={<VideoCompressor />} />
      <Route path="/audio-compressor" element={<AudioCompressor />} />
      <Route
        path="/background-remover"
        element={
          <BackgroundRemover
            imageFile={activeFile}
            onFileSelect={onLoadFile}
            onClear={onClearFile}
          />
        }
      />
      <Route
        path="/remover"
        element={<Navigate to="/background-remover" replace />}
      />
      <Route
        path="/image-compressor"
        element={
          <ImageCompressor
            imageFile={activeFile}
            onFileSelect={onLoadFile}
            onClear={onClearFile}
          />
        }
      />
      <Route
        path="/compressor"
        element={<Navigate to="/image-compressor" replace />}
      />
      <Route
        path="/icon-generator"
        element={
          <AppIconGenerator
            imageFile={activeFile}
            onFileSelect={onLoadFile}
            onClear={onClearFile}
          />
        }
      />
      <Route
        path="/app-icon-generator"
        element={<Navigate to="/icon-generator" replace />}
      />
      <Route
        path="/color-extractor"
        element={
          <ColorExtractor
            imageFile={activeFile}
            onFileSelect={onLoadFile}
            onClear={onClearFile}
          />
        }
      />
      <Route
        path="/image-cropper"
        element={
          <ImageCropper
            imageFile={activeFile}
            onFileSelect={onLoadFile}
            onClear={onClearFile}
          />
        }
      />
      <Route
        path="/cropper"
        element={<Navigate to="/image-cropper" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
