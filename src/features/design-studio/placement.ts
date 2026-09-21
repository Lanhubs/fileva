import { DesignAsset, CanvasDimensions, DeviceLayer } from './types';

/**
 * Intelligent screenshot placement helper.
 * Automatically aligns and scales a newly imported screenshot to comfortably
 * fit inside the target canvas or device frame with clean optical margins.
 */

export function calculateInitialDevicePlacement(
  canvas: CanvasDimensions,
  deviceModel: DeviceLayer['deviceModel'] = 'iphone-16-pro'
): { x: number; y: number; width: number; height: number } {
  const isLandscape = canvas.width > canvas.height;

  if (deviceModel === 'browser-window' || deviceModel === 'macbook-pro') {
    // Desktop layout inside banner
    const targetW = canvas.width * 0.78;
    const targetH = targetW * (10 / 16);
    return {
      x: (canvas.width - targetW) / 2,
      y: isLandscape ? canvas.height * 0.22 : canvas.height * 0.35,
      width: targetW,
      height: targetH,
    };
  }

  if (deviceModel === 'ipad-pro' || deviceModel === 'android-tablet') {
    const targetH = canvas.height * 0.65;
    const targetW = targetH * (3 / 4);
    return {
      x: (canvas.width - targetW) / 2,
      y: canvas.height * 0.26,
      width: targetW,
      height: targetH,
    };
  }

  // Mobile phone (iPhone / Pixel / Galaxy)
  if (isLandscape) {
    // In a banner, place phone slightly to the right or center
    const targetH = canvas.height * 0.82;
    const targetW = targetH * (9 / 19.5);
    return {
      x: canvas.width * 0.58,
      y: (canvas.height - targetH) / 2 + 10,
      width: targetW,
      height: targetH,
    };
  } else {
    // In a standard portrait app store screenshot
    // Leave room at the top for headline & subtitle
    const targetW = canvas.width * 0.76;
    const targetH = targetW * (19.5 / 9);
    return {
      x: (canvas.width - targetW) / 2,
      y: canvas.height * 0.26,
      width: targetW,
      height: targetH,
    };
  }
}

export function calculateInitialScreenshotPlacement(
  canvas: CanvasDimensions,
  asset: DesignAsset
): { x: number; y: number; width: number; height: number } {
  const imgAspect = asset.width / Math.max(asset.height, 1);
  const isLandscape = canvas.width > canvas.height;

  let targetW: number;
  let targetH: number;

  if (isLandscape) {
    targetH = canvas.height * 0.7;
    targetW = targetH * imgAspect;
    if (targetW > canvas.width * 0.5) {
      targetW = canvas.width * 0.5;
      targetH = targetW / imgAspect;
    }
    return {
      x: canvas.width * 0.45,
      y: (canvas.height - targetH) / 2,
      width: targetW,
      height: targetH,
    };
  } else {
    targetW = canvas.width * 0.76;
    targetH = targetW / imgAspect;
    // Don't let it overflow bottom too much
    if (targetH > canvas.height * 0.68) {
      targetH = canvas.height * 0.68;
      targetW = targetH * imgAspect;
    }
    return {
      x: (canvas.width - targetW) / 2,
      y: canvas.height * 0.25,
      width: targetW,
      height: targetH,
    };
  }
}
