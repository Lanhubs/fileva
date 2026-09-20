interface props {
    isSampleLoading:  boolean
    loadSample: (type: "portrait" | "product" | "complex") => Promise<void>
}
export default ({
isSampleLoading,
loadSample
}: props)=>{
    return   <div className="mt-6 pt-5 border-t border-border">
            <p className="text-xs font-semibold text-text-muted mb-3">
              Or load a benchmark test image:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                disabled={isSampleLoading}
                onClick={() => loadSample('portrait')}
                className="p-3 text-left rounded border border-border hover:border-primary bg-background hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="text-xs font-bold text-text-main">Portrait / Person</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Tests face, hair strands & edge matting
                </div>
              </button>
              <button
                type="button"
                disabled={isSampleLoading}
                onClick={() => loadSample('product')}
                className="p-3 text-left rounded border border-border hover:border-primary bg-background hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="text-xs font-bold text-text-main">Product Studio</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Tests gadget edges, drop shadows & glass
                </div>
              </button>
              <button
                type="button"
                disabled={isSampleLoading}
                onClick={() => loadSample('complex')}
                className="p-3 text-left rounded border border-border hover:border-primary bg-background hover:bg-surface transition-colors disabled:opacity-50 cursor-pointer"
              >
                <div className="text-xs font-bold text-text-main">Complex Pattern</div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Tests geometric stripes & intricate boundaries
                </div>
              </button>
            </div>
          </div>
}