import { useState, useRef, useEffect, useCallback } from 'react';
import {
  AudioFileState,
  AudioCompressionSettings,
  AudioCompressionResult,
} from '../../../types';
import { inspectAudioFile } from '../../../lib/media-utils';
import { compressAudio, AudioProgressInfo } from '../audio-engine';
import { generateSampleAudio } from '../sample-audio';

export function useAudioCompressor() {
  const [audioFile, setAudioFile] = useState<AudioFileState | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectError, setInspectError] = useState<string | null>(null);

  const [settings, setSettings] = useState<AudioCompressionSettings>({
    preset: 'balanced',
    format: 'mp3',
    bitrateKbps: 192,
    sampleRate: 0,
    channels: 0,
    targetSizeMb: 5,
  });

  const [status, setStatus] = useState<AudioProgressInfo['status']>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [result, setResult] = useState<AudioCompressionResult | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  const currentRunIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (audioFile?.objectUrl) URL.revokeObjectURL(audioFile.objectUrl);
      if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    };
  }, [audioFile, result]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac|wma)$/i)) {
      setInspectError('Please select a valid audio file (MP3, WAV, AAC, OGG, FLAC).');
      return;
    }

    setInspectError(null);
    setIsInspecting(true);
    setResult((prev) => {
      if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
      return null;
    });
    setStatus('idle');

    try {
      const inspected = await inspectAudioFile(file);
      setAudioFile(inspected);
      const halfSizeMb = Math.max(1, Math.round((file.size / (1024 * 1024)) * 0.5));
      setSettings((prev) => ({
        ...prev,
        targetSizeMb: halfSizeMb,
      }));
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Failed to inspect audio.');
      setAudioFile(null);
    } finally {
      setIsInspecting(false);
    }
  }, []);

  const handleSampleSelect = useCallback(async (type: 'speech-synth' | 'music') => {
    try {
      setIsGeneratingSample(true);
      setInspectError(null);
      const sample = await generateSampleAudio(type);
      await handleFile(sample);
    } catch (err) {
      setInspectError(err instanceof Error ? err.message : 'Could not generate sample audio.');
    } finally {
      setIsGeneratingSample(false);
    }
  }, [handleFile]);

  const handleCompress = useCallback(async () => {
    if (!audioFile) return;

    const runId = ++currentRunIdRef.current;
    setStatus('preparing');
    setProgressPercent(0);
    setStageMessage('Starting local audio compression...');

    try {
      const compressionResult = await compressAudio(audioFile, settings, (info) => {
        if (currentRunIdRef.current === runId) {
          setStatus(info.status);
          setProgressPercent(info.percent);
          setStageMessage(info.message);
        }
      });

      if (currentRunIdRef.current === runId) {
        setResult(compressionResult);
        setStatus('completed');
      }
    } catch (err) {
      if (currentRunIdRef.current === runId) {
        setStatus('failed');
        setStageMessage(err instanceof Error ? err.message : 'Audio compression failed.');
      }
    }
  }, [audioFile, settings]);

  const handleDownload = useCallback(() => {
    if (!result || !audioFile) return;
    const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
    const ext =
      result.format === 'wav'
        ? 'wav'
        : result.format === 'aac'
        ? 'm4a'
        : result.format === 'ogg'
        ? 'ogg'
        : 'mp3';
    const link = document.createElement('a');
    link.href = result.objectUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  }, [result, audioFile]);

  const handleReset = useCallback(() => {
    if (audioFile?.objectUrl) URL.revokeObjectURL(audioFile.objectUrl);
    if (result?.objectUrl) URL.revokeObjectURL(result.objectUrl);
    setAudioFile(null);
    setResult(null);
    setStatus('idle');
    setProgressPercent(0);
    setStageMessage('');
  }, [audioFile, result]);

  const calculatedTargetKbps =
    audioFile && settings.preset === 'target-size' && settings.targetSizeMb
      ? Math.round(
          Math.max(
            32,
            Math.min(320, (settings.targetSizeMb * 1024 * 1024 * 8) / Math.max(1, audioFile.duration) / 1000)
          )
        )
      : null;

  return {
    audioFile,
    isInspecting,
    inspectError,
    settings,
    setSettings,
    status,
    progressPercent,
    stageMessage,
    result,
    isGeneratingSample,
    calculatedTargetKbps,
    handleFile,
    handleSampleSelect,
    handleCompress,
    handleDownload,
    handleReset,
  };
}
