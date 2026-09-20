import { FiRefreshCw } from "react-icons/fi"

interface props {
    isBusy: boolean
    stageText: string
    progressPercent: number
    bytesInfo: {
        total: number
        current: number
    }|null,
    formatBytes:  (current: number)=>string
    executionStats:{
        durationMs:  number
         width: number;
    height: number;
    size: number;
    }|null
    runRemoval:  ()=>void
}

export default ({
     isBusy,
    bytesInfo,
    progressPercent,
    stageText,
    formatBytes,
    runRemoval,
    executionStats
    }: props) => {
    return <div className="space-y-2.5 p-3 rounded bg-background border border-border">
        <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-text-muted">Processing Status:</span>
            <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : status === 'failed'
                        ? 'bg-rose-50 text-rose-800 border border-rose-300'
                        : isBusy
                            ? 'bg-primary-light text-primary border border-primary/30'
                            : 'bg-surface text-text-muted border border-border'
                    }`}
            >
                {status}
            </span>
        </div>

        {isBusy && (
            <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-text-main">
                    <span className="truncate pr-2">{stageText || 'Processing...'}</span>
                    <span className="font-bold text-primary">{progressPercent}%</span>
                </div>
                <div className="w-full bg-surface h-1.5 rounded-full overflow-hidden border border-border">
                    <div
                        className="bg-primary h-full transition-all duration-200"
                        style={{ width: `${Math.max(4, Math.min(100, progressPercent))}%` }}
                    />
                </div>
                {bytesInfo && bytesInfo.total > 0 && (
                    <div className="text-[10px] font-mono text-text-muted text-right">
                        {formatBytes(bytesInfo.current)} / {formatBytes(bytesInfo.total)}
                    </div>
                )}
            </div>
        )}

        {status === 'completed' && executionStats && (
            <div className="pt-1 text-[11px] font-mono text-text-muted flex items-center justify-between">
                <span>Execution time:</span>
                <span className="font-semibold text-emerald-600">
                    {(executionStats.durationMs / 1000).toFixed(2)}s
                </span>
            </div>
        )}

        {status === 'failed' && (
            <button
                type="button"
                onClick={runRemoval}
                className="w-full mt-2 py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Retry Processing</span>
            </button>
        )}
    </div>
}