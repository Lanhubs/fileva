/**
 * Global browser zoom prevention utility.
 * Prevents browser-level zooming (pinch-to-zoom, Ctrl/Cmd + wheel, Ctrl/Cmd + +/-/0, Safari gesturezoom)
 * so that the user interface is never distorted by accidental browser scaling.
 * Zooming is strictly relegated to in-app tools (such as the App Store Design Studio canvas artboard).
 */

export function setupBrowserZoomPrevention(): () => void {
  if (typeof window === 'undefined') return () => {};

  // Prevent wheel zooming via Ctrl/Cmd + wheel (e.g. mouse wheel or trackpad pinch)
  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  };

  // Prevent browser zoom keyboard shortcuts (Ctrl/Cmd + '+', '-', '=', '0', '_')
  const handleKeyDown = (e: KeyboardEvent) => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    if (cmdOrCtrl) {
      const key = e.key;
      if (
        key === '+' ||
        key === '=' ||
        key === '-' ||
        key === '_' ||
        key === '0' ||
        e.code === 'Digit0' ||
        e.code === 'Numpad0' ||
        e.code === 'Equal' ||
        e.code === 'Minus'
      ) {
        // Prevent default browser window zoom
        e.preventDefault();
      }
    }
  };

  // Prevent Safari gesture zooming (pinch gestures on trackpad / iOS)
  const handleGesture = (e: Event) => {
    e.preventDefault();
  };

  // Prevent multi-touch pinch zoom on touch devices outside of explicitly pinchable canvas elements
  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      const target = e.target as HTMLElement | null;
      if (!target?.closest?.('[data-allow-pinch-zoom="true"]')) {
        e.preventDefault();
      }
    }
  };

  window.addEventListener('wheel', handleWheel, { passive: false });
  window.addEventListener('keydown', handleKeyDown, { capture: true });
  document.addEventListener('gesturestart', handleGesture, { passive: false });
  document.addEventListener('gesturechange', handleGesture, { passive: false });
  document.addEventListener('gestureend', handleGesture, { passive: false });
  document.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKeyDown, { capture: true });
    document.removeEventListener('gesturestart', handleGesture);
    document.removeEventListener('gesturechange', handleGesture);
    document.removeEventListener('gestureend', handleGesture);
    document.removeEventListener('touchmove', handleTouchMove);
  };
}
