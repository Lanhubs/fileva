import React from 'react';
import { FiSliders, FiPlay, FiRefreshCw } from 'react-icons/fi';
import {
  AudioFileState,
  AudioCompressionSettings,
  AudioQualityPreset,
  AudioFormat,
} from '../../../types';
import { AudioProgressInfo } from '../audio-engine';

interface AudioEncoderSettingsProps {
  audioFile: AudioFileState;
  settings: AudioCompressionSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AudioCompressionSettings>>;
  calculatedTargetKbps: number | null;
  status: AudioProgressInfo['status'];
  progressPercent: number;
  stageMessage: string;
  onCompress: () => void;
}

const QUALITY_PRESETS: { id: AudioQualityPreset; label: string; desc: string }[] = [
  { id: 'high', label: 'High Fidelity', desc: '320 kbps (Audiophile quality)' },
  { id: 'balanced', label: 'Balanced', desc: '192 kbps (Standard music)' },
  { id: 'standard', label: 'Standard', desc: '128 kbps (Streaming / podcasts)' },
  { id: 'small', label: 'Small File', desc: '64 kbps (Speech & voice memos)' },
  { id: 'target-size', label: 'Target Size', desc: 'Calculated from target MB' },
  { id: 'lossless', label: 'Lossless (WAV)', desc: '16-bit uncompressed PCM' },
];

export const AudioEncoderSettings: React.FC<AudioEncoderSettingsProps> = ({
  audioFile,
  settings,
  onUpdateSettings,
  calculatedTargetKbps,
  status,
  progressPercent,
  stageMessage,
  onCompress,
}) => {
  const isBusy = status === 'preparing' || status === 'encoding' || status === 'finalizing';

  return (
    <div className="p-5 bg-surface border border-border rounded-lg space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <FiSliders className="w-3.5 h-3.5 text-primary" />
          Compression Preset
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {QUALITY_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onUpdateSettings((prev) => ({ ...prev, preset: p.id }))}
            className={`p-2.5 text-left rounded border transition-all cursor-pointer ${
              settings.preset === p.id
                ? 'border-primary bg-primary-light text-primary font-semibold'
                : 'border-border hover:border-border text-text-main hover:bg-background'
            }`}
          >
            <div className="text-xs font-medium">{p.label}</div>
            <div className="text-[10px] text-text-muted mt-0.5 leading-tight">
              {p.desc}
            </div>
          </button>
        ))}
      </div>

      {settings.preset === 'target-size' && (
        <div className="p-3 bg-primary-light/40 border border-primary/20 rounded space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-text-main">
              Target File Size (MB)
            </span>
            <span className="font-mono text-primary font-bold">
              {settings.targetSizeMb} MB
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0.5"
              max={Math.max(1, Math.round(audioFile.size / (1024 * 1024)))}
              step="0.5"
              value={settings.targetSizeMb || 1}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  targetSizeMb: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-primary"
            />
            <input
              type="number"
              min="0.2"
              step="0.5"
              value={settings.targetSizeMb || ''}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  targetSizeMb: Math.max(0.1, parseFloat(e.target.value) || 0.5),
                }))
              }
              className="w-20 px-2 py-1 text-xs border border-border rounded bg-surface text-text-main"
            />
          </div>
          {calculatedTargetKbps !== null && (
            <p className="text-[11px] text-text-muted">
              Computed audio bitrate: <strong className="font-mono text-text-main">{calculatedTargetKbps} kbps</strong>
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">
            Output Format
          </label>
          <select
            value={settings.format}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                format: e.target.value as AudioFormat,
              }))
            }
            className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="mp3">MP3 (Universal)</option>
            <option value="aac">AAC / M4A (Efficient)</option>
            <option value="ogg">OGG / Opus (Open Standard)</option>
            <option value="wav">WAV (Uncompressed PCM)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">
            Channel Downmix
          </label>
          <select
            value={settings.channels}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                channels: parseInt(e.target.value, 10),
              }))
            }
            className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value={0}>Keep Original</option>
            <option value={1}>Mono (1 ch - 50% data cut)</option>
            <option value={2}>Stereo (2 ch)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-text-main block mb-1">
          Resample Rate
        </label>
        <select
          value={settings.sampleRate}
          onChange={(e) =>
            onUpdateSettings((prev) => ({
              ...prev,
              sampleRate: parseInt(e.target.value, 10),
            }))
          }
          className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
        >
          <option value={0}>Keep Original ({audioFile.sampleRate} Hz)</option>
          <option value={44100}>44,100 Hz (CD Audio standard)</option>
          <option value={48000}>48,000 Hz (Video standard)</option>
          <option value={32000}>32,000 Hz (Broadcast)</option>
          <option value={22050}>22,050 Hz (Speech / Voice standard)</option>
          <option value={16000}>16,000 Hz (Compact voice)</option>
        </select>
      </div>

      <div className="pt-2 border-t border-border space-y-3">
        <button
          type="button"
          disabled={isBusy}
          onClick={onCompress}
          className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded flex items-center justify-center gap-2 shadow-none transition-colors cursor-pointer"
        >
          {isBusy ? (
            <>
              <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{stageMessage || 'Compressing audio...'}</span>
            </>
          ) : (
            <>
              <FiPlay className="w-3.5 h-3.5" />
              <span>Compress Audio Locally</span>
            </>
          )}
        </button>

        {isBusy && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-text-muted">
              <span className="truncate">{stageMessage}</span>
              <span className="font-mono font-bold text-primary">{progressPercent}%</span>
            </div>
            <div className="w-full bg-background border border-border rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
            <strong className="block font-bold">Error:</strong>
            <span>{stageMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
