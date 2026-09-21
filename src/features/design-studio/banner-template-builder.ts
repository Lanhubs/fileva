import { CanvasDimensions, DeviceModel, CanvasPage } from './types';

export interface TemplatePageOptions {
  title: string;
  canvas: CanvasDimensions;
  bgType: 'solid' | 'gradient';
  bgColor: string;
  gradient?: { type: 'linear' | 'radial'; angle: number; stops: Array<{ color: string; offset: number }> };
  headline: string;
  subtitle: string;
  deviceModel: DeviceModel;
  assetId?: string;
}

export function createBannerTemplatePage(opts: TemplatePageOptions): CanvasPage {
  const { title, canvas, bgType, bgColor, gradient, headline, subtitle, deviceModel, assetId } = opts;
  const layers: CanvasPage['layers'] = [];
  const textX = canvas.width * 0.06;
  const textW = canvas.width * 0.46;

  layers.push({
    id: `layer-${Date.now()}-headline`,
    name: 'Headline',
    type: 'text',
    x: textX,
    y: canvas.height * 0.28,
    width: textW,
    height: canvas.height * 0.35,
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    visible: true,
    locked: false,
    text: headline,
    textRole: 'headline',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: Math.round(canvas.height * 0.095),
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: -0.5,
    textAlign: 'left',
    color: '#F8FAFC',
  });

  layers.push({
    id: `layer-${Date.now()}-subtitle`,
    name: 'Subtitle',
    type: 'text',
    x: textX,
    y: canvas.height * 0.58,
    width: textW,
    height: canvas.height * 0.25,
    rotation: 0,
    opacity: 0.85,
    zIndex: 3,
    visible: true,
    locked: false,
    text: subtitle,
    textRole: 'subtitle',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: Math.round(canvas.height * 0.044),
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#94A3B8',
  });

  const devHeight = canvas.height * 0.82;
  const isPhone = deviceModel === 'iphone-16-pro' || deviceModel === 'pixel-9-pro' || deviceModel === 'galaxy-s24';
  const devWidth = isPhone ? devHeight * (9 / 19.5) : devHeight * (16 / 10);
  const devX = canvas.width * 0.58;

  layers.push({
    id: `layer-${Date.now()}-device`,
    name: 'Device Mockup',
    type: 'device',
    x: devX,
    y: (canvas.height - devHeight) / 2 + 10,
    width: devWidth,
    height: devHeight,
    rotation: 0,
    opacity: 1,
    zIndex: 4,
    visible: true,
    locked: false,
    deviceModel,
    color: 'titanium',
    showShadow: true,
    shadowIntensity: 0.4,
    innerCornerRadius: isPhone ? 40 : 12,
    notchOrIsland: isPhone ? 'punchhole' : 'browser-bar',
    screenshotAssetId: assetId,
    screenshotScale: 1,
    screenshotOffsetX: 0,
    screenshotOffsetY: 0,
  });

  return {
    id: `page-${Math.random().toString(36).substring(2, 9)}`,
    title,
    background: { type: bgType, color: bgColor, gradient },
    layers,
  };
}
