/**
 * Generates sample audio files locally in-browser using Web Audio API.
 * Encodes uncompressed 16-bit PCM WAV.
 */
export async function generateSampleAudio(
  type: 'speech-synth' | 'music'
): Promise<File> {
  const sampleRate = 44100;
  const duration = 4.0;
  const totalSamples = Math.floor(sampleRate * duration);

  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) throw new Error('Web Audio API not supported');

  const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

  if (type === 'music') {
    // Harmonic chords: C Major (C4, E4, G4, B4)
    const freqs = [261.63, 329.63, 392.0, 493.88];
    freqs.forEach((f, idx) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, 0);

      // Envelope
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(0.15, 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, duration - 0.2);
      gain.gain.linearRampToValueAtTime(0, duration);

      osc.connect(gain);
      gain.connect(offlineCtx.destination);
      osc.start(0);
      osc.stop(duration);
    });
  } else {
    // Simulated voice formant / speech-like tone
    const osc = offlineCtx.createOscillator();
    const filter = offlineCtx.createBiquadFilter();
    const gain = offlineCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, 0);
    // Pitch inflection like a spoken phrase
    osc.frequency.linearRampToValueAtTime(190, 1.2);
    osc.frequency.linearRampToValueAtTime(130, 2.5);
    osc.frequency.linearRampToValueAtTime(110, duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, 0);
    filter.frequency.linearRampToValueAtTime(1800, 1.5);
    filter.frequency.linearRampToValueAtTime(600, duration);
    filter.Q.setValueAtTime(4, 0);

    gain.gain.setValueAtTime(0.2, 0);
    gain.gain.linearRampToValueAtTime(0.01, duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(offlineCtx.destination);
    osc.start(0);
    osc.stop(duration);
  }

  const renderedBuffer = await offlineCtx.startRendering();
  const wavBlob = audioBufferToWav(renderedBuffer);
  const filename = `sample-${type}-test.wav`;
  return new File([wavBlob], filename, { type: 'audio/wav' });
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const numSamples = buffer.length;
  const dataByteLength = numSamples * blockAlign;
  const bufferByteLength = 44 + dataByteLength;

  const arrayBuffer = new ArrayBuffer(bufferByteLength);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataByteLength, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // chunk length
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // byte rate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataByteLength, true);

  // Interleave channels
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
