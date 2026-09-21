import React from 'react';
import { useAudioCompressor } from './hooks/useAudioCompressor';
import { AudioCompressorHeader } from './components/AudioCompressorHeader';
import { AudioDropZone } from './components/AudioDropZone';
import { AudioMetadataCard } from './components/AudioMetadataCard';
import { AudioEncoderSettings } from './components/AudioEncoderSettings';
import { AudioCompressionResultCard } from './components/AudioCompressionResultCard';
import { AudioPlayerComparison } from './components/AudioPlayerComparison';

export const AudioCompressor: React.FC = () => {
  const {
    audioFile,
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
  } = useAudioCompressor();

  return (
    <div className="space-y-6">
      <AudioCompressorHeader
        hasFile={Boolean(audioFile)}
        onReset={handleReset}
      />

      {!audioFile ? (
        <AudioDropZone
          onFileSelect={handleFile}
          onSampleSelect={handleSampleSelect}
          isGeneratingSample={isGeneratingSample}
          inspectError={inspectError}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <AudioMetadataCard audioFile={audioFile} />

            <AudioEncoderSettings
              audioFile={audioFile}
              settings={settings}
              onUpdateSettings={setSettings}
              calculatedTargetKbps={calculatedTargetKbps}
              status={status}
              progressPercent={progressPercent}
              stageMessage={stageMessage}
              onCompress={handleCompress}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            {result && (
              <AudioCompressionResultCard
                result={result}
                originalSize={audioFile.size}
                onDownload={handleDownload}
              />
            )}

            <AudioPlayerComparison
              audioFile={audioFile}
              result={result}
            />
          </div>
        </div>
      )}
    </div>
  );
};
