import React from 'react';

interface IconDeviceSimulatorsProps {
  previewDataUrls: Record<string, string>;
  borderRadiusClass: string;
}

export const IconDeviceSimulators: React.FC<IconDeviceSimulatorsProps> = ({
  previewDataUrls,
  borderRadiusClass,
}) => {
  return (
    <div className="border border-border bg-surface rounded-lg p-5">
      <h4 className="text-xs font-mono uppercase tracking-wider text-text-muted mb-4">
        Real-Size Device Simulators
      </h4>

      <div className="flex flex-wrap items-end gap-6 sm:gap-8 justify-start">
        <div className="space-y-1.5 text-center">
          <div className={`w-28 h-28 border border-border bg-background overflow-hidden ${borderRadiusClass}`}>
            {previewDataUrls['192'] && (
              <img src={previewDataUrls['192']} alt="192px icon" className="w-full h-full object-contain" />
            )}
          </div>
          <span className="text-[11px] font-mono text-text-muted block">192×192</span>
        </div>

        <div className="space-y-1.5 text-center">
          <div className={`w-16 h-16 border border-border bg-background overflow-hidden ${borderRadiusClass}`}>
            {previewDataUrls['64'] && (
              <img src={previewDataUrls['64']} alt="64px icon" className="w-full h-full object-contain" />
            )}
          </div>
          <span className="text-[11px] font-mono text-text-muted block">64×64</span>
        </div>

        <div className="space-y-1.5 text-center">
          <div className="w-8 h-8 border border-border bg-background overflow-hidden rounded">
            {previewDataUrls['32'] && (
              <img src={previewDataUrls['32']} alt="32px favicon" className="w-full h-full object-contain" />
            )}
          </div>
          <span className="text-[11px] font-mono text-text-muted block">32×32</span>
        </div>

        <div className="space-y-1.5 text-center">
          <div className="px-3 py-1.5 rounded bg-background border border-border flex items-center gap-2">
            <div className="w-4 h-4 overflow-hidden">
              {previewDataUrls['16'] && (
                <img src={previewDataUrls['16']} alt="16px tab" className="w-full h-full object-contain" />
              )}
            </div>
            <span className="text-xs text-text-main font-sans">New Tab</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted block">16×16 Tab</span>
        </div>
      </div>
    </div>
  );
};
