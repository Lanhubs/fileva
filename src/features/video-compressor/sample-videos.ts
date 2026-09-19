/**
 * Generates test video files locally in-browser using HTML5 Canvas & MediaRecorder.
 * No network requests needed.
 */
export async function generateSampleVideo(
  type: 'motion' | 'compact'
): Promise<File> {
  const width = type === 'compact' ? 640 : 1280;
  const height = type === 'compact' ? 360 : 720;
  const durationSec = 3;
  const fps = 30;
  const totalFrames = durationSec * fps;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  // Set up audio context for video audio track
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  let audioTrack: MediaStreamTrack | null = null;
  let audioCtx: AudioContext | null = null;

  if (AudioContextClass) {
    try {
      audioCtx = new AudioContextClass();
      const dest = audioCtx.createMediaStreamDestination();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(dest);
      osc.start();
      audioTrack = dest.stream.getAudioTracks()[0] || null;
    } catch {
      // Audio not strictly required for sample video
    }
  }

  const stream = canvas.captureStream(fps);
  if (audioTrack) {
    stream.addTrack(audioTrack);
  }

  // Choose mime type supported by browser MediaRecorder
  let mimeType = 'video/webm;codecs=vp8,opus';
  if (MediaRecorder.isTypeSupported('video/mp4')) {
    mimeType = 'video/mp4';
  } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
    mimeType = 'video/webm;codecs=vp9,opus';
  } else if (MediaRecorder.isTypeSupported('video/webm')) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  // Render animated frames
  for (let frame = 0; frame < totalFrames; frame++) {
    const t = frame / totalFrames;
    const timeSec = (frame / fps).toFixed(2);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e293b');
    grad.addColorStop(1, '#0284c7');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Animated geometric grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Rotating developer icon / shapes
    const cx = width / 2;
    const cy = height / 2;
    const angle = t * Math.PI * 4;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-60, -60, 120, 120);

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // HUD Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`TEST VIDEO BENCHMARK [${width}x${height}]`, 40, 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px monospace';
    ctx.fillText(`TIME: ${timeSec}s / ${durationSec}.00s | FRAME: ${frame + 1}/${totalFrames}`, 40, 95);

    // Wait 1 frame tick
    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  recorder.stop();
  if (audioCtx) {
    audioCtx.close().catch(() => {});
  }

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `sample-${type}-benchmark.${ext}`, { type: mimeType });
      resolve(file);
    };
  });
}
