import WeatherIcon from './WeatherIcon'
import StarButton from './StarButton'
import { samePlace } from '../lib/places'

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

  const otherFavs = favorites.filter((f) => !samePlace(f, place)).slice(0, 4)

  return (
    <div
      className={`pointer-events-none absolute top-[36%] z-20 max-w-[240px] -translate-y-1/2 transition-all duration-300 ${styleLeft}`}
    >
      <p
        className={`mb-1 text-[11px] font-medium tracking-wide ${
          dark ? 'text-white/40' : 'text-slate-600'
        }`}
      >
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
          className={`text-[11px] font-medium ${
            dark ? 'text-white/45 hover:text-white/80' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Search <kbd className="kbd ml-0.5">/</kbd>
        </button>
      </div>

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
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold tabular-nums leading-none">
            {display}
            <span className="text-sm font-medium opacity-40">°</span>
          </p>
        </div>
        {place && onToggleFavorite && (
          <StarButton
            size="sm"
            filled={isFavorite}
            dark={dark}
            onClick={onToggleFavorite}
          />
        )}
      </div>

      {otherFavs.length > 0 && (
        <div className="pointer-events-auto mt-2 flex flex-wrap gap-1.5">
          {otherFavs.map((f) => (
            <button
              key={`${f.lat},${f.lng}`}
              type="button"
              onClick={() => onSelectFavorite?.(f)}
              title={f.label || f.name}
              className={`max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                dark
                  ? 'border-white/10 bg-black/30 text-white/70 hover:border-amber-400/30 hover:text-amber-200'
                  : 'border-slate-200 bg-white/80 text-slate-600 hover:border-amber-300 hover:text-amber-700'
              }`}
            >
              <span className="text-amber-400/90" aria-hidden>
                ★
              </span>{' '}
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
