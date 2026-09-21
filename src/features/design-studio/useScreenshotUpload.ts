import { useCallback } from 'react';
import { DesignProject, DesignAsset, Layer, DeviceLayer } from './types';
import { calculateInitialScreenshotPlacement } from './placement';
import { processInputFile } from '../../lib/file-utils';

interface UseScreenshotUploadProps {
  setProject: React.Dispatch<React.SetStateAction<DesignProject>>;
  pushHistory: (project: DesignProject) => void;
  setErrorNotification: (msg: string | null) => void;
}

export function useScreenshotUpload({
  setProject,
  pushHistory,
  setErrorNotification,
}: UseScreenshotUploadProps) {
  const handleUploadScreenshot = useCallback(
    async (file: File) => {
      try {
        setErrorNotification(null);
        const processed = await processInputFile(file);

        const newAsset: DesignAsset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          file,
          objectUrl: processed.objectUrl,
          width: processed.width,
          height: processed.height,
          size: file.size,
        };

        setProject((prev) => {
          const updatedAssets = [...prev.assets, newAsset];

          const activePg = prev.pages[prev.activePageIndex] || prev.pages[0];
          let updatedLayers = [...activePg.layers];
          const deviceLayerIndex = updatedLayers.findIndex(
            (l) => l.type === 'device' && !(l as DeviceLayer).screenshotAssetId
          );

          if (deviceLayerIndex >= 0) {
            const dev = updatedLayers[deviceLayerIndex] as DeviceLayer;
            updatedLayers[deviceLayerIndex] = {
              ...dev,
              screenshotAssetId: newAsset.id,
            };
          } else {
            const anyDeviceIndex = updatedLayers.findIndex((l) => l.type === 'device');
            if (anyDeviceIndex >= 0) {
              const dev = updatedLayers[anyDeviceIndex] as DeviceLayer;
              updatedLayers[anyDeviceIndex] = {
                ...dev,
                screenshotAssetId: newAsset.id,
              };
            } else {
              const placement = calculateInitialScreenshotPlacement(prev.dimensions, newAsset);
              const newLayer: Layer = {
                id: `layer-${Date.now()}-screenshot`,
                name: file.name,
                type: 'screenshot',
                x: placement.x,
                y: placement.y,
                width: placement.width,
                height: placement.height,
                rotation: 0,
                opacity: 1,
                zIndex: updatedLayers.length + 1,
                visible: true,
                locked: false,
                assetId: newAsset.id,
                fitMode: 'contain',
                cornerRadius: 16,
                showShadow: true,
                shadowIntensity: 0.35,
              };
              updatedLayers.push(newLayer);
            }
          }

          const updatedPages = [...prev.pages];
          updatedPages[prev.activePageIndex] = {
            ...activePg,
            layers: updatedLayers,
          };

          const nextProj = {
            ...prev,
            assets: updatedAssets,
            pages: updatedPages,
            updatedAt: Date.now(),
          };
          pushHistory(nextProj);
          return nextProj;
        });
      } catch (err) {
        setErrorNotification(
          err instanceof Error ? err.message : 'Failed to import screenshot file.'
        );
      }
    },
    [setProject, pushHistory, setErrorNotification]
  );

  return { handleUploadScreenshot };
}
