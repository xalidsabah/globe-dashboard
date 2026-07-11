export default function SettingsModal({
  open,
  onClose,
  dark,
  unit,
  onToggleUnit,
  autoRotate,
  onToggleAutoRotate,
  autoRefresh,
  onToggleAutoRefresh,
  autoTheme = false,
  onToggleAutoTheme,
  quality = 'high',
  onToggleQuality,
}) {
  if (!open) return null

  const rows = [
    {
      id: 'unit',
      icon: '°',
      label: 'Temperature unit',
      hint: unit === 'C' ? 'Celsius (°C)' : 'Fahrenheit (°F)',
      control: (
        <div
          className={`flex rounded-full p-0.5 ${dark ? 'bg-white/8' : 'bg-slate-100'}`}
        >
          {['C', 'F'].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => unit !== u && onToggleUnit?.()}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
                unit === u
                  ? dark
                    ? 'bg-white text-slate-900 shadow'
                    : 'bg-slate-900 text-white shadow'
                  : dark
                    ? 'text-white/45 hover:text-white/80'
                    : 'text-slate-500'
              }`}
            >
              °{u}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'autoTheme',
      icon: '◐',
      label: 'Match day / night',
      hint: autoTheme ? 'Theme follows local sunlight' : 'Manual theme only',
      control: <Toggle on={autoTheme} onClick={onToggleAutoTheme} dark={dark} />,
    },
    {
      id: 'quality',
      icon: '◈',
      label: 'Globe quality',
      hint: quality === 'high' ? 'Sharper · more GPU' : 'Smoother on phones',
      control: (
        <div className={`flex rounded-full p-0.5 ${dark ? 'bg-white/8' : 'bg-slate-100'}`}>
          {['high', 'low'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => quality !== q && onToggleQuality?.()}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                quality === q
                  ? dark
                    ? 'bg-white text-slate-900 shadow'
                    : 'bg-slate-900 text-white shadow'
                  : dark
                    ? 'text-white/45 hover:text-white/80'
                    : 'text-slate-500'
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'rotate',
      icon: '↻',
      label: 'Auto-rotate globe',
      hint: autoRotate ? 'Globe spins slowly' : 'Globe stays still',
      control: (
        <Toggle on={autoRotate} onClick={onToggleAutoRotate} dark={dark} />
      ),
    },
    {
      id: 'refresh',
      icon: '⟳',
      label: 'Auto-refresh weather',
      hint: autoRefresh ? 'Updates every 5 minutes' : 'Manual refresh only',
      control: (
        <Toggle on={autoRefresh} onClick={onToggleAutoRefresh} dark={dark} />
      ),
    },
  ]

  return (
    <div
      className="absolute inset-0 z-[80] flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={`modal-enter relative w-full max-w-md overflow-hidden rounded-3xl shadow-2xl ${
          dark
            ? 'border border-white/10 bg-[#0a1220]/95 backdrop-blur-2xl'
            : 'border border-slate-200 bg-white/96 backdrop-blur-2xl'
        }`}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }}
        />

        {/* Header */}
        <div className={`relative flex items-start justify-between border-b px-5 py-4 ${dark ? 'border-white/8' : 'border-slate-100'}`}>
          <div>
            <p className={`text-[10px] ${dark ? 'text-white/30' : 'text-slate-400'}`}>
              Preferences
            </p>
            <h2 className={`mt-0.5 text-lg font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              dark ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Rows */}
        <div className="relative space-y-2 p-4">
          {rows.map((row) => (
            <div
              key={row.id}
              className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 ${
                dark ? 'border-white/6 bg-white/[0.03]' : 'border-slate-150 border-slate-100 bg-slate-50/80'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base ${
                  dark ? 'bg-white/6 text-white/70' : 'bg-white text-slate-600 shadow-sm'
                }`}
              >
                {row.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-medium ${dark ? 'text-white/95' : 'text-slate-900'}`}>
                  {row.label}
                </p>
                <p className={`text-[11px] ${dark ? 'text-white/35' : 'text-slate-500'}`}>{row.hint}</p>
              </div>
              {row.control}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`border-t px-5 py-3.5 ${dark ? 'border-white/6' : 'border-slate-100'}`}>
          <p className={`text-[11px] leading-relaxed ${dark ? 'text-white/30' : 'text-slate-400'}`}>
            Weather data by <span className={dark ? 'text-white/50' : 'text-slate-600'}>Open-Meteo</span>
            {' · '}free global forecast, no API key. Theme & units are saved on this device.
          </p>
          <button
            type="button"
            onClick={onClose}
            className={`mt-3 w-full rounded-2xl py-2.5 text-sm font-semibold transition ${
              dark
                ? 'bg-white text-slate-900 hover:bg-white/90'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function Toggle({ on, onClick, dark }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        on
          ? 'bg-sky-500'
          : dark
            ? 'bg-white/12'
            : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
