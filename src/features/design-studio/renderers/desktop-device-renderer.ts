import { DeviceLayer } from '../types';
import { drawRoundedRectPath } from './render-utils';

export function drawBrowserWindow(
  ctx: CanvasRenderingContext2D,
  layer: DeviceLayer,
  assetMap: Map<string, HTMLImageElement>
) {
  const { x, y, width, height, showShadow, shadowIntensity, screenshotAssetId, screenshotScale = 1 } = layer;
  const barHeight = Math.max(32, width * 0.045);
  const cornerRadius = 12;

  if (showShadow) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity || 0.35})`;
    ctx.shadowBlur = Math.round(width * 0.06);
    ctx.shadowOffsetY = Math.round(width * 0.03);
    ctx.fillStyle = '#18181B';
    drawRoundedRectPath(ctx, x, y, width, height, cornerRadius);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  drawRoundedRectPath(ctx, x, y, width, height, cornerRadius);
  ctx.clip();

  ctx.fillStyle = '#27272A';
  ctx.fillRect(x, y, width, barHeight);

  const dotR = Math.max(4, barHeight * 0.16);
  const dotY = y + barHeight / 2;
  const colors = ['#EF4444', '#F59E0B', '#10B981'];
  colors.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x + 18 + i * (dotR * 2 + 8), dotY, dotR, 0, Math.PI * 2);
    ctx.fill();
  });

  const urlBarW = width * 0.45;
  const urlBarH = barHeight * 0.55;
  const urlBarX = x + (width - urlBarW) / 2;
  const urlBarY = y + (barHeight - urlBarH) / 2;
  ctx.fillStyle = '#18181B';
  drawRoundedRectPath(ctx, urlBarX, urlBarY, urlBarW, urlBarH, urlBarH / 2);
  ctx.fill();

  const contentY = y + barHeight;
  const contentH = height - barHeight;
  ctx.fillStyle = '#09090B';
  ctx.fillRect(x, contentY, width, contentH);

  if (screenshotAssetId && assetMap.has(screenshotAssetId)) {
    const img = assetMap.get(screenshotAssetId)!;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;

    const scale = Math.max(width / imgW, contentH / imgH) * screenshotScale;
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = x + (width - destW) / 2;
    const destY = contentY + (contentH - destH) / 2;

    ctx.drawImage(img, destX, destY, destW, destH);
  }

  ctx.restore();
}

export function drawMacbook(
  ctx: CanvasRenderingContext2D,
  layer: DeviceLayer,
  assetMap: Map<string, HTMLImageElement>
) {
  const { x, y, width, height, showShadow, shadowIntensity, screenshotAssetId } = layer;

  const baseH = height * 0.08;
  const screenH = height - baseH;
  const screenW = width * 0.88;
  const screenX = x + (width - screenW) / 2;

  if (showShadow) {
    ctx.save();
    ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity || 0.4})`;
    ctx.shadowBlur = Math.round(width * 0.06);
    ctx.shadowOffsetY = Math.round(width * 0.03);
    ctx.fillStyle = '#18181B';
    drawRoundedRectPath(ctx, screenX, y, screenW, screenH, 14);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  drawRoundedRectPath(ctx, screenX, y, screenW, screenH, 14);
  ctx.clip();
  ctx.fillStyle = '#09090B';
  ctx.fillRect(screenX, y, screenW, screenH);

  const bezel = screenW * 0.025;
  const innerX = screenX + bezel;
  const innerY = y + bezel;
  const innerW = screenW - bezel * 2;
  const innerH = screenH - bezel * 2;

  ctx.fillStyle = '#000000';
  ctx.fillRect(innerX, innerY, innerW, innerH);

  if (screenshotAssetId && assetMap.has(screenshotAssetId)) {
    const img = assetMap.get(screenshotAssetId)!;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const scale = Math.max(innerW / imgW, innerH / imgH);
    const destW = imgW * scale;
    const destH = imgH * scale;
    const destX = innerX + (innerW - destW) / 2;
    const destY = innerY + (innerH - destH) / 2;

    ctx.save();
    ctx.rect(innerX, innerY, innerW, innerH);
    ctx.clip();
    ctx.drawImage(img, destX, destY, destW, destH);
    ctx.restore();
  }
  ctx.restore();

  ctx.fillStyle = '#27272A';
  drawRoundedRectPath(ctx, x, y + screenH - 2, width, baseH, 6);
  ctx.fill();

  const notchW = width * 0.14;
  const notchH = baseH * 0.35;
  ctx.fillStyle = '#18181B';
  drawRoundedRectPath(ctx, x + (width - notchW) / 2, y + screenH - 2, notchW, notchH, 4);
  ctx.fill();
}
