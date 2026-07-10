export default function HowItWorksModal({ open, onClose, dark = true }) {
  if (!open) return null

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center p-6">
      <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="glass relative w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90">Weather globe</p>
            <h2 className={`mt-1 text-lg font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>How it works</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 items-center justify-center rounded-full border ${
              dark ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-slate-200 text-slate-400'
            }`}
          >
            ✕
          </button>
        </div>

        <ol className={`space-y-3 text-sm ${dark ? 'text-white/70' : 'text-slate-600'}`}>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-300">
              1
            </span>
            <span>Search any city or pick a location — the globe focuses there live.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-300">
              2
            </span>
            <span>Main Statistics show current temperature, humidity, and wind.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-semibold text-amber-300">
              3
            </span>
            <span>Expand the bottom panel for hourly + 7-day forecast and weather risk.</span>
          </li>
        </ol>

        <p className={`mt-4 text-[11px] ${dark ? 'text-white/35' : 'text-slate-400'}`}>
          Powered by Open-Meteo · free accurate global weather, no API key.
        </p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-[#0a1220] transition hover:bg-white/90"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
