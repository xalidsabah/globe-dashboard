import WeatherIcon from './WeatherIcon'

export default function LeftPromo({
  dark,
  place,
  weather,
  unit = 'C',
  onHowItWorks,
  onOpenSearch,
  onToggleFavorite,
  isFavorite = false,
  favorites = [],
  onSelectFavorite,
  hidden,
  styleLeft = 'left-20',
}) {
  if (hidden) return null

  const c = weather?.current
  const temp = c?.temp
  const display =
    temp == null ? '—' : unit === 'F' ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)

  const otherFavs = favorites.filter(
    (f) => f.name !== place?.name || Math.abs(f.lat - place?.lat) > 0.2
  ).slice(0, 4)

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
        className={`pointer-events-auto mt-10 flex items-center gap-2 rounded-2xl border px-3 py-2.5 backdrop-blur-md ${
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
        {place && onToggleFavorite && (
          <button
            type="button"
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove favorite' : 'Add favorite'}
            aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
              isFavorite
                ? 'text-amber-400 hover:bg-amber-400/10'
                : dark
                  ? 'text-white/30 hover:bg-white/10 hover:text-amber-300'
                  : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500'
            }`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            >
              <path d="M12 3.2 14.6 9l6.2.5-4.7 4 1.4 6.1L12 16.5 6.5 19.6l1.4-6.1-4.7-4L9.4 9 12 3.2z" />
            </svg>
          </button>
        )}
      </div>

      {otherFavs.length > 0 && (
        <div className="pointer-events-auto mt-2 flex flex-wrap gap-1.5">
          {otherFavs.map((f) => (
            <button
              key={`${f.lat}-${f.lng}`}
              type="button"
              onClick={() => onSelectFavorite?.(f)}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                dark
                  ? 'border-white/10 bg-black/30 text-white/70 hover:border-amber-400/30 hover:text-amber-200'
                  : 'border-slate-200 bg-white/80 text-slate-600 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              ★ {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
