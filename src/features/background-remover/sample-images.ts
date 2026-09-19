/**
 * Generates sample image files entirely in-browser for quick testing of:
 * - Portrait / Person (with hair and silhouette)
 * - Product (gadget with shadows & highlights)
 * - Complex background (textured geometric scene)
 */

export async function generateSampleImage(
  type: 'portrait' | 'product' | 'complex'
): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  if (type === 'portrait') {
    // Background: Outdoor bokeh/gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 640, 640);
    bgGrad.addColorStop(0, '#e0f2fe');
    bgGrad.addColorStop(0.5, '#bae6fd');
    bgGrad.addColorStop(1, '#7dd3fc');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 640);

    // Decorative background circles (bokeh)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.beginPath();
    ctx.arc(140, 160, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(500, 220, 110, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(420, 100, 60, 0, Math.PI * 2);
    ctx.fill();

    // Person silhouette / portrait
    // Shoulders / torso
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(320, 560, 210, 140, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = '#f87171';
    ctx.fillRect(280, 310, 80, 100);

    // Head / Face
    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.ellipse(320, 260, 110, 130, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair with fine strands/wisps for testing hair edge matting
    ctx.fillStyle = '#331800';
    ctx.beginPath();
    ctx.arc(320, 230, 125, Math.PI * 0.85, Math.PI * 2.15);
    ctx.lineTo(440, 330);
    ctx.lineTo(200, 330);
    ctx.closePath();
    ctx.fill();

    // Hair strands/wisps
    ctx.strokeStyle = '#331800';
    ctx.lineWidth = 3;
    for (let i = 0; i < 24; i++) {
      const angle = Math.PI * 0.9 + (i * Math.PI) / 22;
      const x1 = 320 + Math.cos(angle) * 125;
      const y1 = 230 + Math.sin(angle) * 125;
      const x2 = 320 + Math.cos(angle) * (140 + (i % 3) * 8);
      const y2 = 230 + Math.sin(angle) * (140 + (i % 3) * 8);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Sunglasses / features
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(240, 240, 65, 35, 8);
    ctx.roundRect(335, 240, 65, 35, 8);
    ctx.fill();
    ctx.fillRect(305, 252, 30, 8);

    // Smile
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(320, 320, 35, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else if (type === 'product') {
    // Studio backdrop with floor shadow
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 640);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.7, '#e2e8f0');
    bgGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 640, 640);

    // Product drop shadow
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(320, 470, 180, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Camera body (Product)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(190, 240, 260, 180, 20);
    ctx.fill();

    // Top viewfinder bump
    ctx.beginPath();
    ctx.roundRect(270, 205, 100, 45, 8);
    ctx.fill();

    // Shutter button & dial
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(220, 220, 30, 20, 4);
    ctx.roundRect(390, 225, 40, 15, 4);
    ctx.fill();

    // Lens outer ring
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(320, 330, 80, 0, Math.PI * 2);
    ctx.fill();

    // Lens inner glass reflection
    const glassGrad = ctx.createRadialGradient(300, 310, 10, 320, 330, 70);
    glassGrad.addColorStop(0, '#38bdf8');
    glassGrad.addColorStop(0.5, '#0369a1');
    glassGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.arc(320, 330, 65, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight on glass
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.ellipse(295, 305, 25, 12, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Complex checkered / textured background
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, 640, 640);

    // Diagonal stripes on background
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 14;
    for (let i = -640; i < 1280; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 640, 640);
      ctx.stroke();
    }

    // Foreground organic star/flower object with intricate points
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    const cx = 320;
    const cy = 320;
    const points = 16;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? 180 : 100;
      const angle = (i * Math.PI) / points;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Center badge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 65, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to generate sample image blob'));
        return;
      }
      const filename = `sample-${type}.png`;
      const file = new File([blob], filename, { type: 'image/png' });
      resolve(file);
    }, 'image/png');
  });
}
