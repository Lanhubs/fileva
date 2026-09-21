import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageFileState, CompressionSettings, CompressionResult } from '../../../types';
import { compressImage } from '../compressor-engine';
import { downloadBlob, replaceFileExtension } from '../../../lib/file-utils';
import { checkBrowserCapabilities } from '../../../lib/browser-support';

export type ImageViewMode = 'side-by-side' | 'toggle';
export type ImageToggleTarget = 'original' | 'compressed';

export function useImageCompressor(imageFile: ImageFileState | null) {
  const capabilities = checkBrowserCapabilities();

  const [settings, setSettings] = useState<CompressionSettings>({
    format: 'image/webp',
    quality: 0.8,
    targetSizeKb: 250,
    mode: 'quality',
    resize: {
      enabled: false,
      maxWidth: 1920,
      maxHeight: 1080,
    },
  });

  const [result, setResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ImageViewMode>('side-by-side');
  const [toggleActive, setToggleActive] = useState<ImageToggleTarget>('compressed');

  const activeResultUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (activeResultUrlRef.current) {
        URL.revokeObjectURL(activeResultUrlRef.current);
      }
    };
  }, []);

  const runCompression = useCallback(async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await compressImage(imageFile.objectUrl, imageFile.size, settings);

      if (activeResultUrlRef.current) {
        URL.revokeObjectURL(activeResultUrlRef.current);
      }
      activeResultUrlRef.current = res.objectUrl;
      setResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Compression failed.';
      setErrorMsg(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [imageFile, settings]);

  useEffect(() => {
    if (!imageFile) {
      setResult(null);
      return;
    }

    const timer = setTimeout(() => {
      runCompression();
    }, 250);

    return () => clearTimeout(timer);
  }, [imageFile, runCompression]);

  const handleDownload = useCallback(() => {
    if (!result || !imageFile) return;

    let ext = 'webp';
    if (result.format === 'image/jpeg') ext = 'jpg';
    else if (result.format === 'image/png') ext = 'png';
    else if (result.format === 'image/avif') ext = 'avif';

    const filename = replaceFileExtension(imageFile.name, `compressed.${ext}`);
    downloadBlob(result.blob, filename);
  }, [result, imageFile]);

  return {
    capabilities,
    settings,
    setSettings,
    result,
    isProcessing,
    errorMsg,
    viewMode,
    setViewMode,
    toggleActive,
    setToggleActive,
    handleDownload,
    runCompression,
  };
}
