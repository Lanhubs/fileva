import { useState, useEffect, useCallback } from 'react';
import { ImageFileState, IconPreset } from '../../../types';
import { ICON_PRESETS, generateHtmlHeadSnippet } from '../../../lib/icon-presets';
import { IconGenerationConfig, renderIconToBlob, generateFullIconPackage } from '../icon-engine';
import { loadImageElement, downloadBlob } from '../../../lib/file-utils';
import { createIcoFromPngs } from '../../../lib/ico-generator';

export type IconCategory = 'all' | 'android' | 'ios' | 'web' | 'pwa' | 'desktop';
export type IconPreviewShape = 'square' | 'ios' | 'squircle' | 'circle';

export function useAppIconGenerator(imageFile: ImageFileState | null) {
  const [config, setConfig] = useState<IconGenerationConfig>({
    backgroundColor: '#ffffff',
    paddingPercent: 12,
    fitMode: 'contain',
    borderRadiusPercent: 0,
  });

  const [activeCategory, setActiveCategory] = useState<IconCategory>('all');
  const [previewShape, setPreviewShape] = useState<IconPreviewShape>('ios');
  const [isPackagingZip, setIsPackagingZip] = useState(false);
  const [previewDataUrls, setPreviewDataUrls] = useState<Record<string, string>>({});
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  useEffect(() => {
    if (!imageFile) {
      setPreviewDataUrls({});
      return;
    }

    let isMounted = true;

    const generatePreviews = async () => {
      try {
        const sourceImg = await loadImageElement(imageFile.objectUrl);
        const sampleSizes = [16, 32, 64, 192, 512];
        const urls: Record<string, string> = {};

        for (const size of sampleSizes) {
          const blob = await renderIconToBlob(sourceImg, size, size, config);
          if (isMounted) {
            urls[`${size}`] = URL.createObjectURL(blob);
          }
        }

        if (isMounted) {
          setPreviewDataUrls((prev) => {
            Object.values(prev).forEach((u) => URL.revokeObjectURL(u));
            return urls;
          });
        }
      } catch (err) {
        console.error('Failed to generate previews', err);
      }
    };

    const timer = setTimeout(generatePreviews, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [imageFile, config]);

  useEffect(() => {
    return () => {
      Object.values(previewDataUrls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewDataUrls]);

  const handleDownloadSinglePreset = useCallback(
    async (preset: IconPreset) => {
      if (!imageFile) return;
      try {
        const sourceImg = await loadImageElement(imageFile.objectUrl);
        const blob = await renderIconToBlob(sourceImg, preset.width, preset.height, config);
        downloadBlob(blob, preset.filename);
      } catch (err) {
        console.error('Failed single download', err);
      }
    },
    [imageFile, config]
  );

  const handleDownloadIcoFavicon = useCallback(async () => {
    if (!imageFile) return;
    try {
      const sourceImg = await loadImageElement(imageFile.objectUrl);
      const sizes = [16, 32, 48];
      const entries: Array<{ width: number; height: number; blob: Blob }> = [];

      for (const s of sizes) {
        const blob = await renderIconToBlob(sourceImg, s, s, config);
        entries.push({ width: s, height: s, blob });
      }

      const icoBlob = await createIcoFromPngs(entries);
      downloadBlob(icoBlob, 'favicon.ico');
    } catch (err) {
      console.error('Failed ICO download', err);
    }
  }, [imageFile, config]);

  const handleDownloadZipPackage = useCallback(async () => {
    if (!imageFile || isPackagingZip) return;
    setIsPackagingZip(true);

    try {
      const zipBlob = await generateFullIconPackage(imageFile.objectUrl, ICON_PRESETS, config);
      downloadBlob(zipBlob, 'app-icons-bundle.zip');
    } catch (err) {
      console.error('Failed packaging zip', err);
    } finally {
      setIsPackagingZip(false);
    }
  }, [imageFile, isPackagingZip, config]);

  const handleCopySnippet = useCallback(() => {
    navigator.clipboard.writeText(generateHtmlHeadSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  }, []);

  const filteredPresets =
    activeCategory === 'all'
      ? ICON_PRESETS
      : ICON_PRESETS.filter((p) => p.category === activeCategory);

  const getBorderRadiusClass = useCallback(() => {
    switch (previewShape) {
      case 'ios':
        return 'rounded-[22%]';
      case 'squircle':
        return 'rounded-[35%]';
      case 'circle':
        return 'rounded-full';
      default:
        return 'rounded-none';
    }
  }, [previewShape]);

  return {
    config,
    setConfig,
    activeCategory,
    setActiveCategory,
    previewShape,
    setPreviewShape,
    isPackagingZip,
    previewDataUrls,
    showCodeSnippet,
    setShowCodeSnippet,
    copiedSnippet,
    filteredPresets,
    getBorderRadiusClass,
    handleDownloadSinglePreset,
    handleDownloadIcoFavicon,
    handleDownloadZipPackage,
    handleCopySnippet,
  };
}
