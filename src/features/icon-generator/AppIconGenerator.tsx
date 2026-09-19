import React, { useState, useEffect, useRef } from 'react';
import {
  FiDownload,
  FiSliders,
  FiRefreshCw,
  FiArchive,
  FiCode,
  FiCheck,
  FiLayers,
  FiGrid,
  FiSmartphone,
  FiGlobe,
  FiMonitor,
} from 'react-icons/fi';
import { ImageFileState, IconPreset } from '../../types';
import { ICON_PRESETS, generatePwaManifestSnippet, generateHtmlHeadSnippet } from '../../lib/icon-presets';
import { IconGenerationConfig, renderIconToBlob, generateFullIconPackage } from './icon-engine';
import { loadImageElement, downloadBlob, formatBytes } from '../../lib/file-utils';
import { createIcoFromPngs } from '../../lib/ico-generator';
import { DropZone } from '../../components/common/DropZone';
import { Checkerboard } from '../../components/common/Checkerboard';

interface AppIconGeneratorProps {
  imageFile: ImageFileState | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

export const AppIconGenerator: React.FC<AppIconGeneratorProps> = ({
  imageFile,
  onFileSelect,
  onClear,
}) => {
  const [config, setConfig] = useState<IconGenerationConfig>({
    backgroundColor: '#ffffff',
    paddingPercent: 12,
    fitMode: 'contain',
    borderRadiusPercent: 0,
  });

  const [activeCategory, setActiveCategory] = useState<'all' | 'android' | 'ios' | 'web' | 'pwa' | 'desktop'>('all');
  const [previewShape, setPreviewShape] = useState<'square' | 'ios' | 'squircle' | 'circle'>('ios');
  const [isPackagingZip, setIsPackagingZip] = useState(false);
  const [previewDataUrls, setPreviewDataUrls] = useState<Record<string, string>>({});
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Generate previews for the selected presets
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
            // Cleanup previous URLs
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

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(previewDataUrls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  const handleDownloadSinglePreset = async (preset: IconPreset) => {
    if (!imageFile) return;
    try {
      const sourceImg = await loadImageElement(imageFile.objectUrl);
      const blob = await renderIconToBlob(sourceImg, preset.width, preset.height, config);
      downloadBlob(blob, preset.filename);
    } catch (err) {
      console.error('Failed single download', err);
    }
  };

  const handleDownloadIcoFavicon = async () => {
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
  };

  const handleDownloadZipPackage = async () => {
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
  };

  const filteredPresets = activeCategory === 'all'
    ? ICON_PRESETS
    : ICON_PRESETS.filter((p) => p.category === activeCategory);

  const getBorderRadiusClass = () => {
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
  };

  if (!imageFile) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="border border-border bg-surface rounded-lg p-6">
          <h2 className="text-lg font-bold text-text-main mb-1">
            App Icon / Logo Generator
          </h2>
          <p className="text-xs text-text-muted mb-6">
            Generate platform-ready icon sets for Android, iOS, Web Favicons (.ico & PNG), PWA, and Desktop in one click.
          </p>
          <DropZone onFileSelected={onFileSelect} acceptText="PNG, SVG, WebP, JPEG" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Icon Config */}
        <div className="lg:col-span-1 space-y-5 border border-border bg-surface rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-primary" /> Icon Parameters
            </h3>
            <button
              onClick={onClear}
              className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" /> Change
            </button>
          </div>

          {/* Background Treatment */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-main flex justify-between">
              <span>Background Color</span>
              <span className="font-mono text-text-muted">{config.backgroundColor}</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, backgroundColor: 'transparent' }))}
                className={`flex-1 py-1.5 px-2 rounded border text-xs font-medium transition-colors cursor-pointer ${
                  config.backgroundColor === 'transparent'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                Transparent
              </button>
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, backgroundColor: '#ffffff' }))}
                className={`flex-1 py-1.5 px-2 rounded border text-xs font-medium transition-colors cursor-pointer ${
                  config.backgroundColor === '#ffffff'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, backgroundColor: '#1A1817' }))}
                className={`flex-1 py-1.5 px-2 rounded border text-xs font-medium transition-colors cursor-pointer ${
                  config.backgroundColor === '#1A1817' || config.backgroundColor === '#0f172a'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                Dark
              </button>
            </div>
            {config.backgroundColor !== 'transparent' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={config.backgroundColor === 'transparent' ? '#ffffff' : config.backgroundColor}
                  onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                  className="w-8 h-8 rounded border border-border cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={config.backgroundColor}
                  onChange={(e) => setConfig((c) => ({ ...c, backgroundColor: e.target.value }))}
                  className="flex-1 px-2.5 py-1 text-xs font-mono border border-border rounded bg-surface text-text-main focus:outline-none focus:border-primary"
                  placeholder="#ffffff"
                />
              </div>
            )}
          </div>

          {/* Padding Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-text-muted">Safe Padding:</span>
              <span className="font-bold text-text-main">{config.paddingPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={config.paddingPercent}
              onChange={(e) =>
                setConfig((c) => ({ ...c, paddingPercent: Number(e.target.value) }))
              }
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-text-muted font-mono">
              <span>Full Bleed (0%)</span>
              <span>Recommended (12%)</span>
              <span>Generous (40%)</span>
            </div>
          </div>

          {/* Fit Mode */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-main">
              Logo Fit Mode
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, fitMode: 'contain' }))}
                className={`py-1.5 px-3 rounded border font-medium text-center transition-colors cursor-pointer ${
                  config.fitMode === 'contain'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                Contain (Aspect Ratio)
              </button>
              <button
                type="button"
                onClick={() => setConfig((c) => ({ ...c, fitMode: 'cover' }))}
                className={`py-1.5 px-3 rounded border font-medium text-center transition-colors cursor-pointer ${
                  config.fitMode === 'cover'
                    ? 'border-primary bg-primary-light text-primary font-bold'
                    : 'border-border text-text-main hover:bg-background'
                }`}
              >
                Cover (Fill Bounds)
              </button>
            </div>
          </div>

          {/* Preview Shape Mask */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="text-xs font-semibold text-text-main">
              Preview Frame Shape
            </label>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {[
                { id: 'ios', label: 'iOS' },
                { id: 'squircle', label: 'Android' },
                { id: 'circle', label: 'Circle' },
                { id: 'square', label: 'Square' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setPreviewShape(s.id as any)}
                  className={`py-1 rounded border text-center text-[11px] font-medium transition-colors cursor-pointer ${
                    previewShape === s.id
                      ? 'border-primary bg-primary-light text-primary font-bold'
                      : 'border-border text-text-muted hover:text-text-main hover:bg-background'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* ZIP and Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-border">
            <button
              onClick={handleDownloadZipPackage}
              disabled={isPackagingZip}
              className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
            >
              <FiArchive className="w-4 h-4" />
              <span>{isPackagingZip ? 'Packaging In-Memory ZIP...' : 'Download Complete Package (.ZIP)'}</span>
            </button>

            <button
              onClick={handleDownloadIcoFavicon}
              className="w-full py-2 px-3 bg-surface hover:bg-background text-text-main rounded font-medium text-xs flex items-center justify-center gap-2 border border-border transition-colors cursor-pointer"
            >
              <FiGlobe className="w-3.5 h-3.5 text-primary" />
              <span>Download Multi-Resolution favicon.ico</span>
            </button>

            <button
              onClick={() => setShowCodeSnippet(!showCodeSnippet)}
              className="w-full py-1.5 px-3 text-text-muted hover:text-text-main rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FiCode className="w-3.5 h-3.5" />
              <span>{showCodeSnippet ? 'Hide PWA & HTML Tags' : 'View PWA & HTML Code'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Previews & Presets Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Scale Previews Bar */}
          <div className="border border-border bg-surface rounded-lg p-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-4">
              Real-Size Device Simulators
            </h4>

            <div className="flex flex-wrap items-end gap-6 sm:gap-8 justify-start">
              {/* 192px Android/PWA */}
              <div className="space-y-1.5 text-center">
                <div className={`w-28 h-28 border border-border bg-background overflow-hidden ${getBorderRadiusClass()}`}>
                  {previewDataUrls['192'] && (
                    <img src={previewDataUrls['192']} alt="192px icon" className="w-full h-full object-contain" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-text-muted block">192×192</span>
              </div>

              {/* 64px App Icon */}
              <div className="space-y-1.5 text-center">
                <div className={`w-16 h-16 border border-border bg-background overflow-hidden ${getBorderRadiusClass()}`}>
                  {previewDataUrls['64'] && (
                    <img src={previewDataUrls['64']} alt="64px icon" className="w-full h-full object-contain" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-text-muted block">64×64</span>
              </div>

              {/* 32px Tab Favicon */}
              <div className="space-y-1.5 text-center">
                <div className="w-8 h-8 border border-border bg-background overflow-hidden rounded">
                  {previewDataUrls['32'] && (
                    <img src={previewDataUrls['32']} alt="32px favicon" className="w-full h-full object-contain" />
                  )}
                </div>
                <span className="text-[11px] font-mono text-text-muted block">32×32</span>
              </div>

              {/* 16px Browser Tab simulation */}
              <div className="space-y-1.5 text-center">
                <div className="px-3 py-1.5 rounded bg-background border border-border flex items-center gap-2">
                  <div className="w-4 h-4 overflow-hidden">
                    {previewDataUrls['16'] && (
                      <img src={previewDataUrls['16']} alt="16px tab" className="w-full h-full object-contain" />
                    )}
                  </div>
                  <span className="text-xs text-text-main font-sans">New Tab</span>
                </div>
                <span className="text-[11px] font-mono text-text-muted block">16×16 Tab</span>
              </div>
            </div>
          </div>

          {/* HTML Snippet Drawer */}
          {showCodeSnippet && (
            <div className="border border-border bg-[#181716] text-[#EBE7E0] rounded-lg p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#A8A29D]">HTML &lt;head&gt; Integration Tags</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateHtmlHeadSnippet());
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-[#2A2624] hover:bg-[#35312E] text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedSnippet ? <FiCheck className="text-emerald-400" /> : null}
                  <span>{copiedSnippet ? 'Copied' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3 bg-[#11100F] rounded overflow-x-auto text-[11px] leading-relaxed text-[#D6D2CD] border border-[#2A2624]">
                {generateHtmlHeadSnippet()}
              </pre>
            </div>
          )}

          {/* Presets List */}
          <div className="border border-border bg-surface rounded-lg p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border mb-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-text-main">
                Target Platform Presets ({filteredPresets.length})
              </h4>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1 text-xs font-mono">
                {(['all', 'android', 'ios', 'web', 'pwa', 'desktop'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2 py-1 rounded capitalize font-medium transition-colors cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-primary text-white font-bold'
                        : 'bg-background text-text-muted hover:text-text-main border border-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Table */}
            <div className="max-h-96 overflow-y-auto divide-y divide-border text-xs">
              {filteredPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="py-2.5 flex items-center justify-between hover:bg-background px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-text-muted w-20 shrink-0">
                      {preset.width}×{preset.height}
                    </span>
                    <div>
                      <div className="font-medium text-text-main flex items-center gap-2">
                        <span>{preset.name}</span>
                        {preset.maskable && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            maskable
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-text-muted font-mono">
                        {preset.filename} • {preset.description}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadSinglePreset(preset)}
                    className="p-1.5 rounded hover:bg-background text-text-muted hover:text-text-main transition-colors cursor-pointer"
                    title={`Download ${preset.filename}`}
                    aria-label={`Download ${preset.filename}`}
                  >
                    <FiDownload className="w-4 h-4 text-primary" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
