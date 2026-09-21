import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMonitor, FiTablet, FiArrowLeft, FiImage, FiScissors, FiGrid, FiLayers } from 'react-icons/fi';

interface StudioDeviceRestrictionViewProps {
  currentWidth?: number;
}

export const StudioDeviceRestrictionView: React.FC<StudioDeviceRestrictionViewProps> = () => {
  const navigate = useNavigate();

  return (
    <div
      id="studio-device-restriction-view"
      className="flex-1 w-full h-full min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 bg-background text-text-main select-none"
    >
      <div className="max-w-md w-full bg-surface border border-border rounded-xl p-6 sm:p-8 shadow-sm text-center">
        {/* Visual Device Archetype Badges */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary-light border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <FiMonitor className="w-6 h-6" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-text-muted">
            <FiTablet className="w-5 h-5" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background border border-border text-[11px] font-mono text-text-muted mb-3 uppercase tracking-wider font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Tablet & Desktop Required
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-text-main mb-2 tracking-tight">
          App Store Studio Requires a Larger Screen
        </h2>

        <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
          The Design Studio contains precision multi-layer composition, interactive artboard transforms,
          and deep inspector controls optimized for tablet displays (768px+) and desktop monitors.
        </p>

        {/* Samsung DeX / Desktop Mode Callout */}
        <div className="bg-background border border-border rounded-lg p-3 text-left mb-6 text-xs text-text-muted">
          <div className="flex items-start gap-2.5">
            <FiLayers className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-text-main block mb-0.5">
                Using Desktop Mode (e.g. Samsung DeX)?
              </span>
              <span>
                If your smartphone is plugged into an external monitor or desktop docking station,
                maximize Fileva on that larger screen to automatically unlock the studio.
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>

          <div className="pt-2 border-t border-border">
            <span className="text-[11px] font-mono text-text-muted block mb-2">
              Available Mobile Utilities:
            </span>
            <div className="grid grid-cols-2 gap-2 text-left">
              <button
                onClick={() => navigate('/image-compressor')}
                className="p-2 bg-background hover:bg-surface border border-border hover:border-primary rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FiImage className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate text-text-main">Compressor</span>
              </button>
              <button
                onClick={() => navigate('/background-remover')}
                className="p-2 bg-background hover:bg-surface border border-border hover:border-primary rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FiScissors className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate text-text-main">AI Remover</span>
              </button>
              <button
                onClick={() => navigate('/icon-generator')}
                className="p-2 bg-background hover:bg-surface border border-border hover:border-primary rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FiGrid className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate text-text-main">App Icons</span>
              </button>
              <button
                onClick={() => navigate('/color-extractor')}
                className="p-2 bg-background hover:bg-surface border border-border hover:border-primary rounded text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <FiLayers className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate text-text-main">Color Palette</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
