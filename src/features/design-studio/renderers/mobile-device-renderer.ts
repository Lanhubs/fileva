import { DeviceLayer } from '../types';
import { drawRoundedRectPath } from './render-utils';

export function drawMobileDevice(
  ctx: CanvasRenderingContext2D,
  layer: DeviceLayer,
  assetMap: Map<string, HTMLImageElement>
) {
  const {
    x,
    y,
    width,
    height,
    deviceModel,
    color = 'titanium',
    showShadow,
    shadowIntensity,
    screenshotAssetId,
    screenshotScale = 1,
  } = layer;

  const isTablet = deviceModel === 'ipad-pro';
  const cornerRadius = isTablet ? 28 : Math.min(width * 0.13, 52);
  const bezel = isTablet ? width * 0.035 : width * 0.026;

  if (showShadow) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity || 0.42})`;
    ctx.shadowBlur = Math.round(width * 0.08);
    ctx.shadowOffsetY = Math.round(width * 0.04);
    ctx.fillStyle = '#1C1917';
    drawRoundedRectPath(ctx, x, y, width, height, cornerRadius);
    ctx.fill();
    ctx.restore();
  }

  const chassisColors: Record<string, string> = {
    titanium: '#383636',
    midnight: '#191C24',
    silver: '#D1D5DB',
    gold: '#C5A880',
    dark: '#18181B',
    light: '#E4E4E7',
  };
  const outerFinish = chassisColors[color] || '#383636';

  ctx.fillStyle = outerFinish;
  drawRoundedRectPath(ctx, x, y, width, height, cornerRadius);
  ctx.fill();

  const innerX = x + bezel;
  const innerY = y + bezel;
  const innerW = width - bezel * 2;
  const innerH = height - bezel * 2;
  const innerR = Math.max(8, cornerRadius - bezel);

  ctx.save();
  drawRoundedRectPath(ctx, innerX, innerY, innerW, innerH, innerR);
  ctx.clip();
  ctx.fillStyle = '#000000';
  ctx.fillRect(innerX, innerY, innerW, innerH);

  if (screenshotAssetId && assetMap.has(screenshotAssetId)) {
    const img = assetMap.get(screenshotAssetId)!;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const scale = Math.max(innerW / imgW, innerH / imgH) * screenshotScale;
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = innerX + (innerW - destW) / 2;
    const destY = innerY + (innerH - destH) / 2;

    ctx.drawImage(img, destX, destY, destW, destH);
  }

  // Draw Dynamic Island / Punch Hole / Notch
  if (deviceModel.includes('iphone')) {
    const islandW = innerW * 0.28;
    const islandH = Math.max(18, innerW * 0.075);
    const islandX = innerX + (innerW - islandW) / 2;
    const islandY = innerY + innerW * 0.025;
    ctx.fillStyle = '#000000';
    drawRoundedRectPath(ctx, islandX, islandY, islandW, islandH, islandH / 2);
    ctx.fill();
  } else if (deviceModel.includes('pixel') || deviceModel.includes('galaxy')) {
    const punchR = Math.max(6, innerW * 0.024);
    const punchX = innerX + innerW / 2;
    const punchY = innerY + innerW * 0.04;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(punchX, punchY, punchR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
