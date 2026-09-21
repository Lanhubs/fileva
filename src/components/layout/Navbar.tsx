import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiRefreshCw, FiImage } from 'react-icons/fi';
import { ToolId, ImageFileState } from '../../types';
import { TOOLS_CONFIG } from './Sidebar';
import { formatBytes } from '../../lib/file-utils';
import filevaLogo from '../../assets/fileva.png';

interface NavbarProps {
  activeTool: ToolId;
  onSelectTool?: (tool: ToolId) => void;
  activeFile: ImageFileState | null;
  onClearFile: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTool,
  onSelectTool,
  activeFile,
  onClearFile,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentToolConfig = TOOLS_CONFIG.find((t) => t.id === activeTool) || TOOLS_CONFIG[0];

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border text-text-main">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: Mobile hamburger & Active Tool Name & Desktop Sidebar Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded text-text-muted hover:bg-background hover:text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>

          {/* Desktop Toggle Button when collapsed */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              id="desktop-sidebar-toggle-btn"
              className="hidden md:flex p-1.5 rounded text-text-muted hover:text-text-main hover:bg-background border border-transparent hover:border-border cursor-pointer transition-colors"
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <FiMenu className="w-4 h-4" />
            </button>
          )}

          <div className="xl:hidden flex items-center gap-2.5 shrink-0">
            <img
              src={filevaLogo}
              alt="Fileva logo"
              className="w-8 h-8 rounded object-contain bg-white"
            />
            <span className="text-sm font-bold tracking-tight text-text-main">
              FILEVA
            </span>
          </div>

          <div>
            <h1 className="text-base font-bold text-text-main flex items-center gap-2">
              <span className="truncate">{currentToolConfig.label}</span>
              {activeTool !== 'home' && (
                <span className="hidden sm:inline-block text-xs font-normal text-text-muted border-l border-border pl-2">
                  {currentToolConfig.shortDesc}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Right: Active File badge & Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeFile && (
            <div className="flex items-center gap-2 bg-background py-1 px-2.5 rounded border border-border text-xs font-mono">
              <FiImage className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="max-w-30 sm:max-w-50 truncate text-text-main font-medium">
                {activeFile.name}
              </span>
              <span className="text-text-muted hidden sm:inline">
                ({activeFile.width}×{activeFile.height}px, {formatBytes(activeFile.size)})
              </span>
              <button
                onClick={onClearFile}
                className="ml-1 text-text-muted hover:text-rose-600 p-0.5 cursor-pointer transition-colors"
                title="Unload current image"
                aria-label="Unload current image"
              >
                <FiRefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface p-3 space-y-1">
          {TOOLS_CONFIG.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                onClick={() => {
                  onSelectTool?.(tool.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-left transition-colors font-medium border-l-2 cursor-pointer ${
                  isActive
                    ? 'bg-primary-light border-primary text-primary font-semibold'
                    : 'border-transparent text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                <div className="flex-1 min-w-0">
                  <div className={`truncate ${isActive ? 'text-text-main font-semibold' : ''}`}>{tool.label}</div>
                  <div className={`text-[11px] truncate ${isActive ? 'text-primary' : 'text-text-muted'}`}>
                    {tool.shortDesc}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
