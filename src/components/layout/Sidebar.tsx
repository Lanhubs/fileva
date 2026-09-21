import React from 'react';
import { Link } from 'react-router-dom';
import filevaLogo from '../../assets/fileva.png';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ToolId } from '../../types';
import { TOOLS_CONFIG } from './sidebar-config';

export { TOOLS_CONFIG };

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool?: (tool: ToolId) => void;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  className = '',
  isCollapsed = false,
  onToggleCollapse,
}) => {
  return (
    <aside
      id="main-sidebar"
      className={`shrink-0 h-screen max-h-screen bg-surface text-text-main border-r border-border flex flex-col justify-between select-none overflow-hidden overscroll-none sticky top-0 transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className={`flex items-center shrink-0 ${isCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'}`}>
          <Link
            to="/"
            onClick={() => onSelectTool?.('home')}
            className={`text-left group flex items-center gap-2.5 focus:outline-hidden focus:ring-1 focus:ring-primary rounded p-1 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Fileva"
          >
            <img
              src={filevaLogo}
              alt="Fileva logo"
              className="w-8 h-8 rounded object-contain bg-white shrink-0"
            />
            {!isCollapsed && (
              <div>
                <div className="text-md font-bold tracking-tight text-text-main group-hover:text-primary transition-colors">
                  Fileva
                </div>
              </div>
            )}
          </Link>

          {onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              id="sidebar-collapse-btn"
              className="p-1.5 text-text-muted hover:text-text-main hover:bg-background rounded border border-transparent hover:border-border cursor-pointer transition-colors"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className={`p-2 space-y-1 overflow-hidden flex-1 ${isCollapsed ? 'px-2' : 'px-3'}`} aria-label="Tools Navigation">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-text-muted tracking-wider uppercase">
              Tools
            </div>
          )}
          {TOOLS_CONFIG.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                id={`nav-tool-${tool.id}`}
                onClick={() => onSelectTool?.(tool.id)}
                title={isCollapsed ? `${tool.label} — ${tool.shortDesc}` : undefined}
                className={`w-full flex items-center rounded text-xs transition-colors font-medium border-l-2 cursor-pointer ${
                  isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2 text-left'
                } ${
                  isActive
                    ? 'bg-primary-light border-primary text-primary font-semibold'
                    : 'border-transparent text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                {!isCollapsed && (
                  <span className={`truncate ${isActive ? 'text-text-main font-semibold' : ''}`}>{tool.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: Security info & expand toggle if collapsed */}
      <div className={` text-xs text-text-muted shrink-0 ${isCollapsed ? 'p-2 flex flex-col items-center gap-2' : 'p-4 space-y-3'}`}>
        {onToggleCollapse && isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            id="sidebar-expand-btn"
            className="w-full py-2 flex items-center justify-center text-text-muted hover:text-text-main hover:bg-background rounded border border-transparent hover:border-border cursor-pointer transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <FiChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-start gap-2 bg-background p-2.5 rounded border border-border">
            <div className="text-[11px] leading-relaxed text-text-muted">
              <span className="font-semibold text-text-main block">Device-Local Processing</span>
              Zero remote calls. Your files never leave this browser tab.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
