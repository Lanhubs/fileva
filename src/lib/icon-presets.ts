import { IconPreset } from '../types';

export const ICON_PRESETS: IconPreset[] = [
  // Android
  { id: 'android-mdpi', name: 'mdpi (1x)', category: 'android', width: 48, height: 48, filename: 'ic_launcher_48.png', description: 'Standard MDPI display' },
  { id: 'android-hdpi', name: 'hdpi (1.5x)', category: 'android', width: 72, height: 72, filename: 'ic_launcher_72.png', description: 'High density display' },
  { id: 'android-xhdpi', name: 'xhdpi (2x)', category: 'android', width: 96, height: 96, filename: 'ic_launcher_96.png', description: 'Extra high density display' },
  { id: 'android-xxhdpi', name: 'xxhdpi (3x)', category: 'android', width: 144, height: 144, filename: 'ic_launcher_144.png', description: 'Ultra high density' },
  { id: 'android-xxxhdpi', name: 'xxxhdpi (4x)', category: 'android', width: 192, height: 192, filename: 'ic_launcher_192.png', description: 'Maximum density display' },
  { id: 'android-adaptive', name: 'Adaptive Foreground', category: 'android', width: 432, height: 432, filename: 'ic_launcher_foreground_432.png', description: 'Material You adaptive icon' },
  { id: 'android-store', name: 'Google Play Store', category: 'android', width: 512, height: 512, filename: 'play_store_512.png', description: 'Play Console store listing' },

  // iOS
  { id: 'ios-notif-2x', name: 'Notification (2x)', category: 'ios', width: 40, height: 40, filename: 'icon_notification_40.png', description: 'iOS system notifications' },
  { id: 'ios-notif-3x', name: 'Notification (3x)', category: 'ios', width: 60, height: 60, filename: 'icon_notification_60.png', description: 'High-res notifications' },
  { id: 'ios-settings-2x', name: 'Settings (2x)', category: 'ios', width: 58, height: 58, filename: 'icon_settings_58.png', description: 'iOS Settings app' },
  { id: 'ios-settings-3x', name: 'Settings (3x)', category: 'ios', width: 87, height: 87, filename: 'icon_settings_87.png', description: 'High-res settings' },
  { id: 'ios-spotlight-2x', name: 'Spotlight (2x)', category: 'ios', width: 80, height: 80, filename: 'icon_spotlight_80.png', description: 'Spotlight search results' },
  { id: 'ios-spotlight-3x', name: 'Spotlight (3x)', category: 'ios', width: 120, height: 120, filename: 'icon_spotlight_120.png', description: 'Retina spotlight' },
  { id: 'ios-app-2x', name: 'iPhone App (2x)', category: 'ios', width: 120, height: 120, filename: 'icon_app_120.png', description: 'iPhone Home Screen' },
  { id: 'ios-app-3x', name: 'iPhone App (3x)', category: 'ios', width: 180, height: 180, filename: 'icon_app_180.png', description: 'Super Retina iPhone Home Screen' },
  { id: 'ios-ipad-app', name: 'iPad App', category: 'ios', width: 152, height: 152, filename: 'icon_ipad_152.png', description: 'iPad Home Screen' },
  { id: 'ios-ipad-pro', name: 'iPad Pro', category: 'ios', width: 167, height: 167, filename: 'icon_ipad_pro_167.png', description: 'iPad Pro Home Screen' },
  { id: 'ios-app-store', name: 'App Store', category: 'ios', width: 1024, height: 1024, filename: 'app_store_1024.png', description: 'App Store Connect icon' },

  // Web
  { id: 'web-fav-16', name: 'Favicon 16', category: 'web', width: 16, height: 16, filename: 'favicon-16x16.png', description: 'Browser tab icon' },
  { id: 'web-fav-32', name: 'Favicon 32', category: 'web', width: 32, height: 32, filename: 'favicon-32x32.png', description: 'Standard desktop favicon' },
  { id: 'web-fav-48', name: 'Favicon 48', category: 'web', width: 48, height: 48, filename: 'favicon-48x48.png', description: 'High-DPI favicon' },
  { id: 'web-touch', name: 'Apple Touch Icon', category: 'web', width: 180, height: 180, filename: 'apple-touch-icon.png', description: 'iOS Safari home bookmark' },

  // PWA
  { id: 'pwa-192', name: 'PWA Icon 192', category: 'pwa', width: 192, height: 192, filename: 'pwa-192x192.png', description: 'Web app manifest standard' },
  { id: 'pwa-512', name: 'PWA Icon 512', category: 'pwa', width: 512, height: 512, filename: 'pwa-512x512.png', description: 'Web app splash & install' },
  { id: 'pwa-mask-192', name: 'Maskable PWA 192', category: 'pwa', width: 192, height: 192, filename: 'pwa-maskable-192x192.png', maskable: true, description: 'Adaptive safe-zone icon' },
  { id: 'pwa-mask-512', name: 'Maskable PWA 512', category: 'pwa', width: 512, height: 512, filename: 'pwa-maskable-512x512.png', maskable: true, description: 'Adaptive safe-zone splash' },

  // Desktop
  { id: 'desktop-128', name: 'Desktop 128', category: 'desktop', width: 128, height: 128, filename: 'icon-128x128.png', description: 'macOS / Linux tray or launcher' },
  { id: 'desktop-256', name: 'Desktop 256', category: 'desktop', width: 256, height: 256, filename: 'icon-256x256.png', description: 'Desktop window icon' },
  { id: 'desktop-512', name: 'Desktop 512', category: 'desktop', width: 512, height: 512, filename: 'icon-512x512.png', description: 'High-res application icon' },
];

export function generatePwaManifestSnippet(): string {
  return JSON.stringify(
    {
      name: 'My Application',
      short_name: 'App',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0f172a',
      icons: [
        {
          src: '/icons/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icons/pwa-maskable-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: '/icons/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    null,
    2
  );
}

export function generateHtmlHeadSnippet(): string {
  return `<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />`;
}
