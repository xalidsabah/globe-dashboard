const STEPS = [
  {
    title: 'Pick a place',
    body: 'Search any city or tap a globe pin — the camera focuses there live.',
  },
  {
    title: 'Read the nowcast',
    body: 'Temperature, humidity, wind, and UV update from Open-Meteo in real time.',
  },
  {
    title: 'Plan ahead',
    body: 'Open the bottom panel for hourly + 7-day forecast and condition risk.',
  },
  {
    title: 'Save favorites',
    body: 'Star cities to pin them. Recent picks stick around on this device.',
  },
]

export default function HowItWorksModal({ open, onClose, dark = true }) {
  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-[60] flex items-center justify-center p-5 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="How it works"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />
      <div
        className={`modal-enter relative w-full max-w-md overflow-hidden rounded-3xl p-6 shadow-2xl ${
          dark
            ? 'border border-white/10 bg-[#0a1220]/96 backdrop-blur-2xl'
            : 'border border-slate-200 bg-white/96 backdrop-blur-2xl'
        }`}
      >
        <div
          className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #fbbf24 0%, transparent 70%)' }}
        />

        <div className="relative mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-amber-400/80">Weather globe</p>
            <h2 className={`mt-0.5 text-lg font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>
              How it works
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              dark
                ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <ol className="relative space-y-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className={`flex gap-3 rounded-2xl border px-3.5 py-3 ${
                dark ? 'border-white/6 bg-white/[0.03]' : 'border-slate-100 bg-slate-50/80'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400/15 text-xs font-bold text-amber-300">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${dark ? 'text-white/90' : 'text-slate-800'}`}>
                  {step.title}
                </p>
                <p className={`mt-0.5 text-[13px] leading-relaxed ${dark ? 'text-white/50' : 'text-slate-500'}`}>
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <p className={`mt-4 text-[11px] ${dark ? 'text-white/35' : 'text-slate-400'}`}>
          Powered by Open-Meteo · free global weather, no API key.
        </p>

        <button
          type="button"
          onClick={onClose}
          className={`mt-4 w-full rounded-2xl py-2.5 text-sm font-semibold transition ${
            dark
              ? 'bg-white text-[#0a1220] hover:bg-white/90'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          Got it
        </button>
      </div>
    </div>
  )
}
