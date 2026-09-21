import React from 'react';
import { FiSliders, FiPlay, FiRefreshCw } from 'react-icons/fi';
import {
  VideoFileState,
  VideoCompressionSettings,
  VideoQualityPreset,
  VideoResolutionPreset,
  VideoFormat,
} from '../../../types';
import { VideoProgressInfo } from '../video-engine';
import { CompressionFailureInfo } from '../hooks/useVideoCompressor';
import { VideoCompressionFailureAlert } from './VideoCompressionFailureAlert';

interface VideoEncoderSettingsProps {
  videoFile: VideoFileState;
  settings: VideoCompressionSettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<VideoCompressionSettings>>;
  targetVideoBitrateKbps: number | null;
  status: VideoProgressInfo['status'];
  progressPercent: number;
  stageMessage: string;
  failureInfo: CompressionFailureInfo | null;
  onCompress: () => void;
}

const QUALITY_PRESETS: { id: VideoQualityPreset; label: string; desc: string }[] = [
  { id: 'balanced', label: 'Balanced', desc: 'CRF 24, high perceptual quality' },
  { id: 'small', label: 'Small File', desc: 'Aggressive compression (CRF 30)' },
  { id: 'max', label: 'Max Quality', desc: 'Near-lossless (CRF 19)' },
  { id: 'target-size', label: 'Target Size', desc: 'Calculate bitrate from target MB' },
  { id: 'lossless', label: 'Lossless / Remux', desc: 'Stream copy without re-encoding' },
  { id: 'custom', label: 'Custom CRF', desc: 'Manual CRF & Bitrate control' },
];

const RESOLUTIONS: { id: VideoResolutionPreset; label: string }[] = [
  { id: 'original', label: 'Original' },
  { id: '1080p', label: '1080p' },
  { id: '720p', label: '720p HD' },
  { id: '480p', label: '480p SD' },
  { id: '360p', label: '360p Low' },
];

export const VideoEncoderSettings: React.FC<VideoEncoderSettingsProps> = ({
  videoFile,
  settings,
  onUpdateSettings,
  targetVideoBitrateKbps,
  status,
  progressPercent,
  stageMessage,
  failureInfo,
  onCompress,
}) => {
  const isBusy = status === 'preparing' || status === 'encoding' || status === 'finalizing';

  const handleSwitchFormatAndRetry = (format: VideoFormat) => {
    onUpdateSettings((prev) => ({ ...prev, format }));
    setTimeout(onCompress, 50);
  };

  const handleSwitchResolutionAndRetry = (resolution: VideoResolutionPreset) => {
    onUpdateSettings((prev) => ({ ...prev, resolution }));
    setTimeout(onCompress, 50);
  };

  return (
    <div className="p-5 bg-surface border border-border rounded-lg space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <FiSliders className="w-3.5 h-3.5 text-primary" />
          Encoder Configuration
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-main flex items-center justify-between">
          <span>Compression Strategy</span>
        </label>
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
              min="1"
              max={Math.max(2, Math.round(videoFile.size / (1024 * 1024)))}
              step="1"
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
              min="1"
              value={settings.targetSizeMb || ''}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  targetSizeMb: Math.max(1, parseFloat(e.target.value) || 1),
                }))
              }
              className="w-20 px-2 py-1 text-xs border border-border rounded bg-surface text-text-main"
            />
          </div>
          {targetVideoBitrateKbps !== null && (
            <p className="text-[11px] text-text-muted">
              Calculated video bitrate: <strong className="font-mono text-text-main">{targetVideoBitrateKbps} kbps</strong>.
              {targetVideoBitrateKbps < 150 && (
                <span className="text-amber-600 block mt-0.5">
                  Warning: Bitrate is very low; consider downscaling to 480p or 360p to avoid heavy artifacts.
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {settings.preset === 'custom' && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-text-main">
              Constant Rate Factor (CRF)
            </span>
            <span className="font-mono font-bold text-primary">
              {settings.crf}
            </span>
          </div>
          <input
            type="range"
            min="18"
            max="36"
            step="1"
            value={settings.crf}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                crf: parseInt(e.target.value, 10),
              }))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-text-muted">
            <span>18 (Near-Lossless)</span>
            <span>24 (Balanced)</span>
            <span>32+ (Aggressive)</span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-text-main">
          Output Resolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RESOLUTIONS.map((res) => (
            <button
              key={res.id}
              type="button"
              onClick={() => onUpdateSettings((prev) => ({ ...prev, resolution: res.id }))}
              className={`py-1.5 px-2 text-xs rounded border text-center transition-colors cursor-pointer ${
                settings.resolution === res.id
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-border text-text-muted hover:bg-background hover:text-text-main'
              }`}
            >
              {res.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-text-muted">
          Downscaling reduces pixel data before encoding without artificial upscaling.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">
            Container &amp; Codec
          </label>
          <select
            value={settings.format}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                format: e.target.value as VideoFormat,
              }))
            }
            className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value="mp4">MP4 (H.264 / AAC)</option>
            <option value="webm">WebM (VP9 / Opus)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-text-main block mb-1">
            Audio Bitrate
          </label>
          <select
            value={settings.audioBitrateKbps}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                audioBitrateKbps: parseInt(e.target.value, 10),
              }))
            }
            className="w-full text-xs px-2.5 py-1.5 border border-border rounded bg-surface text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
          >
            <option value={64}>64 kbps (Mono/Voice)</option>
            <option value={96}>96 kbps (Compact)</option>
            <option value={128}>128 kbps (Standard)</option>
            <option value={192}>192 kbps (High Fidelity)</option>
          </select>
        </div>
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
              <span>{stageMessage || 'Compressing...'}</span>
            </>
          ) : (
            <>
              <FiPlay className="w-3.5 h-3.5" />
              <span>Compress Video Locally</span>
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
          <VideoCompressionFailureAlert
            failureInfo={failureInfo}
            stageMessage={stageMessage}
            format={settings.format}
            resolution={settings.resolution}
            onSwitchFormat={handleSwitchFormatAndRetry}
            onSwitchResolution={handleSwitchResolutionAndRetry}
            onRetry={onCompress}
          />
        )}
      </div>
    </div>
  );
};
