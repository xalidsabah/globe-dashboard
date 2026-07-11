import { useEffect, useId, useMemo, useRef, useState } from 'react'
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
import StarButton, { StarIcon } from './StarButton'
import { useI18n } from '../i18n/index.jsx'

const POPULAR = QUICK_CITIES.slice(0, 12)

const GROUP_LABEL_KEY = {
  favorite: 'favorites',
  recent: 'recent',
  popular: 'popularCities',
  result: null,
}

function toItem(c, group) {
  const place = normalizePlace(c)
  if (!place) return null
  return { ...place, group }
}

function avatarTone(group, dark) {
  if (group === 'favorite') {
    return dark ? 'bg-amber-400/15 text-amber-300' : 'bg-amber-50 text-amber-600'
  }
  if (group === 'recent') {
    return dark ? 'bg-white/6 text-white/45' : 'bg-slate-100 text-slate-400'
  }
  return dark
    ? 'bg-gradient-to-br from-sky-500/25 to-indigo-500/20 text-sky-200'
    : 'bg-gradient-to-br from-sky-100 to-indigo-50 text-sky-700'
}

function avatarGlyph(r) {
  if (r.group === 'favorite') return '★'
  if (r.group === 'recent') return '⏱'
  return (r.name || '?')[0]
}

export default function SearchModal({
  open,
  onClose,
  onSelect,
  dark = true,
  favorites: favoritesProp,
  onFavoritesChange,
}) {
  const { t } = useI18n()
  const listId = useId()
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [recent, setRecent] = useState([])
  const [favorites, setFavorites] = useState(() => favoritesProp ?? loadFavorites())
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const activeRef = useRef(null)

  // Sync favorites from parent when provided
  useEffect(() => {
    if (favoritesProp) setFavorites(favoritesProp)
  }, [favoritesProp])

  // Reset / hydrate when modal opens
  useEffect(() => {
    if (!open) {
      setQ('')
      setResults([])
      setError(null)
      setActiveIdx(0)
      setLoading(false)
      return
    }
    setRecent(loadRecent())
    setFavorites(favoritesProp ?? loadFavorites())
    const t = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps -- only rehydrate on open

  // Debounced geocode search
  useEffect(() => {
    if (!open || q.trim().length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    const t = window.setTimeout(async () => {
      try {
        const list = await searchPlaces(q, 8)
        if (cancelled) return
        setResults(list.map((r) => toItem(r, 'result')).filter(Boolean))
        setActiveIdx(0)
      } catch {
        if (cancelled) return
        setResults([])
        setError(t('couldNotLoadWeather'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 260)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [q, open])

  const searching = q.trim().length >= 2

  const flatList = useMemo(() => {
    if (searching) return results

    const fav = favorites.map((r) => toItem(r, 'favorite')).filter(Boolean)
    const favKeys = new Set(fav.map((f) => placeKey(f)))
    const rec = recent
      .filter((r) => !favKeys.has(placeKey(r)))
      .map((r) => toItem(r, 'recent'))
      .filter(Boolean)
    const used = new Set([...favKeys, ...rec.map((r) => placeKey(r))])
    const pop = POPULAR.filter((p) => !used.has(placeKey(p)))
      .map((c) => toItem(c, 'popular'))
      .filter(Boolean)
    return [...fav, ...rec, ...pop]
  }, [searching, results, recent, favorites])

  // Keep keyboard highlight in view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx, flatList.length])

  // Clamp active index when list shrinks
  useEffect(() => {
    if (activeIdx >= flatList.length) {
      setActiveIdx(Math.max(0, flatList.length - 1))
    }
  }, [flatList.length, activeIdx])

  if (!open) return null

  const pick = (p) => {
    const place = normalizePlace(p)
    if (!place) return
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
      return
    }
    if (!flatList.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(flatList.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && flatList[activeIdx]) {
      e.preventDefault()
      pick(flatList[activeIdx])
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIdx(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIdx(flatList.length - 1)
    }
  }

  let lastGroup = null
  const emptySearch = searching && !loading && !error && results.length === 0
  const showHint = !searching && favorites.length === 0 && recent.length === 0

  return (
    <div
      className="absolute inset-0 z-[80] flex items-start justify-center px-4 pt-[8vh] sm:pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label={t('searchCities')}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-label={t('close')}
      />

      <div
        className={`modal-enter relative w-full max-w-xl overflow-hidden rounded-[1.5rem] shadow-2xl ${
          dark
            ? 'border border-white/12 bg-[#060b16]/96 backdrop-blur-2xl'
            : 'border border-slate-200/90 bg-white/97 backdrop-blur-2xl'
        }`}
      >
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-44 w-80 -translate-x-1/2 rounded-full opacity-45 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgba(56,189,248,0.9) 0%, rgba(167,139,250,0.5) 45%, transparent 70%)',
          }}
        />

        <div
          className={`relative flex items-center gap-3 border-b px-5 py-4 ${
            dark ? 'border-white/8' : 'border-slate-100'
          }`}
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              dark ? 'bg-sky-500/15 text-sky-300' : 'bg-sky-50 text-sky-600'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[10px] ${dark ? 'text-white/30' : 'text-slate-400'}`}>
              {t('findACity')}
            </p>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Tokyo, Paris, Hewlêr…"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={true}
              aria-controls={listId}
              aria-activedescendant={
                flatList[activeIdx] ? `${listId}-opt-${activeIdx}` : undefined
              }
              aria-autocomplete="list"
              className={`mt-0.5 w-full bg-transparent text-[16px] font-medium outline-none ${
                dark
                  ? 'text-white placeholder:text-white/25'
                  : 'text-slate-900 placeholder:text-slate-400'
              }`}
            />
          </div>
          {loading && (
            <span
              className={`animate-pulse text-[11px] font-medium ${
                dark ? 'text-sky-300' : 'text-sky-600'
              }`}
            >
              {t('searching')}
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
            aria-label={t('close')}
          >
            ✕
          </button>
        </div>

        <div
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={t('search')}
          className="relative max-h-[min(56vh,420px)] overflow-y-auto panel-scroll py-2"
        >
          {error && (
            <div className={`px-6 py-10 text-center ${dark ? 'text-rose-300/80' : 'text-rose-600'}`}>
              <p className="text-sm font-medium">{error}</p>
              <p className={`mt-1 text-[12px] ${dark ? 'text-white/40' : 'text-slate-500'}`}>
                Try again in a moment
              </p>
            </div>
          )}

          {emptySearch && (
            <div className={`px-6 py-12 text-center ${dark ? 'text-white/40' : 'text-slate-500'}`}>
              <p className="text-sm font-medium">{t('noPlaces')}</p>
              <p className="mt-1 text-[12px]">{t('trySpelling')}</p>
            </div>
          )}

          {showHint && !error && (
            <p
              className={`px-5 pb-1 pt-2 text-[11px] leading-relaxed ${
                dark ? 'text-white/35' : 'text-slate-500'
              }`}
            >
              {t('starHint')}
            </p>
          )}

          {flatList.map((r, i) => {
            const showHead = !searching && r.group !== lastGroup
            lastGroup = r.group
            const active = activeIdx === i
            const fav = isFavorite(r, favorites)
            const label = GROUP_LABEL_KEY[r.group] ? t(GROUP_LABEL_KEY[r.group]) : null
            const optId = `${listId}-opt-${i}`

            return (
              <div key={`${r.group}-${placeKey(r)}`}>
                {showHead && label && (
                  <div className="flex items-center justify-between px-5 pb-1.5 pt-3">
                    <p className={`text-[10px] ${dark ? 'text-white/30' : 'text-slate-400'}`}>
                      {label}
                      {r.group === 'favorite' && favorites.length > 0 && (
                        <span className="ml-1.5 opacity-60">{favorites.length}</span>
                      )}
                    </p>
                    {r.group === 'recent' && recent.length > 0 && (
                      <button
                        type="button"
                        onClick={onClearRecent}
                        className={`text-[10px] font-medium ${
                          dark
                            ? 'text-white/30 hover:text-white/60'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {t('clear')}
                      </button>
                    )}
                  </div>
                )}
                <div
                  id={optId}
                  role="option"
                  aria-selected={active}
                  ref={active ? activeRef : null}
                  className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-2xl px-2 py-1.5 text-left transition ${
                    active
                      ? dark
                        ? 'bg-sky-500/15 ring-1 ring-sky-400/25'
                        : 'bg-sky-50 ring-1 ring-sky-200'
                      : dark
                        ? 'hover:bg-white/5'
                        : 'hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setActiveIdx(i)}
                >
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-0.5 text-left"
                    onClick={() => pick(r)}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${avatarTone(
                        r.group,
                        dark
                      )}`}
                    >
                      {avatarGlyph(r)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[14px] font-medium ${
                          dark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {r.name}
                      </span>
                      <span
                        className={`block truncate text-[12px] ${
                          dark ? 'text-white/40' : 'text-slate-500'
                        }`}
                      >
                        {[r.admin1, r.country].filter(Boolean).join(' · ') || r.label}
                      </span>
                    </span>
                    {active && (
                      <span
                        className={`hidden text-[10px] font-medium sm:inline ${
                          dark ? 'text-sky-300' : 'text-sky-600'
                        }`}
                      >
                        Enter ↵
                      </span>
                    )}
                  </button>
                  <StarButton
                    filled={fav}
                    dark={dark}
                    onClick={(e) => onToggleStar(e, r)}
                  />
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
          <span className="flex flex-wrap items-center gap-1.5">
            <kbd className="kbd">↑↓</kbd> {t('move')}
            <kbd className="kbd">↵</kbd> {t('open')}
            <kbd className="kbd">esc</kbd> {t('close')}
          </span>
          <span className="flex items-center gap-1 opacity-80">
            <StarIcon filled size={12} /> {t('savedOnDevice')}
          </span>
        </div>
      </div>
    </div>
  )
}
