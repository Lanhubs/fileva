import { ToolId } from '../../types';
import {
  FiHome,
  FiScissors,
  FiMinimize2,
  FiGrid,
  FiDroplet,
  FiCrop,
  FiLayout,
  FiFilm,
  FiMusic,
} from 'react-icons/fi';
import React from 'react';

export interface ToolConfigItem {
  id: ToolId;
  label: string;
  shortDesc: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const TOOLS_CONFIG: ToolConfigItem[] = [
  {
    id: 'home',
    label: 'Overview',
    shortDesc: 'Developer media suite',
    path: '/',
    icon: FiHome,
  },
  {
    id: 'design-studio',
    label: 'App Store Design Studio',
    shortDesc: 'Screenshots, banners & device frames',
    path: '/design-studio',
    icon: FiLayout,
  },
  {
    id: 'video-compressor',
    label: 'Video Compressor',
    shortDesc: 'H.264 & VP9 local encoding',
    path: '/video-compressor',
    icon: FiFilm,
  },
  {
    id: 'audio-compressor',
    label: 'Audio Compressor',
    shortDesc: 'MP3, AAC & Opus downmix',
    path: '/audio-compressor',
    icon: FiMusic,
  },
  {
    id: 'remover',
    label: 'Background Remover',
    shortDesc: 'Local segmentation & cutout',
    path: '/background-remover',
    icon: FiScissors,
  },
  {
    id: 'compressor',
    label: 'Image Compressor',
    shortDesc: 'Quality & target-size lossy/lossless',
    path: '/image-compressor',
    icon: FiMinimize2,
  },
  {
    id: 'icon-generator',
    label: 'App Icon Generator',
    shortDesc: 'Android, iOS, Web, PWA & Desktop',
    path: '/icon-generator',
    icon: FiGrid,
  },
  {
    id: 'color-extractor',
    label: 'Color Extractor',
    shortDesc: 'Dominant palette & pixel picker',
    path: '/color-extractor',
    icon: FiDroplet,
  },
  {
    id: 'cropper',
    label: 'Image Cropper',
    shortDesc: 'Precise aspect ratios & rotation',
    path: '/image-cropper',
    icon: FiCrop,
  },
];
