import React from 'react';
import { Link } from 'react-router-dom';
import filevaLogo from '../../assets/fileva.png';
import {
  FiHome,
  FiScissors,
  FiMinimize2,
  FiGrid,
  FiDroplet,
  FiCrop,
  
  
  FiFilm,
  FiMusic,
} from 'react-icons/fi';
import { ToolId } from '../../types';

interface SidebarProps {
  activeTool: ToolId;
  onSelectTool?: (tool: ToolId) => void;
  className?: string;
}

export const TOOLS_CONFIG: Array<{
  id: ToolId;
  label: string;
  shortDesc: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'home',
    label: 'Overview',
    shortDesc: 'Developer media suite',
    path: '/',
    icon: FiHome,
  },
  {
    id: 'video-compressor',
    label: 'Video Compressor',
    shortDesc: 'H.264 & VP9 local encoding',
    path: '/video-compressor',
    icon: FiFilm,
  },
  {
    id: 'audio-compressor',
    label: 'Audio Compressor',
    shortDesc: 'MP3, AAC & Opus downmix',
    path: '/audio-compressor',
    icon: FiMusic,
  },
  {
    id: 'remover',
    label: 'Background Remover',
    shortDesc: 'Local segmentation & cutout',
    path: '/background-remover',
    icon: FiScissors,
  },
  {
    id: 'compressor',
    label: 'Image Compressor',
    shortDesc: 'Quality & target-size lossy/lossless',
    path: '/image-compressor',
    icon: FiMinimize2,
  },
  {
    id: 'icon-generator',
    label: 'App Icon Generator',
    shortDesc: 'Android, iOS, Web, PWA & Desktop',
    path: '/icon-generator',
    icon: FiGrid,
  },
  {
    id: 'color-extractor',
    label: 'Color Extractor',
    shortDesc: 'Dominant palette & pixel picker',
    path: '/color-extractor',
    icon: FiDroplet,
  },
  {
    id: 'cropper',
    label: 'Image Cropper',
    shortDesc: 'Precise aspect ratios & rotation',
    path: '/image-cropper',
    icon: FiCrop,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  onSelectTool,
  className = '',
}) => {
  return (
    <aside
      id="main-sidebar"
      className={`w-64 shrink-0 h-screen max-h-screen bg-surface text-text-main border-r border-border flex flex-col justify-between select-none overflow-hidden overscroll-none sticky top-0 ${className}`}
    >
      <div className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
          <Link
            to="/"
            onClick={() => onSelectTool?.('home')}
            className="text-left group flex items-center gap-2.5 focus:outline-hidden focus:ring-1 focus:ring-primary rounded p-1"
          >
            <img
              src={filevaLogo}
              alt="Fileva logo"
              className="w-8 h-8 rounded object-contain bg-white"
            />
            <div>
              <div className="text-md font-bold tracking-tight text-text-main group-hover:text-primary transition-colors">
               Fileva
              </div>
            
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1 overflow-hidden flex-1" aria-label="Tools Navigation">
          <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-text-muted tracking-wider uppercase">
            Tools
          </div>
          {TOOLS_CONFIG.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                id={`nav-tool-${tool.id}`}
                onClick={() => onSelectTool?.(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-xs text-left transition-colors font-medium border-l-2 cursor-pointer ${
                  isActive
                    ? 'bg-primary-light border-primary text-primary font-semibold'
                    : 'border-transparent text-text-muted hover:bg-background hover:text-text-main'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                <span className={`truncate ${isActive ? 'text-text-main font-semibold' : ''}`}>{tool.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Security / Privacy Guarantee */}
      <div className="p-4 border-t border-border text-xs text-text-muted space-y-3 shrink-0">
        <div className="flex items-start gap-2 bg-background p-2.5 rounded border border-border">
          
          <div className="text-[11px] leading-relaxed text-text-muted">
            <span className="font-semibold text-text-main block">Device-Local Processing</span>
            Zero remote calls. Your files never leave this browser tab.
          </div>
        </div>

        
      </div>
    </aside>
  );
};
