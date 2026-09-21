import React from 'react';
import { useVideoCompressor } from './hooks/useVideoCompressor';
import { VideoCompressorHeader } from './components/VideoCompressorHeader';
import { VideoDropZone } from './components/VideoDropZone';
import { VideoMetadataCard } from './components/VideoMetadataCard';
import { VideoEncoderSettings } from './components/VideoEncoderSettings';
import { VideoCompressionResultCard } from './components/VideoCompressionResultCard';
import { VideoPlayerComparison } from './components/VideoPlayerComparison';

interface VideoCompressorProps {
  onClearGlobalFile?: () => void;
}

export const VideoCompressor: React.FC<VideoCompressorProps> = () => {
  const {
    videoFile,
    inspectError,
    settings,
    setSettings,
    status,
    progressPercent,
    stageMessage,
    failureInfo,
    result,
    activeTab,
    setActiveTab,
    isGeneratingSample,
    targetVideoBitrateKbps,
    handleFile,
    handleSampleSelect,
    handleCompress,
    handleDownload,
    handleReset,
  } = useVideoCompressor();

  return (
    <div className="space-y-6">
      <VideoCompressorHeader
        hasFile={Boolean(videoFile)}
        onReset={handleReset}
      />

      {!videoFile ? (
        <VideoDropZone
          onFileSelect={handleFile}
          onSampleSelect={handleSampleSelect}
          isGeneratingSample={isGeneratingSample}
          inspectError={inspectError}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-6">
            <VideoMetadataCard videoFile={videoFile} />

            <VideoEncoderSettings
              videoFile={videoFile}
              settings={settings}
              onUpdateSettings={setSettings}
              targetVideoBitrateKbps={targetVideoBitrateKbps}
              status={status}
              progressPercent={progressPercent}
              stageMessage={stageMessage}
              failureInfo={failureInfo}
              onCompress={handleCompress}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            {result && (
              <VideoCompressionResultCard
                result={result}
                originalSize={videoFile.size}
                onDownload={handleDownload}
              />
            )}

            <VideoPlayerComparison
              videoFile={videoFile}
              result={result}
              status={status}
              stageMessage={stageMessage}
              failureInfo={failureInfo}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      )}
    </div>
  );
};
