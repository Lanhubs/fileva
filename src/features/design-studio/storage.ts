import { DesignProject, DesignAsset, CanvasDimensions, CanvasPage } from './types';
import { DEFAULT_PRESET } from './presets';

const STORAGE_KEY = 'fileva_design_studio_active_project';

interface SerializedProject extends Omit<DesignProject, 'assets'> {
  assetsMetadata: Array<{
    id: string;
    name: string;
    width: number;
    height: number;
    size: number;
  }>;
}

/**
 * Saves lightweight project structure (layers, pages, background, dimensions)
 * without hoarding massive base64 binaries in localStorage.
 */
export function saveProjectToStorage(project: DesignProject): void {
  try {
    const serialized: SerializedProject = {
      ...project,
      assetsMetadata: project.assets.map((a) => ({
        id: a.id,
        name: a.name,
        width: a.width,
        height: a.height,
        size: a.size,
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (err) {
    console.warn('LocalStorage quota or serialization error on project save:', err);
  }
}

/**
 * Loads project structure from localStorage.
 */
export function loadProjectFromStorage(): DesignProject | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.pages || !Array.isArray(parsed.pages)) return null;

    return {
      ...parsed,
      assets: [], // User can re-upload or assets will be empty until supplied
      customFonts: parsed.customFonts || [],
    };
  } catch (err) {
    console.warn('Could not restore design studio project:', err);
    return null;
  }
}

export function createNewProject(
  name = 'App Store Screenshots',
  dimensions: CanvasDimensions = DEFAULT_PRESET,
  initialAssets: DesignAsset[] = []
): DesignProject {
  const initialPage: CanvasPage = {
    id: `page-${Date.now()}`,
    title: '01 — Feature Highlight',
    background: {
      type: 'solid',
      color: '#0F172A',
    },
    layers: [
      {
        id: `layer-${Date.now()}-h1`,
        name: 'Headline',
        type: 'text',
        x: dimensions.width * 0.08,
        y: dimensions.height * 0.08,
        width: dimensions.width * 0.84,
        height: dimensions.height * 0.08,
        rotation: 0,
        opacity: 1,
        zIndex: 1,
        visible: true,
        locked: false,
        text: 'Everything You Need in One Place',
        textRole: 'headline',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: Math.round(dimensions.width * 0.065),
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: -0.5,
        textAlign: 'center',
        color: '#F8FAFC',
      },
      {
        id: `layer-${Date.now()}-sub`,
        name: 'Subtitle',
        type: 'text',
        x: dimensions.width * 0.1,
        y: dimensions.height * 0.165,
        width: dimensions.width * 0.8,
        height: dimensions.height * 0.05,
        rotation: 0,
        opacity: 0.85,
        zIndex: 2,
        visible: true,
        locked: false,
        text: 'Designed specifically for modern engineering teams.',
        textRole: 'subtitle',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: Math.round(dimensions.width * 0.032),
        fontWeight: 500,
        lineHeight: 1.35,
        letterSpacing: 0,
        textAlign: 'center',
        color: '#94A3B8',
      },
      {
        id: `layer-${Date.now()}-dev`,
        name: 'Device Mockup',
        type: 'device',
        x: (dimensions.width - dimensions.width * 0.76) / 2,
        y: dimensions.height * 0.26,
        width: dimensions.width * 0.76,
        height: dimensions.width * 0.76 * (19.5 / 9),
        rotation: 0,
        opacity: 1,
        zIndex: 3,
        visible: true,
        locked: false,
        deviceModel: 'iphone-16-pro',
        color: 'titanium',
        showShadow: true,
        shadowIntensity: 0.45,
        innerCornerRadius: 44,
        notchOrIsland: 'island',
        screenshotAssetId: initialAssets[0]?.id,
        screenshotScale: 1,
        screenshotOffsetX: 0,
        screenshotOffsetY: 0,
      },
    ],
  };

  return {
    id: `project-${Date.now()}`,
    name,
    mode: 'screenshots',
    presetId: `${dimensions.platform}-${dimensions.deviceType}`,
    dimensions,
    pages: [initialPage],
    activePageIndex: 0,
    assets: initialAssets,
    customFonts: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
