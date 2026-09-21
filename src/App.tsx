import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToolId, ImageFileState } from './types';
import { Sidebar, TOOLS_CONFIG } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { AppRoutes } from './components/layout/AppRoutes';
import { SplashScreen } from './components/layout/SplashScreen';
import { processInputFile } from './lib/file-utils';

const TOOL_TITLES: Record<ToolId, string> = {
  home: 'Developer Media Toolkit — 100% Browser Local Utilities',
  'design-studio': 'App Store Design Studio — Developer Toolkit',
  'video-compressor': 'Video Compressor — Developer Toolkit',
  'audio-compressor': 'Audio Compressor — Developer Toolkit',
  remover: 'Background Remover — Developer Toolkit',
  compressor: 'Image Compressor — Developer Toolkit',
  'icon-generator': 'App Icon Generator — Developer Toolkit',
  'color-extractor': 'Color Extractor — Developer Toolkit',
  cropper: 'Image Cropper — Developer Toolkit',
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTool: ToolId = useMemo(() => {
    const path = location.pathname;
    if (path === '/' || path === '') return 'home';
    if (path === '/design-studio' || path === '/app-store-design-studio') return 'design-studio';
    if (path === '/video-compressor') return 'video-compressor';
    if (path === '/audio-compressor') return 'audio-compressor';
    if (path === '/background-remover' || path === '/remover') return 'remover';
    if (path === '/image-compressor' || path === '/compressor') return 'compressor';
    if (path === '/icon-generator' || path === '/app-icon-generator') return 'icon-generator';
    if (path === '/color-extractor') return 'color-extractor';
    if (path === '/image-cropper' || path === '/cropper') return 'cropper';
    return 'home';
  }, [location.pathname]);

  const [activeFile, setActiveFile] = useState<ImageFileState | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Initialize sidebar collapsed if opening directly into App Store Studio on tablet & desktop
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      const path = window.location.pathname;
      return path === '/design-studio' || path === '/app-store-design-studio';
    }
    return false;
  });

  // Automatically collapse sidebar on tablet and desktop when opening App Store Design Studio
  useEffect(() => {
    if (activeTool === 'design-studio' && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setIsSidebarCollapsed(true);
    }
  }, [activeTool]);

  // Keep ref to previous object URL to revoke on change
  const activeUrlRef = useRef<string | null>(null);

  // Update document title dynamically based on active tool
  useEffect(() => {
    document.title = TOOL_TITLES[activeTool] || 'Developer Image Toolkit';
  }, [activeTool]);

  // Handle file loading with memory management
  const handleLoadFile = useCallback(async (file: File) => {
    setGlobalError(null);
    try {
      const processed = await processInputFile(file);

      // Clean up previous image URL if it exists
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
      activeUrlRef.current = processed.objectUrl;

      setActiveFile(processed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to process file.';
      setGlobalError(msg);
    }
  }, []);

  const handleClearFile = useCallback(() => {
    if (activeUrlRef.current) {
      URL.revokeObjectURL(activeUrlRef.current);
      activeUrlRef.current = null;
    }
    setActiveFile(null);
    setGlobalError(null);
  }, []);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (activeUrlRef.current) {
        URL.revokeObjectURL(activeUrlRef.current);
      }
    };
  }, []);

  const handleSelectTool = useCallback(
    (tool: ToolId) => {
      const item = TOOLS_CONFIG.find((t) => t.id === tool);
      if (item) {
        navigate(item.path);
      }
    },
    [navigate],
  );

  // Keyboard shortcut listener for quick navigation (Escape to return home)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape' && activeTool !== 'home') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool, navigate]);

  return (
    <div className="h-screen overflow-hidden bg-background text-text-main flex flex-col md:flex-row antialiased selection:bg-primary selection:text-white">
      {/* Full screen splash screen on app open */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        activeTool={activeTool}
        onSelectTool={handleSelectTool}
        className="hidden md:flex"
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Navbar
          activeTool={activeTool}
          onSelectTool={handleSelectTool}
          activeFile={activeFile}
          onClearFile={handleClearFile}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <main
          className={`flex-1 w-full mx-auto ${
            activeTool === 'design-studio'
              ? 'p-0 max-w-none h-[calc(100vh-4.25rem)] overflow-hidden flex flex-col'
              : 'p-4 sm:p-6 lg:p-8 max-w-7xl'
          }`}
        >
          {globalError && (
            <div className="mb-6 p-4 rounded border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold mr-1">Error:</span>
                {globalError}
              </div>
              <button
                onClick={() => setGlobalError(null)}
                className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-bold px-2 py-1 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          <AppRoutes
            activeFile={activeFile}
            onSelectTool={handleSelectTool}
            onLoadFile={handleLoadFile}
            onClearFile={handleClearFile}
          />
        </main>
      </div>
    </div>
  );
}
