import { StudioFont, STUDIO_FONTS, findStudioFont } from './fonts';

const loadedFontFamilies = new Set<string>();
const fontLoadListeners = new Set<() => void>();

export function subscribeToFontLoad(callback: () => void): () => void {
  fontLoadListeners.add(callback);
  return () => {
    fontLoadListeners.delete(callback);
  };
}

function notifyFontLoaded() {
  fontLoadListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.warn('Font load listener error', e);
    }
  });
}

/**
 * Dynamically loads a Google Font by adding a <link> element to document.head,
 * then awaits document.fonts.load / document.fonts.ready.
 */
export async function loadFontFamily(fontOrFamily: StudioFont | string): Promise<boolean> {
  const fontObj = typeof fontOrFamily === 'string' ? findStudioFont(fontOrFamily) : fontOrFamily;

  if (!fontObj || fontObj.isSystem || !fontObj.googleFontName) {
    return true;
  }

  const fontKey = fontObj.id;
  if (loadedFontFamilies.has(fontKey)) {
    return true;
  }

  try {
    const weightsStr = fontObj.weights.join(';');
    const linkId = `google-font-${fontKey}`;

    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontObj.googleFontName}:wght@${weightsStr}&display=swap`;
      document.head.appendChild(link);
    }

    loadedFontFamilies.add(fontKey);

    if (document.fonts) {
      try {
        await document.fonts.load(`16px ${fontObj.name}`);
        await document.fonts.ready;
      } catch {
        // Fallback gracefully if browser font API is slow
      }
    }

    notifyFontLoaded();
    return true;
  } catch (err) {
    console.warn(`Failed to load font ${fontObj.name}:`, err);
    return false;
  }
}

/**
 * Preload the most commonly selected design fonts for snappy studio responsiveness.
 */
export function preloadCommonStudioFonts(): void {
  const common = STUDIO_FONTS.filter((f) =>
    ['inter', 'plus-jakarta-sans', 'poppins', 'bebas-neue', 'outfit', 'playfair-display'].includes(f.id)
  );

  common.forEach((f) => {
    loadFontFamily(f).catch(() => {});
  });
}
