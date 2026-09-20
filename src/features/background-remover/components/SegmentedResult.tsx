import { Checkerboard } from "@/src/components/common/Checkerboard"
import { OutputMode } from "../remover-engine"
import { formatBytes } from "@/src/lib/file-utils"

interface props {
    backdrop: 'checker' | 'dark' | 'light' | 'custom'
    outputMode: OutputMode
    processedUrl: string | null
    processedBlob: {
        size: number

    } | null
    customBgColor: string | null
    isBusy: boolean

}
export default ({
    backdrop = "checker",
    outputMode,
    customBgColor
    , processedBlob,
    processedUrl,
    isBusy
}: props) => {
    return <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono text-text-muted">
            <span className="text-primary font-semibold">
                {outputMode === 'mask' ? 'Alpha Matte' : 'Cutout Output'}
            </span>
            <span>{processedBlob ? formatBytes(processedBlob.size) : '...'}</span>
        </div>
        <div
            className="rounded border border-border h-72 sm:h-96 flex items-center justify-center p-2 overflow-hidden relative"
            style={{
                backgroundColor:
                    backdrop === 'dark'
                        ? '#171717'
                        : backdrop === 'light'
                            ? '#ffffff'
                            : backdrop === 'custom'
                                ? (customBgColor ?? undefined)
                                : undefined,
            }}
        >
            {backdrop === 'checker' ? (
                <Checkerboard className="w-full h-full flex items-center justify-center">
                    {processedUrl ? (
                        <img
                            src={processedUrl}
                            alt="Background removed cutout"
                            className="max-h-full max-w-full object-contain select-none"
                        />
                    ) : isBusy ? (
                        <div className="text-center p-4">
                            <div className="text-xs font-mono text-text-muted">
                                Segmenting foreground...
                            </div>
                        </div>
                    ) : null}
                </Checkerboard>
            ) : processedUrl ? (
                <img
                    src={processedUrl}
                    alt="Background removed cutout"
                    className="max-h-full max-w-full object-contain select-none"
                />
            ) : isBusy ? (
                <div className="text-center p-4">
                    <div className="text-xs font-mono text-text-muted">
                        Segmenting foreground...
                    </div>
                </div>
            ) : null}
        </div>
    </div>
}