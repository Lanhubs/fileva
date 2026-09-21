export type StudioFontCategory = 'sans' | 'display' | 'serif' | 'mono' | 'system';

export interface StudioFont {
  id: string;
  name: string;
  fontFamily: string;
  category: StudioFontCategory;
  weights: number[];
  googleFontName?: string;
  isSystem?: boolean;
  sampleText?: string;
}

export const STUDIO_FONTS: StudioFont[] = [
  // Modern Sans-Serif
  {
    id: 'inter',
    name: 'Inter',
    fontFamily: '"Inter", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'Inter',
    sampleText: 'Modern & Clean',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700, 800],
    googleFontName: 'Plus+Jakarta+Sans',
    sampleText: 'Geometric & Crisp',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    fontFamily: '"Poppins", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'Poppins',
    sampleText: 'Friendly & Rounded',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    fontFamily: '"Montserrat", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'Montserrat',
    sampleText: 'Bold Architecture',
  },
  {
    id: 'outfit',
    name: 'Outfit',
    fontFamily: '"Outfit", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'Outfit',
    sampleText: 'Contemporary Tech',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    fontFamily: '"DM Sans", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'DM+Sans',
    sampleText: 'Precise Neo-Grotesque',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    fontFamily: '"Space Grotesk", sans-serif',
    category: 'sans',
    weights: [400, 500, 600, 700],
    googleFontName: 'Space+Grotesk',
    sampleText: 'Brutalist & Modern',
  },
  {
    id: 'syne',
    name: 'Syne',
    fontFamily: '"Syne", sans-serif',
    category: 'sans',
    weights: [500, 600, 700, 800],
    googleFontName: 'Syne',
    sampleText: 'Artistic Headline',
  },
  // Display & Impact
  {
    id: 'bebas-neue',
    name: 'Bebas Neue',
    fontFamily: '"Bebas Neue", sans-serif',
    category: 'display',
    weights: [400],
    googleFontName: 'Bebas+Neue',
    sampleText: 'HIGH IMPACT TITLES',
  },
  {
    id: 'oswald',
    name: 'Oswald',
    fontFamily: '"Oswald", sans-serif',
    category: 'display',
    weights: [400, 500, 600, 700],
    googleFontName: 'Oswald',
    sampleText: 'Condensed Headlines',
  },
  {
    id: 'anton',
    name: 'Anton',
    fontFamily: '"Anton", sans-serif',
    category: 'display',
    weights: [400],
    googleFontName: 'Anton',
    sampleText: 'EXTRA PUNCHY CALLOUT',
  },
  {
    id: 'rubik',
    name: 'Rubik',
    fontFamily: '"Rubik", sans-serif',
    category: 'display',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'Rubik',
    sampleText: 'Smooth Heavy Rounded',
  },
  // Editorial & Serif
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    fontFamily: '"Playfair Display", serif',
    category: 'serif',
    weights: [400, 500, 600, 700, 800, 900],
    googleFontName: 'Playfair+Display',
    sampleText: 'Luxury & Elegance',
  },
  {
    id: 'merriweather',
    name: 'Merriweather',
    fontFamily: '"Merriweather", serif',
    category: 'serif',
    weights: [400, 700, 900],
    googleFontName: 'Merriweather',
    sampleText: 'Editorial Legibility',
  },
  {
    id: 'lora',
    name: 'Lora',
    fontFamily: '"Lora", serif',
    category: 'serif',
    weights: [400, 500, 600, 700],
    googleFontName: 'Lora',
    sampleText: 'Contemporary Calligraphy',
  },
  {
    id: 'cinzel',
    name: 'Cinzel',
    fontFamily: '"Cinzel", serif',
    category: 'serif',
    weights: [400, 600, 700, 800, 900],
    googleFontName: 'Cinzel',
    sampleText: 'CLASSIC MONUMENTAL',
  },
  // Tech & Monospace
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    fontFamily: '"JetBrains Mono", monospace',
    category: 'mono',
    weights: [400, 500, 600, 700, 800],
    googleFontName: 'JetBrains+Mono',
    sampleText: 'const code = 100%;',
  },
  {
    id: 'fira-code',
    name: 'Fira Code',
    fontFamily: '"Fira Code", monospace',
    category: 'mono',
    weights: [400, 500, 600, 700],
    googleFontName: 'Fira+Code',
    sampleText: '() => developer.first',
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    fontFamily: '"Space Mono", monospace',
    category: 'mono',
    weights: [400, 700],
    googleFontName: 'Space+Mono',
    sampleText: 'DEV UTILITY 2026',
  },
  // System Native
  {
    id: 'system-sans',
    name: 'System Default (SF / Segoe)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    category: 'system',
    weights: [400, 500, 600, 700, 800],
    isSystem: true,
    sampleText: 'Native iOS & macOS',
  },
  {
    id: 'system-serif',
    name: 'System Serif (Georgia)',
    fontFamily: 'Georgia, "Times New Roman", serif',
    category: 'system',
    weights: [400, 700],
    isSystem: true,
    sampleText: 'Classic System Serif',
  },
  {
    id: 'system-mono',
    name: 'System Monospace',
    fontFamily: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
    category: 'system',
    weights: [400, 700],
    isSystem: true,
    sampleText: 'Terminal Monospace',
  },
];

export function findStudioFont(fontFamily: string): StudioFont | undefined {
  if (!fontFamily) return undefined;
  const clean = fontFamily.toLowerCase();
  return STUDIO_FONTS.find(
    (f) =>
      clean.includes(f.name.toLowerCase()) ||
      clean.includes(f.id.toLowerCase()) ||
      clean === f.fontFamily.toLowerCase()
  );
}
