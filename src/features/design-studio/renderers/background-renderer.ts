import { CanvasDimensions, BackgroundConfig } from '../types';

export async function drawBackground(
  ctx: CanvasRenderingContext2D,
  dimensions: CanvasDimensions,
  bg: BackgroundConfig,
  assetMap: Map<string, HTMLImageElement>
) {
  const { width, height } = dimensions;

  if (bg.type === 'transparent') {
    ctx.clearRect(0, 0, width, height);
    return;
  }

  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color || '#0F172A';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bg.type === 'gradient' && bg.gradient) {
    const { angle = 180, stops = [] } = bg.gradient;

    if (bg.gradient.type === 'radial') {
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
      stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.offset)), s.color));
      ctx.fillStyle = grad;
    } else {
      const rad = ((angle - 90) * Math.PI) / 180;
      const r = Math.sqrt(width * width + height * height) / 2;
      const cx = width / 2;
      const cy = height / 2;
      const x0 = cx - Math.cos(rad) * r;
      const y0 = cy - Math.sin(rad) * r;
      const x1 = cx + Math.cos(rad) * r;
      const y1 = cy + Math.sin(rad) * r;

      const grad = ctx.createLinearGradient(x0, y0, x1, y1);
      stops.forEach((s) => grad.addColorStop(Math.min(1, Math.max(0, s.offset)), s.color));
      ctx.fillStyle = grad;
    }

    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bg.type === 'image' && bg.imageAssetId) {
    const img = assetMap.get(bg.imageAssetId);
    if (img) {
      ctx.save();
      if (bg.imageOpacity !== undefined) {
        ctx.globalAlpha = bg.imageOpacity;
      }
      ctx.drawImage(img, 0, 0, width, height);
      ctx.restore();
      return;
    }
  }

  ctx.fillStyle = bg.color || '#0F172A';
  ctx.fillRect(0, 0, width, height);
}
