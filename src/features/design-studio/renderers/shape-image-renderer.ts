import { ShapeLayer, ScreenshotLayer, ImageLayer } from '../types';
import { drawRoundedRectPath } from './render-utils';

export function drawShapeLayer(ctx: CanvasRenderingContext2D, layer: ShapeLayer) {
  const { x, y, width, height, shapeKind, fillColor, strokeColor, strokeWidth, cornerRadius } = layer;

  ctx.save();
  ctx.fillStyle = fillColor;

  if (shapeKind === 'rounded-rect' || shapeKind === 'pill') {
    const r = shapeKind === 'pill' ? height / 2 : cornerRadius || 0;
    drawRoundedRectPath(ctx, x, y, width, height, r);
    ctx.fill();
    if (strokeWidth && strokeColor) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  } else if (shapeKind === 'circle') {
    ctx.beginPath();
    ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (strokeWidth && strokeColor) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  } else if (shapeKind === 'rectangle') {
    ctx.fillRect(x, y, width, height);
    if (strokeWidth && strokeColor) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.strokeRect(x, y, width, height);
    }
  } else if (shapeKind === 'line') {
    ctx.beginPath();
    ctx.moveTo(x, y + height / 2);
    ctx.lineTo(x + width, y + height / 2);
    ctx.lineWidth = strokeWidth || 2;
    ctx.strokeStyle = strokeColor || fillColor;
    ctx.stroke();
  }

  ctx.restore();
}

export function drawScreenshotLayer(
  ctx: CanvasRenderingContext2D,
  layer: ScreenshotLayer,
  assetMap: Map<string, HTMLImageElement>
) {
  const { x, y, width, height, assetId, cornerRadius = 0, showShadow, shadowIntensity = 0.3 } = layer;
  const img = assetMap.get(assetId);
  if (!img) return;

  ctx.save();
  if (showShadow) {
    ctx.shadowColor = `rgba(0,0,0,${shadowIntensity})`;
    ctx.shadowBlur = Math.round(width * 0.05);
    ctx.shadowOffsetY = Math.round(width * 0.025);
  }

  if (cornerRadius > 0) {
    drawRoundedRectPath(ctx, x, y, width, height, cornerRadius);
    ctx.clip();
  }

  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}

export function drawImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer,
  assetMap: Map<string, HTMLImageElement>
) {
  const { x, y, width, height, assetId, cornerRadius = 0 } = layer;
  const img = assetMap.get(assetId);
  if (!img) return;

  ctx.save();
  if (cornerRadius > 0) {
    drawRoundedRectPath(ctx, x, y, width, height, cornerRadius);
    ctx.clip();
  }

  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}
