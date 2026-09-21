import { DesignTemplate } from './types';
import { ALL_PRESETS } from './presets';
import { createTemplatePage } from './template-builders';

const iphonePreset = ALL_PRESETS[0];

export const appleTemplates: DesignTemplate[] = [
  {
    id: 'minimal-focus',
    name: 'Minimal Clean',
    style: 'minimal',
    description: 'Clean product-first presentation with elegant subtle device frame and high-contrast headline.',
    category: 'apple',
    recommendedDimensions: iphonePreset,
    createPages: (assets) => [
      createTemplatePage({
        title: '01 — Overview',
        canvas: iphonePreset,
        bgType: 'solid',
        bgColor: '#0F172A',
        headline: 'Lightning Fast Audio & Video',
        subtitle: '100% device-local processing with zero cloud lag.',
        deviceModel: 'iphone-16-pro',
        assetId: assets?.[0]?.id,
        badgeText: 'PRIVACY FIRST',
      }),
      createTemplatePage({
        title: '02 — High Compression',
        canvas: iphonePreset,
        bgType: 'solid',
        bgColor: '#0B132B',
        headline: 'Shrink Files Up To 90%',
        subtitle: 'Perceptual encoding that keeps crisp visual fidelity.',
        deviceModel: 'iphone-16-pro',
        assetId: assets?.[1]?.id || assets?.[0]?.id,
        badgeText: 'INTELLIGENT ENCODING',
      }),
      createTemplatePage({
        title: '03 — Batch Export',
        canvas: iphonePreset,
        bgType: 'solid',
        bgColor: '#111827',
        headline: 'Export All Platforms In One Click',
        subtitle: 'Pre-formatted presets for App Store, Google Play & Web.',
        deviceModel: 'iphone-16-pro',
        assetId: assets?.[2]?.id || assets?.[0]?.id,
        badgeText: 'STORE READY',
      }),
    ],
  },
  {
    id: 'bold-gradient',
    name: 'Bold Vibrant',
    style: 'bold',
    description: 'Dynamic gradient backdrop with bold modern typography and high-impact device framing.',
    category: 'apple',
    recommendedDimensions: iphonePreset,
    createPages: (assets) => [
      createTemplatePage({
        title: '01 — Hero Feature',
        canvas: iphonePreset,
        bgType: 'gradient',
        bgColor: '#1E1B4B',
        gradient: {
          type: 'linear',
          angle: 160,
          stops: [
            { color: '#312E81', offset: 0 },
            { color: '#1E1B4B', offset: 0.6 },
            { color: '#0F172A', offset: 1 },
          ],
        },
        headline: 'Professional Media Studio',
        subtitle: 'Full-featured developer utilities right in your pocket.',
        deviceModel: 'iphone-16-pro',
        assetId: assets?.[0]?.id,
      }),
      createTemplatePage({
        title: '02 — Background Remover',
        canvas: iphonePreset,
        bgType: 'gradient',
        bgColor: '#1E1B4B',
        gradient: {
          type: 'linear',
          angle: 160,
          stops: [
            { color: '#1E3A8A', offset: 0 },
            { color: '#0F172A', offset: 1 },
          ],
        },
        headline: 'Neural Background Removal',
        subtitle: 'Instant transparent cutouts with pixel-perfect edges.',
        deviceModel: 'iphone-16-pro',
        assetId: assets?.[1]?.id || assets?.[0]?.id,
      }),
      createTemplatePage({
        title: '03 — Color Extractor',
        canvas: iphonePreset,
        bgType: 'gradient',
        bgColor: '#1E1B4B',
        gradient: {
          type: 'linear',
          angle: 160,
          stops: [
            { color: '#4C1D95', offset: 0 },
            { color: '#0F172A', offset: 1 },
          ],
        },
        headline: 'Palette & Token Generator',
        subtitle: 'Extract harmonious color ramps straight to CSS and Tailwind.',
        deviceModel: 'iphone-16-pro',
        assetId: assets?.[2]?.id || assets?.[0]?.id,
      }),
    ],
  },
];
