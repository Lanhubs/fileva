import React, { useState } from 'react';
import { FiX, FiSearch, FiCommand, FiLayers, FiEye, FiMove, FiDownload } from 'react-icons/fi';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'edit' | 'canvas' | 'layers' | 'creation';
}

const SHORTCUTS: ShortcutItem[] = [
  // History & Editing
  { keys: ['⌘', 'Z'], description: 'Undo last change', category: 'edit' },
  { keys: ['⌘', '⇧', 'Z'], description: 'Redo change (or Ctrl+Y)', category: 'edit' },
  { keys: ['⌘', 'C'], description: 'Copy selected layer', category: 'edit' },
  { keys: ['⌘', 'V'], description: 'Paste copied layer', category: 'edit' },
  { keys: ['⌘', 'X'], description: 'Cut selected layer', category: 'edit' },
  { keys: ['⌘', 'D'], description: 'Duplicate selected layer', category: 'edit' },
  { keys: ['⌫', 'Del'], description: 'Delete selected layer', category: 'edit' },
  { keys: ['Esc'], description: 'Deselect layer / Close modal', category: 'edit' },

  // Canvas & Navigation
  { keys: ['Space', 'H'], description: 'Pan / Hand tool', category: 'canvas' },
  { keys: ['V'], description: 'Select / Transform tool', category: 'canvas' },
  { keys: ['Z'], description: 'Zoom tool (Alt+Click to zoom out)', category: 'canvas' },
  { keys: ['C'], description: 'Crosshair precision tool', category: 'canvas' },
  { keys: ['⌘', '+'], description: 'Zoom in canvas', category: 'canvas' },
  { keys: ['⌘', '-'], description: 'Zoom out canvas', category: 'canvas' },
  { keys: ['⌘', '0'], description: 'Fit canvas to screen', category: 'canvas' },
  { keys: ['⌘', '1'], description: '100% Zoom (1:1 ratio)', category: 'canvas' },

  // Layer Arrangement
  { keys: ['↑', '↓', '←', '→'], description: 'Nudge layer position (1px)', category: 'layers' },
  { keys: ['⇧', 'Arrow'], description: 'Fast nudge (10px)', category: 'layers' },
  { keys: [']'], description: 'Bring layer forward', category: 'layers' },
  { keys: ['['], description: 'Send layer backward', category: 'layers' },
  { keys: ['⇧', ']'], description: 'Bring layer to front', category: 'layers' },
  { keys: ['⇧', '['], description: 'Send layer to back', category: 'layers' },
  { keys: ['⌘', 'L'], description: 'Lock / Unlock selected layer', category: 'layers' },
  { keys: ['⌘', '⇧', 'H'], description: 'Hide / Show selected layer', category: 'layers' },

  // Creation & Output
  { keys: ['T'], description: 'Add new Text headline', category: 'creation' },
  { keys: ['S'], description: 'Add new Shape rectangle', category: 'creation' },
  { keys: ['D'], description: 'Add new Device frame', category: 'creation' },
  { keys: ['P'], description: 'Toggle Clean Preview mode', category: 'creation' },
  { keys: ['⌘', 'E'], description: 'Export current page (PNG)', category: 'creation' },
  { keys: ['⌘', '⇧', 'E'], description: 'Export all pages (.ZIP)', category: 'creation' },
  { keys: ['?'], description: 'Open this shortcuts cheatsheet', category: 'creation' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'edit' | 'canvas' | 'layers' | 'creation'>('all');

  if (!isOpen) return null;

  const filtered = SHORTCUTS.filter((s) => {
    const matchesTab = activeTab === 'all' || s.category === activeTab;
    const matchesSearch =
      s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.keys.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div
      id="keyboard-shortcuts-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-background/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 text-primary rounded-md">
              <FiCommand className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-main">App Store Studio Shortcuts</h2>
              <p className="text-xs text-text-muted">High-velocity keyboard controls for precision design</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-background rounded-md text-text-muted hover:text-text-main cursor-pointer"
            title="Close (Esc)"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-3 border-b border-border bg-surface flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search shortcut (e.g. undo, zoom, duplicate)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-md text-xs text-text-main placeholder:text-text-muted focus:outline-hidden focus:border-primary"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-surface border border-border text-text-main'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'edit'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-surface border border-border text-text-main'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'canvas'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-surface border border-border text-text-main'
              }`}
            >
              Canvas
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'layers'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-surface border border-border text-text-main'
              }`}
            >
              Layers
            </button>
            <button
              onClick={() => setActiveTab('creation')}
              className={`px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                activeTab === 'creation'
                  ? 'bg-primary text-white'
                  : 'bg-background hover:bg-surface border border-border text-text-main'
              }`}
            >
              Tools
            </button>
          </div>
        </div>

        {/* Shortcuts list */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-border">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              No shortcuts found matching &quot;{searchTerm}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
              {filtered.map((shortcut, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-2 px-2 hover:bg-background/60 rounded-md transition-colors"
                >
                  <span className="text-xs text-text-main">{shortcut.description}</span>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {shortcut.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-1.5 py-0.5 min-w-[20px] text-center bg-background border border-border rounded text-[11px] font-mono font-bold text-text-main shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-background/50 flex items-center justify-between text-xs text-text-muted shrink-0">
          <span>Note: On Windows & Linux, use <kbd className="font-bold">Ctrl</kbd> in place of <kbd className="font-bold">⌘</kbd>.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-surface hover:bg-background border border-border rounded text-text-main font-medium cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
