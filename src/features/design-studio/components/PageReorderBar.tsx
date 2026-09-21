import React from 'react';
import {
  FiPlus,
  FiCopy,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { CanvasPage } from '../types';

interface PageReorderBarProps {
  pages: CanvasPage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
}

export const PageReorderBar: React.FC<PageReorderBarProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onMovePage,
}) => {
  return (
    <div
      id="design-pages-strip"
      className="bg-surface border-t border-border px-4 py-2.5 flex items-center justify-between shrink-0 overflow-x-auto gap-3 text-xs"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[11px] font-mono uppercase text-text-muted font-bold tracking-wider shrink-0 mr-1">
          Screenshots ({pages.length})
        </span>

        {/* List of Screenshot Pages */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {pages.map((page, idx) => {
            const isActive = idx === activePageIndex;

            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(idx)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded border transition-colors cursor-pointer shrink-0 select-none ${
                  isActive
                    ? 'bg-primary-light border-primary text-primary font-semibold'
                    : 'bg-background hover:bg-surface border-border text-text-main'
                }`}
              >
                <span className="text-xs truncate max-w-28 sm:max-w-36">
                  {page.title || `0${idx + 1}`}
                </span>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {idx > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(idx, idx - 1);
                      }}
                      className="hover:text-primary p-0.5 cursor-pointer"
                      title="Move Left"
                    >
                      <FiChevronLeft className="w-3 h-3" />
                    </button>
                  )}
                  {idx < pages.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMovePage(idx, idx + 1);
                      }}
                      className="hover:text-primary p-0.5 cursor-pointer"
                      title="Move Right"
                    >
                      <FiChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage(idx);
                    }}
                    className="hover:text-primary p-0.5 cursor-pointer"
                    title="Duplicate Screenshot"
                  >
                    <FiCopy className="w-3 h-3" />
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(idx);
                      }}
                      className="hover:text-rose-600 p-0.5 cursor-pointer"
                      title="Delete Screenshot"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Screenshot Button */}
      <button
        onClick={onAddPage}
        className="px-3 py-1.5 rounded border border-border bg-background hover:bg-surface hover:border-primary text-text-main hover:text-primary font-medium flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
      >
        <FiPlus className="w-3.5 h-3.5" />
        <span>Add Screenshot</span>
      </button>
    </div>
  );
};
