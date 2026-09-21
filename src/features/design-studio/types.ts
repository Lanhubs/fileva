export type DesignStudioMode = 'screenshots' | 'banners' | 'promo';

export type PlatformPresetCategory = 'apple' | 'google' | 'desktop' | 'promo';

export interface CanvasDimensions {
  width: number;
  height: number;
  label: string;
  platform: 'apple' | 'google' | 'desktop' | 'promo';
  deviceType: 'iphone' | 'ipad' | 'android-phone' | 'android-tablet' | 'mac' | 'browser' | 'banner' | 'custom';
  description?: string;
  recommendedAspect?: string;
}

export type LayerType = 'screenshot' | 'device' | 'text' | 'shape' | 'image';

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  x: number; // percentage (0 to 100) or pixels - we use percentage of canvas for responsive scaling, or pixel coords based on standard canvas width/height
  y: number;
  width: number;
  height: number;
  rotation: number; // in degrees
  opacity: number; // 0 to 1
  zIndex: number;
  visible: boolean;
  locked: boolean;
}

export type DeviceModel =
  | 'iphone-16-pro'
  | 'iphone-15'
  | 'ipad-pro'
  | 'pixel-9-pro'
  | 'galaxy-s24'
  | 'android-tablet'
  | 'macbook-pro'
  | 'browser-window';

export interface DeviceLayer extends BaseLayer {
  type: 'device';
  deviceModel: DeviceModel;
  color: 'midnight' | 'silver' | 'titanium' | 'gold' | 'dark' | 'light';
  showShadow: boolean;
  shadowIntensity: number; // 0 to 1
  innerCornerRadius: number; // pixels in native scale
  notchOrIsland: 'island' | 'notch' | 'punchhole' | 'browser-bar' | 'none';
  screenshotAssetId?: string; // links to an imported screenshot asset to render inside the frame
  screenshotScale: number; // 1 = 100%
  screenshotOffsetX: number; // px inside screen
  screenshotOffsetY: number; // px inside screen
}

export interface ScreenshotLayer extends BaseLayer {
  type: 'screenshot';
  assetId: string;
  fitMode: 'contain' | 'cover' | 'fill';
  cornerRadius: number;
  showShadow: boolean;
  shadowIntensity: number;
  borderColor?: string;
  borderWidth?: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  assetId: string;
  fitMode: 'contain' | 'cover';
  cornerRadius: number;
  showShadow: boolean;
  shadowIntensity: number;
}

export type TextRole = 'headline' | 'subtitle' | 'badge' | 'custom';

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  textRole: TextRole;
  fontFamily: string; // standard system or uploaded custom font family name
  fontSize: number; // in canvas px
  fontWeight: 400 | 500 | 600 | 700 | 800 | 900;
  lineHeight: number; // e.g. 1.2
  letterSpacing: number; // e.g. -0.5px
  textAlign: 'left' | 'center' | 'right';
  color: string;
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  backgroundColor?: string; // for pill badge text
  paddingX?: number;
  paddingY?: number;
  borderRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
}

export type ShapeKind = 'rectangle' | 'rounded-rect' | 'circle' | 'pill' | 'line';

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeKind: ShapeKind;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  strokeDasharray?: string;
}

export type Layer = DeviceLayer | ScreenshotLayer | TextLayer | ShapeLayer | ImageLayer;

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'transparent';

export interface BackgroundConfig {
  type: BackgroundType;
  color: string; // solid color or fallback
  gradient?: {
    type: 'linear' | 'radial';
    angle: number; // in degrees for linear (e.g. 180 = top-to-bottom, 135 = diagonal)
    stops: Array<{ color: string; offset: number }>; // offset 0 to 1
  };
  imageAssetId?: string;
  imageFit?: 'cover' | 'contain';
  imageOpacity?: number;
}

export interface CanvasPage {
  id: string;
  title: string; // e.g. "01 - Overview", "02 - Fast Compress"
  background: BackgroundConfig;
  layers: Layer[];
}

export interface DesignAsset {
  id: string;
  name: string;
  file?: File;
  dataUrl?: string; // or objectUrl
  objectUrl: string;
  width: number;
  height: number;
  size: number;
}

export interface CustomFont {
  family: string;
  fileName: string;
  url: string;
  loaded: boolean;
}

export interface DesignProject {
  id: string;
  name: string;
  mode: DesignStudioMode;
  presetId: string;
  dimensions: CanvasDimensions;
  pages: CanvasPage[];
  activePageIndex: number;
  assets: DesignAsset[];
  customFonts: CustomFont[];
  createdAt: number;
  updatedAt: number;
}

export type TemplateStyle =
  | 'minimal'
  | 'product'
  | 'bold'
  | 'editorial'
  | 'technical'
  | 'marketing';

export interface DesignTemplate {
  id: string;
  name: string;
  style: TemplateStyle;
  description: string;
  category: 'apple' | 'google' | 'banner' | 'promo';
  recommendedDimensions: CanvasDimensions;
  createPages: (assets?: DesignAsset[]) => CanvasPage[];
}
