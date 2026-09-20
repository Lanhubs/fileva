import { FiCpu, FiInfo, FiLayers, FiPlay, FiRefreshCw, FiSliders } from "react-icons/fi"
import ProgressIndicatorSection from "./progressIndicatorSection"
import DownloadActionButtons from "./dowload-action-buttons"
import PreviewBackdropSelector from "./PreviewBackdropSelector"
import { Dispatch, SetStateAction } from "react"
import { DeviceType, ModelType, OutputMode } from "../remover-engine"
interface props {
    onClear: () => void
    isBusy: boolean
    progressPercent: number
    runRemoval: () => void
    executionStats: {
        durationMs: number;
        width: number;
        height: number;
        size: number;
    } | null
    stageText: string
    bytesInfo: {
        total: number;
        current: number;
    } | null
    formatBytes: (current: number) => string
    model: string
    setModel: Dispatch<SetStateAction<ModelType>>
    setDevice: Dispatch<SetStateAction<DeviceType>>
    device: string
    setOutputMode: Dispatch<SetStateAction<OutputMode>>
    outputMode: OutputMode
   backdrop: "custom" | "checker" | "dark" | "light"
    customBgColor: string
    setBackdrop: Dispatch<SetStateAction<"custom" | "checker" | "dark" | "light">>
    setCustomBgColor: Dispatch<SetStateAction<string>>
    handleDownloadComposite: () => void
    handleDownload: () => void
}
export default ({
    executionStats,
    isBusy,
    onClear,
    progressPercent,
    runRemoval,
    bytesInfo,
    stageText,
    formatBytes,
    model,
    setModel,
    setDevice,
    setOutputMode,
    backdrop,
    device,
    customBgColor,
    handleDownloadComposite,
    outputMode,
    setBackdrop,
    setCustomBgColor,handleDownload
}: props) => {
    return (
        <div className="lg:col-span-1 space-y-5 border border-border bg-surface rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-text-main flex items-center gap-2">
                    <FiSliders className="w-4 h-4 text-primary" /> Neural Segmentation
                </h3>
                <button
                    onClick={onClear}
                    className="text-xs text-text-muted hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                >
                    <FiRefreshCw className="w-3 h-3" /> Change
                </button>
            </div>

            {/* Real Status & Progress Section */}

            <ProgressIndicatorSection
                isBusy={isBusy}
                progressPercent={progressPercent}
                runRemoval={runRemoval}
                executionStats={executionStats}
                stageText={stageText}
                bytesInfo={bytesInfo}
                formatBytes={formatBytes}

            />

            {/* Model Architecture Selector */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                        <FiCpu className="w-3.5 h-3.5 text-text-muted" /> Neural Model
                    </span>
                    <span className="text-[10px] font-mono text-text-muted">IS-Net</span>
                </label>
                <select
                    value={model}
                    disabled={isBusy}
                    onChange={(e) => setModel(e.target.value as ModelType)}
                    className="w-full py-1.5 px-2.5 rounded border border-border bg-surface text-xs text-text-main focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                    <option value="isnet_fp16">Balanced FP16 (~80MB, Recommended)</option>
                    <option value="isnet_quint8">Fast Quantized INT8 (~40MB, Low Memory)</option>
                    <option value="isnet">Full Precision FP32 (~160MB)</option>
                </select>
            </div>

            {/* Device Hardware Target */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main">
                    Inference Hardware
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setDevice('gpu')}
                        className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${device === 'gpu'
                            ? 'border-primary bg-primary-light text-primary font-semibold'
                            : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        WebGPU / GPU
                    </button>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setDevice('cpu')}
                        className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${device === 'cpu'
                            ? 'border-primary bg-primary-light text-primary font-semibold'
                            : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        CPU / WASM
                    </button>
                </div>
            </div>

            {/* Output Format Mode */}
            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                    <FiLayers className="w-3.5 h-3.5 text-text-muted" /> Output Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setOutputMode('foreground')}
                        className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${outputMode === 'foreground'
                            ? 'border-primary bg-primary-light text-primary font-semibold'
                            : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        Cutout (PNG)
                    </button>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setOutputMode('mask')}
                        className={`py-1.5 px-2.5 rounded border text-xs font-medium text-center transition-colors cursor-pointer ${outputMode === 'mask'
                            ? 'border-primary bg-primary-light text-primary font-semibold'
                            : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                            }`}
                    >
                        Alpha Mask
                    </button>
                </div>
            </div>

            {/* Re-run button if model or outputMode changed */}
            <div>
                <button
                    type="button"
                    disabled={isBusy}
                    onClick={runRemoval}
                    className="w-full py-2 px-3 rounded border border-border hover:bg-background text-xs font-medium text-text-main flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                    <FiPlay className="w-3 h-3" />
                    <span>Re-process with Current Settings</span>
                </button>
            </div>

            {/* Preview Backdrop Selector */}
            <PreviewBackdropSelector

                backdrop={backdrop}
                customBgColor={customBgColor}
                setBackdrop={setBackdrop}
                setCustomBgColor={setCustomBgColor}
            />


            {/* Download Action Buttons */}

            <DownloadActionButtons backdrop="custom"
                customBgColor={customBgColor}
                handleDownload={handleDownload}
                handleDownloadComposite={handleDownloadComposite}
                isBusy
                outputMode={
                    outputMode} processedBlob />
            <div className="flex items-center gap-1.5 text-[11px] text-text-muted font-mono pt-1">
                <FiInfo className="w-3.5 h-3.5 shrink-0" />
                <span>Files processed locally. Never sent to any server.</span>
            </div>
        </div>
    )
}