import { useEffect, useMemo, useRef, useState } from 'react'
import { searchPlaces, QUICK_CITIES } from '../lib/weather'

const RECENT_KEY = 'wg-recent-cities'
const POPULAR = QUICK_CITIES.slice(0, 12)

function loadRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').slice(0, 5)
  } catch {
    return []
  }
}

function saveRecent(place) {
  try {
    const prev = loadRecent().filter((p) => p.name !== place.name)
    localStorage.setItem(RECENT_KEY, JSON.stringify([place, ...prev].slice(0, 5)))
  } catch {
    /* ignore */
  }
}

function toItem(c, group) {
  return {
    id: c.id || `city-${c.name}`,
    name: c.name,
    country: c.country || '',
    admin1: c.admin1 || '',
    lat: c.lat,
    lng: c.lng,
    timezone: c.timezone || 'auto',
    label: c.label || [c.name, c.country].filter(Boolean).join(', '),
    group,
  }
}

export default function SearchModal({ open, onClose, onSelect, dark = true }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
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
    setTimeout(() => inputRef.current?.focus(), 40)
  }, [open])

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
    const rec = recent.map((r) => toItem(r, 'recent'))
    const pop = POPULAR.filter((p) => !recent.some((r) => r.name === p.name)).map((c) =>
      toItem(c, 'popular')
    )
    return [...rec, ...pop]
  }, [q, results, recent])

  if (!open) return null

  const pick = (p) => {
    const place = toItem(p)
    saveRecent(place)
    onSelect?.(place)
    onClose?.()
  }

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose?.()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(flatList.length - 1, i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(0, i - 1))
    } else if (e.key === 'Enter' && flatList[activeIdx]) {
      e.preventDefault()
      pick(flatList[activeIdx])
    }
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
        {/* Glow accent */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 h-40 w-72 -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }}
        />

        {/* Search field */}
        <div className={`relative flex items-center gap-3 border-b px-5 py-4 ${dark ? 'border-white/8' : 'border-slate-100'}`}>
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
            <p className={`text-[10px] font-medium uppercase tracking-[0.14em] ${dark ? 'text-white/30' : 'text-slate-400'}`}>
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
              dark ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            ✕
          </button>
        </div>

        {/* Results */}
        <div className="relative max-h-[min(56vh,420px)] overflow-y-auto panel-scroll py-2">
          {q.trim().length >= 2 && !loading && results.length === 0 && (
            <div className={`px-6 py-12 text-center ${dark ? 'text-white/40' : 'text-slate-500'}`}>
              <p className="text-sm font-medium">No places found</p>
              <p className="mt-1 text-[12px]">Try another spelling or a nearby city</p>
            </div>
          )}

          {flatList.map((r, i) => {
            const showHead = r.group !== lastGroup && q.trim().length < 2
            lastGroup = r.group
            const active = activeIdx === i
            return (
              <div key={`${r.group}-${r.id || r.name}`}>
                {showHead && (
                  <p
                    className={`px-5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      dark ? 'text-white/28' : 'text-slate-400'
                    }`}
                  >
                    {r.group === 'recent' ? 'Recent' : 'Popular cities'}
                  </p>
                )}
                <button
                  type="button"
                  className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
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
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
                      r.group === 'recent'
                        ? dark
                          ? 'bg-white/6 text-white/45'
                          : 'bg-slate-100 text-slate-400'
                        : dark
                          ? 'bg-gradient-to-br from-sky-500/25 to-indigo-500/20 text-sky-200'
                          : 'bg-gradient-to-br from-sky-100 to-indigo-50 text-sky-700'
                    }`}
                  >
                    {r.group === 'recent' ? '⏱' : (r.name || '?')[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[14px] font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {r.name}
                    </span>
                    <span className={`block truncate text-[12px] ${dark ? 'text-white/40' : 'text-slate-500'}`}>
                      {[r.admin1, r.country].filter(Boolean).join(' · ') || r.label}
                    </span>
                  </span>
                  {active && (
                    <span className={`text-[10px] font-medium ${dark ? 'text-sky-300' : 'text-sky-600'}`}>
                      Enter ↵
                    </span>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
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
          <span>Open-Meteo</span>
        </div>
      </div>
    </div>
  )
}
