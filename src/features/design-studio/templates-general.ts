import { DesignTemplate } from './types';
import { ALL_PRESETS } from './presets';
import { createTemplatePage } from './template-builders';
import { createBannerTemplatePage } from './banner-template-builder';

const androidPreset = ALL_PRESETS.find((p) => p.deviceType === 'android-phone') || ALL_PRESETS[6];
const bannerPreset = ALL_PRESETS.find((p) => p.deviceType === 'banner') || ALL_PRESETS[8];

export const generalTemplates: DesignTemplate[] = [
  {
    id: 'technical-developer',
    name: 'Technical Developer',
    style: 'technical',
    description: 'Minimalist monochrome aesthetic designed for developer tools and terminal utilities.',
    category: 'google',
    recommendedDimensions: androidPreset,
    createPages: (assets) => [
      createTemplatePage({
        title: '01 — Architecture',
        canvas: androidPreset,
        bgType: 'solid',
        bgColor: '#18181B',
        headline: 'Built For Developers',
        subtitle: 'WebAssembly & WebGPU pipelines running locally.',
        deviceModel: 'pixel-9-pro',
        assetId: assets?.[0]?.id,
        badgeText: 'OPEN STANDARDS',
      }),
      createTemplatePage({
        title: '02 — No Cloud Latency',
        canvas: androidPreset,
        bgType: 'solid',
        bgColor: '#18181B',
        headline: 'Instant Results Offline',
        subtitle: 'Process hundreds of megabytes without an internet connection.',
        deviceModel: 'pixel-9-pro',
        assetId: assets?.[1]?.id || assets?.[0]?.id,
        badgeText: 'ZERO SERVERS',
      }),
    ],
  },
  {
    id: 'feature-graphic-banner',
    name: 'Google Play Feature Graphic',
    style: 'marketing',
    description: 'Official 1024 x 500 Google Play header banner with device mockup on the right and title on the left.',
    category: 'banner',
    recommendedDimensions: bannerPreset,
    createPages: (assets) => [
      createBannerTemplatePage({
        title: 'Google Play Feature Graphic',
        canvas: bannerPreset,
        bgType: 'gradient',
        bgColor: '#0F172A',
        gradient: {
          type: 'linear',
          angle: 135,
          stops: [
            { color: '#1E293B', offset: 0 },
            { color: '#0F172A', offset: 1 },
          ],
        },
        headline: 'All-In-One Developer Media Suite',
        subtitle: 'Compress, crop, extract colors, and remove backgrounds with zero cloud latency.',
        deviceModel: 'pixel-9-pro',
        assetId: assets?.[0]?.id,
      }),
    ],
  },
  {
    id: 'opengraph-promo',
    name: 'Social & Product Hunt Banner',
    style: 'editorial',
    description: 'High-contrast 1200 x 630 preview card for Twitter cards, Slack links, and GitHub readme headers.',
    category: 'promo',
    recommendedDimensions: {
      width: 1200,
      height: 630,
      label: 'OpenGraph Banner',
      platform: 'promo',
      deviceType: 'banner',
    },
    createPages: (assets) => [
      createBannerTemplatePage({
        title: 'Social Share Card',
        canvas: {
          width: 1200,
          height: 630,
          label: 'OpenGraph Banner',
          platform: 'promo',
          deviceType: 'banner',
        },
        bgType: 'solid',
        bgColor: '#09090B',
        headline: 'Next-Gen Media Toolkit',
        subtitle: 'Clean browser-local tools trusted by engineers worldwide.',
        deviceModel: 'browser-window',
        assetId: assets?.[0]?.id,
      }),
    ],
  },
];
