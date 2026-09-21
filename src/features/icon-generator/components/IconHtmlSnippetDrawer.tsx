import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { generateHtmlHeadSnippet } from '../../../lib/icon-presets';

interface IconHtmlSnippetDrawerProps {
  copiedSnippet: boolean;
  onCopySnippet: () => void;
}

export const IconHtmlSnippetDrawer: React.FC<IconHtmlSnippetDrawerProps> = ({
  copiedSnippet,
  onCopySnippet,
}) => {
  return (
    <div className="border border-border bg-[#181716] text-[#EBE7E0] rounded-lg p-4 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[#A8A29D]">HTML &lt;head&gt; Integration Tags</span>
        <button
          onClick={onCopySnippet}
          className="px-2.5 py-1 rounded bg-[#2A2624] hover:bg-[#35312E] text-white flex items-center gap-1 cursor-pointer transition-colors"
        >
          {copiedSnippet ? <FiCheck className="text-emerald-400" /> : null}
          <span>{copiedSnippet ? 'Copied' : 'Copy HTML'}</span>
        </button>
      </div>
      <pre className="p-3 bg-[#11100F] rounded overflow-x-auto text-[11px] leading-relaxed text-[#D6D2CD] border border-[#2A2624]">
        {generateHtmlHeadSnippet()}
      </pre>
    </div>
  );
};
