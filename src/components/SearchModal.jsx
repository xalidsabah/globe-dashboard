import { useEffect, useMemo, useRef, useState } from 'react'
import { searchPlaces, QUICK_CITIES } from '../lib/weather'
import {
  loadRecent,
  pushRecent,
  clearRecent,
  loadFavorites,
  toggleFavorite,
  isFavorite,
  placeKey,
  normalizePlace,
} from '../lib/places'

const POPULAR = QUICK_CITIES.slice(0, 12)

function toItem(c, group) {
  return { ...normalizePlace(c), group }
}

function StarIcon({ filled, className = '' }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.2 14.6 9l6.2.5-4.7 4 1.4 6.1L12 16.5 6.5 19.6l1.4-6.1-4.7-4L9.4 9 12 3.2z" />
    </svg>
  )
}

export default function SearchModal({
  open,
  onClose,
  onSelect,
  dark = true,
  favorites: favoritesProp,
  onFavoritesChange,
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) {
      setQ('')
      setResults([])
      setActiveIdx(0)
      return
    }
    setRecent(loadRecent())
    setFavorites(favoritesProp ?? loadFavorites())
    setTimeout(() => inputRef.current?.focus(), 40)
  }, [open, favoritesProp])

  useEffect(() => {
    if (favoritesProp) setFavorites(favoritesProp)
  }, [favoritesProp])

  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const list = await searchPlaces(q, 8)
        if (!cancelled) {
          setResults(list.map((r) => toItem(r, 'result')))
          setActiveIdx(0)
        }
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 260)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [q, open])

  const flatList = useMemo(() => {
    if (q.trim().length >= 2) return results
    const fav = favorites.map((r) => toItem(r, 'favorite'))
    const favKeys = new Set(fav.map((f) => placeKey(f)))
    const rec = recent
      .filter((r) => !favKeys.has(placeKey(r)))
      .map((r) => toItem(r, 'recent'))
    const used = new Set([...favKeys, ...rec.map((r) => placeKey(r))])
    const pop = POPULAR.filter((p) => !used.has(placeKey(p))).map((c) => toItem(c, 'popular'))
    return [...fav, ...rec, ...pop]
  }, [q, results, recent, favorites])

  if (!open) return null

  const pick = (p) => {
    const place = normalizePlace(p)
    setRecent(pushRecent(place))
    onSelect?.(place)
    onClose?.()
  }

  const onToggleStar = (e, p) => {
    e.stopPropagation()
    e.preventDefault()
    const { list, added } = toggleFavorite(p)
    setFavorites(list)
    onFavoritesChange?.(list, added)
  }

  const onClearRecent = (e) => {
    e.stopPropagation()
    setRecent(clearRecent())
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose?.()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(Math.max(0, flatList.length - 1), i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && flatList[activeIdx]) {
      e.preventDefault()
      pick(flatList[activeIdx])
    }
  }

  const groupLabel = (group) => {
    if (group === 'favorite') return 'Favorites'
    if (group === 'recent') return 'Recent'
    if (group === 'popular') return 'Popular cities'
    return null
  }

  let lastGroup = null

  return (
    <div className="absolute inset-0 z-[80] flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className={`relative w-full max-w-xl overflow-hidden rounded-3xl shadow-2xl ${
          dark
            ? 'border border-white/10 bg-[#0a1220]/95 backdrop-blur-2xl'
            : 'border border-slate-200/90 bg-white/95 backdrop-blur-2xl'
        }`}
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
        />

        <div
          className={`relative flex items-center gap-3 border-b px-5 py-4 ${dark ? 'border-white/8' : 'border-slate-100'}`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              dark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-600'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-[10px] font-medium uppercase tracking-[0.14em] ${
                dark ? 'text-white/30' : 'text-slate-400'
              }`}
            >
              Find a city
            </p>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Tokyo, Paris, Los Angeles…"
              className={`mt-0.5 w-full bg-transparent text-[16px] font-medium outline-none ${
                dark ? 'text-white placeholder:text-white/25' : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
          {loading && (
            <span className={`text-[11px] font-medium ${dark ? 'text-sky-300' : 'text-sky-600'}`}>
              Searching
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
              dark
                ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            ✕
          </button>
        </div>

        <div className="relative max-h-[min(56vh,420px)] overflow-y-auto panel-scroll py-2">
          {q.trim().length >= 2 && !loading && results.length === 0 && (
            <div className={`px-6 py-12 text-center ${dark ? 'text-white/40' : 'text-slate-500'}`}>
              <p className="text-sm font-medium">No places found</p>
              <p className="mt-1 text-[12px]">Try another spelling or a nearby city</p>
            </div>
          )}

          {q.trim().length < 2 && favorites.length === 0 && recent.length === 0 && (
            <p
              className={`px-5 pb-1 pt-2 text-[11px] leading-relaxed ${
                dark ? 'text-white/35' : 'text-slate-500'
              }`}
            >
              Star cities to pin favorites. Recent searches appear here automatically.
            </p>
          )}

          {flatList.map((r, i) => {
            const showHead = r.group !== lastGroup && q.trim().length < 2
            lastGroup = r.group
            const active = activeIdx === i
            const fav = isFavorite(r, favorites)
            const label = groupLabel(r.group)

            return (
              <div key={`${r.group}-${placeKey(r) || r.name}`}>
                {showHead && label && (
                  <div className="flex items-center justify-between px-5 pb-1.5 pt-3">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
                        dark ? 'text-white/28' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </p>
                    {r.group === 'recent' && recent.length > 0 && (
                      <button
                        type="button"
                        onClick={onClearRecent}
                        className={`text-[10px] font-medium ${
                          dark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                )}
                <div
                  role="button"
                  tabIndex={0}
                  className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-2xl px-2 py-1.5 text-left transition ${
                    active
                      ? dark
                        ? 'bg-sky-500/15 ring-1 ring-sky-400/25'
                        : 'bg-sky-50 ring-1 ring-sky-200'
                      : dark
                        ? 'hover:bg-white/5'
                        : 'hover:bg-slate-50'
                  }`}
                  onClick={() => pick(r)}
                  onMouseEnter={() => setActiveIdx(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      pick(r)
                    }
                  }}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                      r.group === 'favorite'
                        ? dark
                          ? 'bg-amber-400/15 text-amber-300'
                          : 'bg-amber-50 text-amber-600'
                        : r.group === 'recent'
                          ? dark
                            ? 'bg-white/6 text-white/45'
                            : 'bg-slate-100 text-slate-400'
                          : dark
                            ? 'bg-gradient-to-br from-sky-500/25 to-indigo-500/20 text-sky-200'
                            : 'bg-gradient-to-br from-sky-100 to-indigo-50 text-sky-700'
                    }`}
                  >
                    {r.group === 'favorite' ? '★' : r.group === 'recent' ? '⏱' : (r.name || '?')[0]}
                  </span>
                  <span className="min-w-0 flex-1 py-1">
                    <span
                      className={`block truncate text-[14px] font-medium ${
                        dark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {r.name}
                    </span>
                    <span
                      className={`block truncate text-[12px] ${dark ? 'text-white/40' : 'text-slate-500'}`}
                    >
                      {[r.admin1, r.country].filter(Boolean).join(' · ') || r.label}
                    </span>
                  </span>
                  {active && q.trim().length >= 2 && (
                    <span className={`text-[10px] font-medium ${dark ? 'text-sky-300' : 'text-sky-600'}`}>
                      Enter ↵
                    </span>
                  )}
                  <button
                    type="button"
                    title={fav ? 'Remove favorite' : 'Add favorite'}
                    aria-label={fav ? 'Remove favorite' : 'Add favorite'}
                    onClick={(e) => onToggleStar(e, r)}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                      fav
                        ? dark
                          ? 'text-amber-300 hover:bg-amber-400/10'
                          : 'text-amber-500 hover:bg-amber-50'
                        : dark
                          ? 'text-white/25 hover:bg-white/5 hover:text-amber-300'
                          : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500'
                    }`}
                  >
                    <StarIcon filled={fav} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div
          className={`flex items-center justify-between border-t px-5 py-2.5 text-[10px] ${
            dark ? 'border-white/6 text-white/28' : 'border-slate-100 text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <kbd className="kbd">↑↓</kbd> move
            <kbd className="kbd">↵</kbd> open
            <kbd className="kbd">esc</kbd> close
          </span>
          <span className="flex items-center gap-1">
            <StarIcon filled className="opacity-60" /> favorites saved locally
          </span>
        </div>
      </div>
    </div>
  )
}
