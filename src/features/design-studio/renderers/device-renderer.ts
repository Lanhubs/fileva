import { DeviceLayer } from '../types';
import { drawBrowserWindow, drawMacbook } from './desktop-device-renderer';
import { drawMobileDevice } from './mobile-device-renderer';

export function drawDeviceLayer(
  ctx: CanvasRenderingContext2D,
  layer: DeviceLayer,
  assetMap: Map<string, HTMLImageElement>
) {
  if (layer.deviceModel === 'browser-window') {
    drawBrowserWindow(ctx, layer, assetMap);
    return;
  }

  if (layer.deviceModel === 'macbook-pro') {
    drawMacbook(ctx, layer, assetMap);
    return;
  }

  drawMobileDevice(ctx, layer, assetMap);
}
