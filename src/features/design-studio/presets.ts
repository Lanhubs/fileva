import { CanvasDimensions } from './types';

/**
 * Official Store specifications verified according to:
 * - Apple App Store Connect specifications:
 *   - iPhone 6.9" display (iPhone 16 Pro Max / Plus): 1320 x 2868 px (portrait) or 2868 x 1320 px (landscape)
 *   - iPhone 6.7" display (iPhone 15 Pro Max / 14 Pro Max / Plus): 1290 x 2796 px
 *   - iPhone 6.5" / 5.5" display (iPhone 11 Pro Max / 8 Plus): 1242 x 2688 px / 1242 x 2208 px
 *   - iPad Pro 13" (M4) / 12.9" (6th gen): 2064 x 2752 px or 2048 x 2732 px
 *   - Mac App Store screenshots: 2880 x 1800 px (16:10) or 2560 x 1600 px
 * 
 * - Google Play Console requirements:
 *   - Phone screenshots: Minimum 1080 x 1920 px (portrait) or 1920 x 1080 px (16:9), up to 8MB each, aspect 16:9 or 9:16 (common standard 1080 x 2400 px or 1080 x 2340 px)
 *   - 7-inch & 10-inch Tablet: 1200 x 1920 px (or 1600 x 2560 px / 2048 x 1536 px)
 *   - Google Play Feature Graphic (Mandatory): Exactly 1024 x 500 px (JPEG or 24-bit PNG, up to 15MB, no alpha)
 * 
 * - Promotional Banners & Product Showcases:
 *   - GitHub Readme / Product Hunt banner: 1280 x 640 px (2:1 aspect) or 1200 x 630 px (OpenGraph / Social)
 *   - Product Launch / Twitter Card: 1200 x 675 px (16:9)
 *   - Chrome Web Store promotional marquee: 1400 x 560 px (small: 440 x 280 px)
 */

export interface PresetGroup {
  id: string;
  name: string;
  category: 'apple' | 'google' | 'desktop' | 'promo';
  description: string;
  presets: CanvasDimensions[];
}

export const CANVAS_PRESET_GROUPS: PresetGroup[] = [
  {
    id: 'apple-app-store',
    name: 'Apple App Store',
    category: 'apple',
    description: 'Current App Store Connect specifications for iPhone, iPad, and Mac.',
    presets: [
      {
        width: 1320,
        height: 2868,
        label: 'iPhone 6.9" Display (iPhone 16 Pro Max)',
        platform: 'apple',
        deviceType: 'iphone',
        recommendedAspect: '19.5:9',
        description: 'Primary requirement for latest flagship iPhones (1320 x 2868 px)',
      },
      {
        width: 1290,
        height: 2796,
        label: 'iPhone 6.7" Display (iPhone 15 / 14 Pro Max)',
        platform: 'apple',
        deviceType: 'iphone',
        recommendedAspect: '19.5:9',
        description: 'Standard 6.7-inch iPhone screen size (1290 x 2796 px)',
      },
      {
        width: 1242,
        height: 2688,
        label: 'iPhone 6.5" Display (iPhone 11 Pro Max / XS Max)',
        platform: 'apple',
        deviceType: 'iphone',
        recommendedAspect: '19.5:9',
        description: 'Super Retina 6.5-inch resolution (1242 x 2688 px)',
      },
      {
        width: 2064,
        height: 2752,
        label: 'iPad Pro 13" Display (M4)',
        platform: 'apple',
        deviceType: 'ipad',
        recommendedAspect: '4:3',
        description: 'Latest 13-inch Ultra Retina XDR iPad (2064 x 2752 px)',
      },
      {
        width: 2048,
        height: 2732,
        label: 'iPad Pro 12.9" Display (6th gen)',
        platform: 'apple',
        deviceType: 'ipad',
        recommendedAspect: '4:3',
        description: 'Standard 12.9-inch iPad Pro display (2048 x 2732 px)',
      },
      {
        width: 2880,
        height: 1800,
        label: 'Mac App Store (Retina 16:10)',
        platform: 'apple',
        deviceType: 'mac',
        recommendedAspect: '16:10',
        description: 'Official macOS App Store presentation standard (2880 x 1800 px)',
      },
    ],
  },
  {
    id: 'google-play-store',
    name: 'Google Play Store',
    category: 'google',
    description: 'Verified Google Play Console requirements for Android phones, tablets, and feature graphics.',
    presets: [
      {
        width: 1080,
        height: 2400,
        label: 'Android Phone (FHD+ 20:9 Modern)',
        platform: 'google',
        deviceType: 'android-phone',
        recommendedAspect: '20:9',
        description: 'Flagship standard Android phone screenshot (1080 x 2400 px)',
      },
      {
        width: 1080,
        height: 1920,
        label: 'Android Phone (Standard 16:9 FHD)',
        platform: 'google',
        deviceType: 'android-phone',
        recommendedAspect: '16:9',
        description: 'Universal standard Android resolution (1080 x 1920 px)',
      },
      {
        width: 1024,
        height: 500,
        label: 'Google Play Feature Graphic',
        platform: 'google',
        deviceType: 'banner',
        recommendedAspect: '1024:500',
        description: 'Mandatory Google Play store header banner (Exactly 1024 x 500 px)',
      },
      {
        width: 1600,
        height: 2560,
        label: 'Android 10" Tablet (Portrait)',
        platform: 'google',
        deviceType: 'android-tablet',
        recommendedAspect: '16:10',
        description: 'Standard Android 10-inch tablet resolution (1600 x 2560 px)',
      },
      {
        width: 2560,
        height: 1600,
        label: 'Android 10" Tablet (Landscape)',
        platform: 'google',
        deviceType: 'android-tablet',
        recommendedAspect: '16:10',
        description: 'Landscape tablet presentation (2560 x 1600 px)',
      },
    ],
  },
  {
    id: 'promotional-marketing',
    name: 'Promotional & Store Banners',
    category: 'promo',
    description: 'Publish-ready visual assets for GitHub, Product Hunt, website headers, and social media.',
    presets: [
      {
        width: 1200,
        height: 630,
        label: 'OpenGraph & Social Share (1.91:1)',
        platform: 'promo',
        deviceType: 'banner',
        recommendedAspect: '1.91:1',
        description: 'Universal preview banner for Twitter, LinkedIn, Facebook, Slack (1200 x 630 px)',
      },
      {
        width: 1280,
        height: 640,
        label: 'GitHub Readme Hero / Product Hunt Banner',
        platform: 'promo',
        deviceType: 'banner',
        recommendedAspect: '2:1',
        description: 'Standard 2:1 ratio repository header banner (1280 x 640 px)',
      },
      {
        width: 1400,
        height: 560,
        label: 'Chrome Web Store Marquee Banner',
        platform: 'promo',
        deviceType: 'banner',
        recommendedAspect: '5:2',
        description: 'Official Chrome Web Store marquee header (1400 x 560 px)',
      },
      {
        width: 1920,
        height: 1080,
        label: 'Desktop Full HD Showcase (16:9)',
        platform: 'desktop',
        deviceType: 'browser',
        recommendedAspect: '16:9',
        description: 'Standard Full HD desktop showcase banner (1920 x 1080 px)',
      },
    ],
  },
];

export const ALL_PRESETS: CanvasDimensions[] = CANVAS_PRESET_GROUPS.flatMap((g) => g.presets);

export const DEFAULT_PRESET = ALL_PRESETS[0]; // iPhone 6.9"
