import { Dispatch, SetStateAction } from "react"

interface props{
    setBackdrop: React.Dispatch<React.SetStateAction<"custom" | "checker" | "dark" | "light">>
    backdrop: "custom" | "checker" | "dark" | "light"
    customBgColor: string
    setCustomBgColor: Dispatch<SetStateAction<string>>
}
export default ({
setBackdrop,
backdrop,
customBgColor,
setCustomBgColor
}: props)=>{
return  <div className="space-y-1.5 pt-3 border-t border-border">
            <label className="text-xs font-semibold text-text-main">
              Preview Backdrop
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setBackdrop('checker')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${backdrop === 'checker'
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                  }`}
              >
                Checker
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('dark')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${backdrop === 'dark'
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                  }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('light')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${backdrop === 'light'
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                  }`}
              >
                White
              </button>
              <button
                type="button"
                onClick={() => setBackdrop('custom')}
                className={`py-1.5 px-1 rounded border text-center transition-colors cursor-pointer text-[11px] ${backdrop === 'custom'
                  ? 'border-primary bg-primary-light text-primary font-semibold'
                  : 'border-border text-text-muted hover:bg-background hover:text-text-main'
                  }`}
              >
                Solid Color
              </button>
            </div>

            {backdrop === 'custom' && (
              <div className="flex items-center gap-2 pt-1.5">
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="w-7 h-7 rounded border border-border p-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={customBgColor}
                  onChange={(e) => setCustomBgColor(e.target.value)}
                  className="flex-1 font-mono text-xs px-2 py-1 rounded border border-border bg-surface text-text-main uppercase"
                />
              </div>
            )}
          </div>
}