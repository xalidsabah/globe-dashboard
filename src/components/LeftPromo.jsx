import WeatherIcon from './WeatherIcon'

export default function LeftPromo({
  dark,
  place,
  weather,
  unit = 'C',
  onHowItWorks,
  onOpenSearch,
  hidden,
  styleLeft = 'left-20',
}) {
  if (hidden) return null

  const c = weather?.current
  const temp = c?.temp
  const display =
    temp == null ? '—' : unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)

  return (
    <div
      className={`pointer-events-none absolute top-[36%] z-20 max-w-[240px] -translate-y-1/2 transition-all duration-300 ${styleLeft}`}
    >
      <p className={`mb-1 text-[11px] font-medium tracking-wide ${dark ? 'text-white/40' : 'text-slate-600'}`}>
        AI-Powered
      </p>
      <h2
        className={`text-[25px] font-semibold leading-[1.18] tracking-tight ${
          dark ? 'text-white' : 'text-slate-900'
        }`}
      >
        Plan Your
        <br />
        Day with
        <br />
        Weather <span className="text-amber-400">✦</span>
      </h2>

      <div className="pointer-events-auto mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onHowItWorks}
          className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-400 transition hover:text-amber-300"
        >
          How it works
        </button>
        <span className={dark ? 'text-white/20' : 'text-slate-300'}>·</span>
        <button
          type="button"
          onClick={onOpenSearch}
          className={`text-[11px] font-medium ${dark ? 'text-white/45 hover:text-white/80' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Search <kbd className="kbd ml-0.5">/</kbd>
        </button>
      </div>

      {/* Live condition card */}
      <div
        className={`pointer-events-auto mt-10 flex items-center gap-3 rounded-2xl border px-3 py-2.5 backdrop-blur-md ${
          dark
            ? 'border-white/10 bg-black/35 text-white'
            : 'border-slate-200/90 bg-white/90 text-slate-800 shadow-sm'
        }`}
      >
        <span className={dark ? 'text-sky-300' : 'text-sky-500'}>
          <WeatherIcon icon={c?.icon || 'cloud'} size={28} isDay={c?.isDay !== false} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{place?.name || '—'}</p>
          <p className={`truncate text-[11px] ${dark ? 'text-white/40' : 'text-slate-500'}`}>
            {c?.label || 'Loading…'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold tabular-nums leading-none">
            {display}
            <span className="text-sm font-medium opacity-40">°</span>
          </p>
        </div>
      </div>
    </div>
  )
}
