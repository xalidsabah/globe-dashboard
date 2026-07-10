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

  const mute = dark ? 'text-white/30' : 'text-slate-500/80'
  const soft = dark ? 'text-white/50' : 'text-slate-600'

  return (
    <div
      className={`pointer-events-none absolute top-[38%] z-20 max-w-[200px] -translate-y-1/2 transition-all duration-300 sm:max-w-[220px] ${styleLeft}`}
    >
      {/* Marketing copy kept — one quiet line, not a billboard */}
      <p className={`text-[11px] leading-snug ${mute}`}>
        <span className={soft}>Live weather.</span> Plan your day with weather
        <span className="text-amber-400/70"> ✦</span>
      </p>

      <div className="pointer-events-auto mt-2 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onHowItWorks}
          className={`text-[11px] transition ${
            dark ? 'text-amber-400/70 hover:text-amber-300' : 'text-amber-600/80 hover:text-amber-700'
          }`}
        >
          How it works
        </button>
        <span className={dark ? 'text-white/15' : 'text-slate-300'} aria-hidden>
          ·
        </span>
        <button
          type="button"
          onClick={onOpenSearch}
          className={`text-[11px] transition ${
            dark ? 'text-white/35 hover:text-white/70' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Search <kbd className="kbd ml-0.5 opacity-70">/</kbd>
        </button>
      </div>

      {/* Primary: place card only */}
      <div
        className={`pointer-events-auto mt-6 flex items-center gap-2 rounded-2xl border px-2.5 py-2 backdrop-blur-md ${
          dark
            ? 'border-white/[0.08] bg-black/40 text-white'
            : 'border-slate-200/80 bg-white/85 text-slate-800 shadow-sm'
        }`}
      >
        <span className={`shrink-0 ${dark ? 'text-sky-300/90' : 'text-sky-500'}`}>
          <WeatherIcon icon={c?.icon || 'cloud'} size={24} isDay={c?.isDay !== false} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight">{place?.name || '—'}</p>
          <p className={`truncate text-[10px] leading-tight ${mute}`}>
            {c?.label || 'Loading…'}
          </p>
        </div>
        <p className="shrink-0 text-lg font-medium tabular-nums leading-none tracking-tight">
          {display}
          <span className="text-xs font-normal opacity-35">°</span>
        </p>
        {place && onToggleFavorite && (
          <StarButton size="sm" filled={isFavorite} dark={dark} onClick={onToggleFavorite} />
        )}
      </div>

      {otherFavs.length > 0 && (
        <div className="pointer-events-auto mt-1.5 flex flex-wrap gap-1">
          {otherFavs.map((f) => (
            <button
              key={`${f.lat},${f.lng}`}
              type="button"
              onClick={() => onSelectFavorite?.(f)}
              title={f.label || f.name}
              className={`max-w-full truncate rounded-full px-2 py-0.5 text-[10px] transition ${
                dark
                  ? 'text-white/40 hover:bg-white/5 hover:text-amber-200/90'
                  : 'text-slate-500 hover:bg-white/70 hover:text-amber-700'
              }`}
            >
              <span className="opacity-60" aria-hidden>
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
