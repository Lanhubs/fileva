import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiScissors,
  FiMinimize2,
  FiGrid,
  FiDroplet,
  FiCrop,
  FiArrowRight,
  FiHardDrive,
  FiCpu,
  FiLock,
  FiLayers,
  FiFilm,
  FiMusic,
} from 'react-icons/fi';
import { ToolId } from '../types';
import { DropZone } from '../components/common/DropZone';

interface DashboardProps {
  onSelectTool: (tool: ToolId) => void;
  onFileUploaded: (file: File) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTool,
  onFileUploaded,
}) => {
  const tools = [
    {
      id: 'video-compressor' as ToolId,
      path: '/video-compressor',
      name: 'Video Compressor',
      tagline: 'Local H.264 & VP9 video encoding & downscaling',
      description: 'WebAssembly video encoding with resolution downscaling (1080p, 720p, 480p), CRF quality tuning, target file size calculation, and lossless remuxing.',
      formats: 'MP4, WebM, MOV',
      icon: FiFilm,
    },
    {
      id: 'audio-compressor' as ToolId,
      path: '/audio-compressor',
      name: 'Audio Compressor',
      tagline: 'Perceptual audio compression & channel downmix',
      description: 'Compress MP3, AAC, and Opus audio streams with custom bitrates (64k to 320k), mono/stereo downmixing, sample rate resampling, and target size matching.',
      formats: 'MP3, AAC, OGG, WAV',
      icon: FiMusic,
    },
    {
      id: 'compressor' as ToolId,
      path: '/image-compressor',
      name: 'Image Compressor',
      tagline: 'Reduce file size while preserving visual quality',
      description: 'Lossy and lossless compression with target file-size binary search, dimension downscaling, and browser-native JPEG, PNG, WebP, and AVIF encoding.',
      formats: 'JPEG, PNG, WebP, AVIF',
      icon: FiMinimize2,
    },
    {
      id: 'remover' as ToolId,
      path: '/background-remover',
      name: 'Background Remover',
      tagline: 'Remove image backgrounds locally',
      description: 'Neural network in-browser segmentation with IS-Net ONNX models, WebAssembly/WebGPU acceleration, and transparent PNG or alpha matte export.',
      formats: 'PNG, JPEG, WebP, AVIF',
      icon: FiScissors,
    },
    {
      id: 'icon-generator' as ToolId,
      path: '/icon-generator',
      name: 'App Icon / Logo Generator',
      tagline: 'Generate platform-ready application icon sets',
      description: 'Export structured packages for Android, iOS, Web Favicons, multi-resolution .ico, PWA maskable icons, and desktop in a single client-side ZIP.',
      formats: 'PNG, ICO, ZIP',
      icon: FiGrid,
    },
    {
      id: 'color-extractor' as ToolId,
      path: '/color-extractor',
      name: 'Color Extractor',
      tagline: 'Detect dominant and useful colors from images',
      description: 'Fast spatial quantization algorithm off the main thread. Exports to CSS variables, Tailwind configuration, JSON, and PNG palette swatches.',
      formats: 'HEX, RGB, HSL, CSS',
      icon: FiDroplet,
    },
    {
      id: 'cropper' as ToolId,
      path: '/image-cropper',
      name: 'Image Cropper',
      tagline: 'Precisely crop and export images',
      description: 'Pixel-accurate crop box with aspect ratios (1:1, 16:9, 4:3, custom), free rotation, 90° flipping, and high-performance Canvas rendering.',
      formats: 'PNG, JPEG, WebP',
      icon: FiCrop,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Intro Header */}
      <div className="border border-border bg-surface rounded-lg p-6 sm:p-8">
        <div className="max-w-3xl">
         
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main mb-2">
            Developer Media Toolkit
          </h2>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed">
            Essential media and asset utilities, processed locally in your browser. No remote servers, no third-party APIs, and zero telemetry.
          </p>
        </div>

        {/* Global Drop Zone for Quick Start */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs font-mono text-text-muted uppercase tracking-wider mb-2">
            Quick Start: Load Any Image
          </p>
          <DropZone
            onFileSelected={(file) => {
              onFileUploaded(file);
              // Default to compressor when dropped from home
              onSelectTool('compressor');
            }}
            acceptText="PNG, JPEG, WebP, AVIF, SVG, BMP"
          />
        </div>
      </div>

      {/* Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono font-bold tracking-wider text-text-muted uppercase">
            Available Utilities
          </h3>
          <span className="text-xs font-mono text-text-muted">
            7 MODULES LOADED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                id={`card-tool-${tool.id}`}
                onClick={() => onSelectTool(tool.id)}
                className="group flex flex-col justify-between p-5 rounded-lg border border-border bg-surface hover:border-primary transition-all cursor-pointer shadow-none"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded border border-border bg-background text-text-main flex items-center justify-center group-hover:bg-primary-light group-hover:text-primary transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-border bg-background text-text-muted">
                      {tool.formats}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-text-main mb-1 group-hover:text-primary transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-xs font-medium text-text-muted mb-2">
                    {tool.tagline}
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs font-medium text-text-muted group-hover:text-primary">
                  <span>Open Tool</span>
                  <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Technical Architecture Specs */}
      <div className="border border-border bg-background rounded-lg p-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-3">
          Runtime Architecture & Standards
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-surface rounded border border-border">
            <div className="flex items-center gap-2 font-medium text-text-main mb-1">
              <FiHardDrive className="w-4 h-4 text-primary" />
              <span>Canvas 2D & Blobs</span>
            </div>
            <p className="text-text-muted">
              Low-latency native rasterization and binary blob encoding.
            </p>
          </div>

          <div className="p-3 bg-surface rounded border border-border">
            <div className="flex items-center gap-2 font-medium text-text-main mb-1">
              <FiCpu className="w-4 h-4 text-emerald-600" />
              <span>Quantization Engine</span>
            </div>
            <p className="text-text-muted">
              Downsampled pixel spatial clustering and CIELAB color math.
            </p>
          </div>

          <div className="p-3 bg-surface rounded border border-border">
            <div className="flex items-center gap-2 font-medium text-text-main mb-1">
              <FiLayers className="w-4 h-4 text-amber-600" />
              <span>Native Binary ICO</span>
            </div>
            <p className="text-text-muted">
              ArrayBuffer & DataView binary encoder for multi-res favicons.
            </p>
          </div>

          <div className="p-3 bg-surface rounded border border-border">
            <div className="flex items-center gap-2 font-medium text-text-main mb-1">
              <FiLock className="w-4 h-4 text-primary" />
              <span>Client-Side ZIP</span>
            </div>
            <p className="text-text-muted">
              In-memory deflate archiving for batch asset downloads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
