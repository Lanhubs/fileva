import { Checkerboard } from "@/src/components/common/Checkerboard"
import { ImageFileState } from "@/src/types";
import { OutputMode } from "../remover-engine";

interface props {
    executionStats: {
        durationMs: number
        width: number;
        height: number;
        size: number;
    } | null
    imageFile: ImageFileState|null
    outputMode: OutputMode
    isBusy: boolean
    customBgColor: string
    backdrop: "dark" | "light" | "custom" | "checker"
    formatBytes: (param: number) => string
    processedUrl: string |null
}
export default (

    {
        executionStats,
        outputMode,
        imageFile,
        isBusy,
        backdrop,
        formatBytes,
        customBgColor,
        processedUrl
    }: props
) => {

    return (
        <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-text-muted">
                <span>
                    {outputMode === 'mask' ? 'Alpha Matte Mask' : 'Transparent Cutout Output'}
                </span>
                <span>
                    {executionStats
                        ? `${executionStats.width}×${executionStats.height}px (${formatBytes(
                            executionStats.size
                        )})`
                        : `${imageFile?.width}×${imageFile?.height}px`}
                </span>
            </div>
            <div
                className="rounded border border-border h-96 sm:h-120 flex items-center justify-center p-4 overflow-hidden relative"
                style={{
                    backgroundColor:
                        backdrop === 'dark'
                            ? '#171717'
                            : backdrop === 'light'
                                ? '#ffffff'
                                : backdrop === 'custom'
                                    ? customBgColor
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
                                    Neural segmentation in progress...
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
                            Neural segmentation in progress...
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )

}