import { TextLayer } from '../types';

export function drawTextLayer(ctx: CanvasRenderingContext2D, layer: TextLayer) {
  const {
    x,
    y,
    width,
    height,
    text,
    fontSize = 48,
    fontWeight = 700,
    fontFamily = 'Inter, sans-serif',
    color = '#FFFFFF',
    textAlign = 'center',
    lineHeight = 1.2,
    letterSpacing = 0,
    textTransform = 'none',
    backgroundColor,
    borderRadius = 8,
    paddingX = 16,
    paddingY = 8,
    shadowBlur,
    shadowColor,
  } = layer;

  if (!text) return;

  ctx.save();

  // Apply letter spacing if supported by browser canvas context
  if ('letterSpacing' in ctx && typeof letterSpacing === 'number' && letterSpacing !== 0) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  // Apply text transformation
  let processedText = text;
  if (textTransform === 'uppercase') {
    processedText = text.toUpperCase();
  } else if (textTransform === 'capitalize') {
    processedText = text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Draw optional pill/badge background if configured
  if (backgroundColor && backgroundColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = backgroundColor;
    const bgX = x;
    const bgY = y;
    const bgW = width;
    const bgH = height || fontSize * lineHeight + paddingY * 2;
    const r = Math.min(borderRadius, bgH / 2, bgW / 2);

    ctx.beginPath();
    ctx.moveTo(bgX + r, bgY);
    ctx.lineTo(bgX + bgW - r, bgY);
    ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + r);
    ctx.lineTo(bgX + bgW, bgY + bgH - r);
    ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - r, bgY + bgH);
    ctx.lineTo(bgX + r, bgY + bgH);
    ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - r);
    ctx.lineTo(bgX, bgY + r);
    ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (shadowBlur) {
    ctx.shadowColor = shadowColor || 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = 4;
  }

  const innerX = backgroundColor ? x + paddingX : x;
  const innerW = backgroundColor ? Math.max(10, width - paddingX * 2) : width;
  const innerY = backgroundColor ? y + paddingY : y;

  let textX = innerX;
  if (textAlign === 'center') textX = innerX + innerW / 2;
  else if (textAlign === 'right') textX = innerX + innerW;

  const words = processedText.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = currentLine ? `${currentLine} ${words[n]}` : words[n];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > innerW && n > 0) {
      lines.push(currentLine);
      currentLine = words[n];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  const stepY = fontSize * lineHeight;
  lines.forEach((line, index) => {
    ctx.fillText(line, textX, innerY + index * stepY);
  });

  ctx.restore();
}
