import { FiDownload } from "react-icons/fi"

interface props {
    handleDownload: () => void
    handleDownloadComposite: () => void
    backdrop: "custom"
    outputMode: "mask" | "Download Alpha Mask PNG" | "Download Transparent PNG" | "foreground"
    processedBlob: boolean
    customBgColor: string
    isBusy: boolean
}

export default  function DownloadActionButtons(
    {
        handleDownload,
        isBusy,
        processedBlob,
        outputMode,
        backdrop,
        handleDownloadComposite,
        customBgColor
    }: props

) {
    return <div className="pt-2 space-y-2">
        <button
            onClick={handleDownload}
            disabled={!processedBlob || isBusy}
            className="w-full py-2.5 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-none"
        >
            <FiDownload className="w-4 h-4" />
            <span>
                {outputMode === 'mask' ? 'Download Alpha Mask PNG' : 'Download Transparent PNG'}
            </span>
        </button>

        {backdrop === 'custom' && outputMode === 'foreground' && (
            <button
                onClick={handleDownloadComposite}
                disabled={!processedBlob || isBusy}
                className="w-full py-2 px-4 border border-border hover:bg-background disabled:opacity-50 text-text-main rounded font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Download Composite on {customBgColor}</span>
            </button>
        )}
    </div>
}