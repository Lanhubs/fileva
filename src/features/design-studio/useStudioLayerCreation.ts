import { useCallback } from 'react';
import { DesignProject, Layer, TextLayer, DeviceLayer, ShapeLayer } from './types';

interface UseStudioLayerCreationProps {
  setProject: React.Dispatch<React.SetStateAction<DesignProject>>;
  setSelectedLayerId: (id: string | null) => void;
  pushHistory?: (project: DesignProject) => void;
}

export function useStudioLayerCreation({ setProject, setSelectedLayerId, pushHistory }: UseStudioLayerCreationProps) {
  const handleAddTextLayer = useCallback(() => {
    setProject((prev) => {
      const pages = [...prev.pages];
      const page = { ...pages[prev.activePageIndex] };
      const newText: TextLayer = {
        id: `layer-${Date.now()}-text`,
        name: 'New Headline',
        type: 'text',
        x: prev.dimensions.width * 0.1,
        y: prev.dimensions.height * 0.1,
        width: prev.dimensions.width * 0.8,
        height: Math.round(prev.dimensions.height * 0.08),
        rotation: 0,
        opacity: 1,
        zIndex: page.layers.length + 1,
        visible: true,
        locked: false,
        text: 'New Compelling Headline',
        textRole: 'headline',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: Math.round(prev.dimensions.width * 0.06),
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: -0.5,
        textAlign: 'center',
        color: '#FFFFFF',
      };
      page.layers = [...page.layers, newText];
      pages[prev.activePageIndex] = page;
      setSelectedLayerId(newText.id);
      const next = { ...prev, pages, updatedAt: Date.now() };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, setSelectedLayerId, pushHistory]);

  const handleAddDeviceLayer = useCallback(() => {
    setProject((prev) => {
      const pages = [...prev.pages];
      const page = { ...pages[prev.activePageIndex] };
      const devW = prev.dimensions.width * 0.76;
      const devH = devW * (19.5 / 9);

      const newDev: DeviceLayer = {
        id: `layer-${Date.now()}-device`,
        name: 'Device Frame',
        type: 'device',
        x: (prev.dimensions.width - devW) / 2,
        y: prev.dimensions.height * 0.28,
        width: devW,
        height: devH,
        rotation: 0,
        opacity: 1,
        zIndex: page.layers.length + 1,
        visible: true,
        locked: false,
        deviceModel: 'iphone-16-pro',
        color: 'titanium',
        showShadow: true,
        shadowIntensity: 0.4,
        innerCornerRadius: 44,
        notchOrIsland: 'island',
        screenshotAssetId: prev.assets[0]?.id,
        screenshotScale: 1,
        screenshotOffsetX: 0,
        screenshotOffsetY: 0,
      };

      page.layers = [...page.layers, newDev];
      pages[prev.activePageIndex] = page;
      setSelectedLayerId(newDev.id);
      const next = { ...prev, pages, updatedAt: Date.now() };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, setSelectedLayerId, pushHistory]);

  const handleAddShapeLayer = useCallback(() => {
    setProject((prev) => {
      const pages = [...prev.pages];
      const page = { ...pages[prev.activePageIndex] };
      const newShape: ShapeLayer = {
        id: `layer-${Date.now()}-shape`,
        name: 'Rectangle Accent',
        type: 'shape',
        x: prev.dimensions.width * 0.2,
        y: prev.dimensions.height * 0.2,
        width: prev.dimensions.width * 0.6,
        height: 80,
        rotation: 0,
        opacity: 1,
        zIndex: page.layers.length + 1,
        visible: true,
        locked: false,
        shapeKind: 'rounded-rect',
        fillColor: '#D94F3D',
        cornerRadius: 16,
      };
      page.layers = [...page.layers, newShape];
      pages[prev.activePageIndex] = page;
      setSelectedLayerId(newShape.id);
      const next = { ...prev, pages, updatedAt: Date.now() };
      pushHistory?.(next);
      return next;
    });
  }, [setProject, setSelectedLayerId, pushHistory]);

  return { handleAddTextLayer, handleAddDeviceLayer, handleAddShapeLayer };
}
