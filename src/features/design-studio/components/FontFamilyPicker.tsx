import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FiChevronDown, FiSearch, FiCheck, FiType } from 'react-icons/fi';
import { STUDIO_FONTS, StudioFontCategory, StudioFont, findStudioFont } from '../fonts';
import { loadFontFamily } from '../font-loader';

interface FontFamilyPickerProps {
  value: string;
  onChange: (fontFamily: string, selectedFont?: StudioFont) => void;
}

const CATEGORIES: Array<{ id: StudioFontCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'sans', label: 'Sans' },
  { id: 'display', label: 'Display' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
  { id: 'system', label: 'System' },
];

export const FontFamilyPicker: React.FC<FontFamilyPickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<StudioFontCategory | 'all'>('all');
  const [customFontInput, setCustomFontInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentFont = useMemo(() => findStudioFont(value), [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredFonts = useMemo(() => {
    return STUDIO_FONTS.filter((font) => {
      const matchCat = category === 'all' || font.category === category;
      const matchSearch =
        !search ||
        font.name.toLowerCase().includes(search.toLowerCase()) ||
        font.category.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [category, search]);

  const handleSelectFont = async (font: StudioFont) => {
    await loadFontFamily(font);
    onChange(font.fontFamily, font);
    setIsOpen(false);
  };

  const handleApplyCustomFont = () => {
    if (!customFontInput.trim()) return;
    onChange(customFontInput.trim());
    setCustomFontInput('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-[11px] font-semibold text-text-muted flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5">
          <FiType className="w-3.5 h-3.5 text-text-muted" /> Font Family
        </span>
        {currentFont && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border text-text-muted capitalize">
            {currentFont.category}
          </span>
        )}
      </label>

      <button
        type="button"
        id="font-family-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-xs text-text-main flex items-center justify-between hover:border-primary/50 transition-colors cursor-pointer text-left"
      >
        <span className="truncate font-medium" style={{ fontFamily: value }}>
          {currentFont?.name || value.replace(/['",]/g, '').split(' ')[0] || 'Select Font'}
        </span>
        <FiChevronDown className={`w-3.5 h-3.5 text-text-muted transition-transform shrink-0 ml-1.5 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id="font-family-dropdown"
          className="absolute z-50 left-0 right-0 mt-1 w-full bg-surface border border-border rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[340px] text-xs"
        >
          {/* Search bar */}
          <div className="p-2 border-b border-border bg-background/50">
            <div className="relative">
              <FiSearch className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search typography..."
                className="w-full pl-8 pr-2.5 py-1.5 bg-surface border border-border rounded text-xs text-text-main placeholder:text-text-muted focus:outline-hidden focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 mt-2 overflow-x-auto pb-0.5 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-tight whitespace-nowrap cursor-pointer transition-colors ${
                    category === cat.id
                      ? 'bg-primary text-white font-semibold'
                      : 'bg-surface hover:bg-background text-text-muted border border-border/60'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fonts list */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-52">
            {filteredFonts.length === 0 ? (
              <div className="p-4 text-center text-text-muted text-[11px]">No fonts match "{search}"</div>
            ) : (
              filteredFonts.map((font) => {
                const isSelected = currentFont?.id === font.id || value === font.fontFamily;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => handleSelectFont(font)}
                    onMouseEnter={() => loadFontFamily(font)}
                    className={`w-full px-3 py-2 text-left hover:bg-background/80 transition-colors flex items-center justify-between group cursor-pointer ${
                      isSelected ? 'bg-primary-light/40 text-primary font-semibold' : 'text-text-main'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs truncate font-medium">{font.name}</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-background border border-border text-text-muted uppercase font-mono">
                          {font.category}
                        </span>
                      </div>
                      <div
                        className="text-[13px] text-text-muted group-hover:text-text-main truncate mt-0.5 leading-snug"
                        style={{ fontFamily: font.fontFamily }}
                      >
                        {font.sampleText || 'App Store Design'}
                      </div>
                    </div>
                    {isSelected && <FiCheck className="w-4 h-4 text-primary shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Custom font input option */}
          <div className="p-2 border-t border-border bg-background/40 flex items-center gap-1.5">
            <input
              type="text"
              value={customFontInput}
              onChange={(e) => setCustomFontInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomFont()}
              placeholder="Or custom font family..."
              className="flex-1 px-2 py-1 bg-surface border border-border rounded text-[11px] text-text-main placeholder:text-text-muted"
            />
            <button
              type="button"
              onClick={handleApplyCustomFont}
              disabled={!customFontInput.trim()}
              className="px-2 py-1 bg-surface hover:bg-primary hover:text-white border border-border rounded text-[11px] font-medium text-text-main transition-colors disabled:opacity-40 cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
