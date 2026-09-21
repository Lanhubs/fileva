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
  badgeText?: string;
}

export function createTemplatePage(opts: TemplatePageOptions): CanvasPage {
  const { title, canvas, bgType, bgColor, gradient, headline, subtitle, deviceModel, assetId, badgeText } = opts;
  const layers: CanvasPage['layers'] = [];
  let currentY = canvas.height * 0.08;

  if (badgeText) {
    layers.push({
      id: `layer-${Date.now()}-badge`,
      name: 'Category Badge',
      type: 'text',
      x: canvas.width * 0.1,
      y: currentY,
      width: canvas.width * 0.8,
      height: 48,
      rotation: 0,
      opacity: 1,
      zIndex: 1,
      visible: true,
      locked: false,
      text: badgeText,
      textRole: 'badge',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: Math.round(canvas.width * 0.024),
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: 2,
      textAlign: 'center',
      color: '#D94F3D',
      textTransform: 'uppercase',
    });
    currentY += canvas.height * 0.035;
  }

  layers.push({
    id: `layer-${Date.now()}-headline`,
    name: 'Headline',
    type: 'text',
    x: canvas.width * 0.08,
    y: currentY,
    width: canvas.width * 0.84,
    height: Math.round(canvas.height * 0.1),
    rotation: 0,
    opacity: 1,
    zIndex: 2,
    visible: true,
    locked: false,
    text: headline,
    textRole: 'headline',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: Math.round(canvas.width * 0.068),
    fontWeight: 800,
    lineHeight: 1.15,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: '#F8FAFC',
  });

  currentY += canvas.height * 0.085;

  layers.push({
    id: `layer-${Date.now()}-subtitle`,
    name: 'Subtitle',
    type: 'text',
    x: canvas.width * 0.1,
    y: currentY,
    width: canvas.width * 0.8,
    height: Math.round(canvas.height * 0.05),
    rotation: 0,
    opacity: 0.9,
    zIndex: 3,
    visible: true,
    locked: false,
    text: subtitle,
    textRole: 'subtitle',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: Math.round(canvas.width * 0.032),
    fontWeight: 500,
    lineHeight: 1.35,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#94A3B8',
  });

  const devWidth = canvas.width * 0.78;
  const devHeight = devWidth * (19.5 / 9);

  layers.push({
    id: `layer-${Date.now()}-device`,
    name: 'Device Mockup',
    type: 'device',
    x: (canvas.width - devWidth) / 2,
    y: canvas.height * 0.28,
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
    shadowIntensity: 0.45,
    innerCornerRadius: 44,
    notchOrIsland: 'island',
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
