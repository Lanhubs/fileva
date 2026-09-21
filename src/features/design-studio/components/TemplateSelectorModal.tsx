import React from 'react';
import { FiX, FiCheck } from 'react-icons/fi';
import { DESIGN_TEMPLATES } from '../templates';
import { DesignTemplate, CanvasDimensions } from '../types';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: DesignTemplate) => void;
  currentDimensions: CanvasDimensions;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentDimensions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text-main">
              Select Starting Template
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Professionally structured layouts for App Store, Google Play, and Web showcases.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-text-muted hover:text-text-main hover:bg-background cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DESIGN_TEMPLATES.map((tmpl) => {
            const isMatchingAspect =
              (tmpl.recommendedDimensions.width > tmpl.recommendedDimensions.height) ===
              (currentDimensions.width > currentDimensions.height);

            return (
              <div
                key={tmpl.id}
                className="border border-border rounded-lg p-4 bg-background hover:border-primary flex flex-col justify-between transition-colors text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-border bg-surface text-text-muted font-bold">
                      {tmpl.style}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {tmpl.recommendedDimensions.width}×{tmpl.recommendedDimensions.height}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-text-main mb-1">
                    {tmpl.name}
                  </h4>
                  <p className="text-xs text-text-muted leading-relaxed mb-4">
                    {tmpl.description}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onApplyTemplate(tmpl);
                    onClose();
                  }}
                  className="w-full py-1.5 px-3 bg-surface hover:bg-primary-light border border-border hover:border-primary rounded text-xs font-semibold text-text-main hover:text-primary flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FiCheck className="w-3.5 h-3.5" />
                  <span>Use This Template</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
