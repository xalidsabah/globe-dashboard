import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react'
import Sidebar from './components/Sidebar'
import GlobeFallback from './components/GlobeFallback'
import TopBar from './components/TopBar'
import LeftPromo from './components/LeftPromo'
import StatsPanel from './components/StatsPanel'
import BottomControls from './components/BottomControls'
import BottomPanel from './components/BottomPanel'
import FavoriteStrip from './components/FavoriteStrip'
import { fetchWeather, fetchCitiesSnapshot, reverseGeocode, QUICK_CITIES } from './lib/weather'
import {
  loadFavorites,
  toggleFavorite as toggleFavoriteStore,
  isFavorite as checkFavorite,
  pushRecent,
  normalizePlace,
  loadLastPlace,
  saveLastPlace,
} from './lib/places'
import useOnline from './hooks/useOnline'

const loadGlobeScene = () => import('./components/GlobeScene')
const GlobeScene = lazy(loadGlobeScene)
const SearchModal = lazy(() => import('./components/SearchModal'))
const SettingsModal = lazy(() => import('./components/SettingsModal'))
const HowItWorksModal = lazy(() => import('./components/HowItWorksModal'))

const DEFAULT_PLACE = {
  id: 'city-New York',
  name: 'New York',
  country: 'United States',
  admin1: '',
  lat: 40.7128,
  lng: -74.006,
  timezone: 'America/New_York',
  label: 'New York, United States',
}

const PREFS_KEY = 'wg-prefs'

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')
  } catch {
    return {}
  }
}

function savePrefs(partial) {
  try {
    const prev = loadPrefs()
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...prev, ...partial }))
  } catch {
    /* ignore */
  }
}

function toPlace(city) {
  return normalizePlace(city) || DEFAULT_PLACE
}

export default function App() {
  const prefs = loadPrefs()
  const online = useOnline()
  const [dark, setDark] = useState(prefs.dark !== false)
  const [mode, setMode] = useState('3d')
  const [zoom, setZoom] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [panelMode, setPanelMode] = useState('hourly')
  const [activeNav, setActiveNav] = useState('home')
  const [howOpen, setHowOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [resetToken, setResetToken] = useState(0)
  const [unit, setUnit] = useState(prefs.unit === 'F' ? 'F' : 'C')
  const [place, setPlace] = useState(() => loadLastPlace() || DEFAULT_PLACE)
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [liveMs, setLiveMs] = useState(null)
  const [toast, setToast] = useState(null)
  const [autoRotate, setAutoRotate] = useState(prefs.autoRotate !== false)
  const [autoRefresh, setAutoRefresh] = useState(prefs.autoRefresh !== false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [citySnaps, setCitySnaps] = useState(
    QUICK_CITIES.map((c) => ({ ...c, id: `city-${c.name}` }))
  )
  const [favorites, setFavorites] = useState(() => loadFavorites())
  const [favSnaps, setFavSnaps] = useState(() => loadFavorites())
  const [weatherError, setWeatherError] = useState(false)

  const showToast = useCallback((msg) => {
    setToast(msg)
    window.clearTimeout(showToast._t)
    showToast._t = window.setTimeout(() => setToast(null), 2400)
  }, [])

  // Warm the 3D chunk after first paint so open feels instant
  useEffect(() => {
    const warm = () => {
      loadGlobeScene().catch(() => {})
    }
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm, { timeout: 2200 })
      return () => window.cancelIdleCallback?.(id)
    }
    const t = window.setTimeout(warm, 900)
    return () => window.clearTimeout(t)
  }, [])

  const handleToggleFavorite = useCallback(
    (target = place) => {
      if (!target?.lat && !target?.name) return
      const { list, added } = toggleFavoriteStore(target)
      setFavorites(list)
      const name = target?.name || 'City'
      showToast(added ? `★ ${name} saved` : `${name} removed`)
    },
    [place, showToast]
  )

  const placeIsFavorite = useMemo(
    () => (place ? checkFavorite(place, favorites) : false),
    [place, favorites]
  )

  const loadWeather = useCallback(
    async (p, { silent } = {}) => {
      if (!p?.lat) return
      setLoading(true)
      setWeatherError(false)
      const t0 = performance.now()
      try {
        const data = await fetchWeather(p.lat, p.lng, p.timezone || 'auto')
        setWeather(data)
        setWeatherError(false)
        setLiveMs(Math.round(performance.now() - t0))
        setCitySnaps((prev) =>
          prev.map((c) =>
            Math.abs(c.lat - p.lat) < 0.35 && Math.abs(c.lng - p.lng) < 0.35
              ? { ...c, temp: data.current?.temp, icon: data.current?.icon, code: data.current?.code }
              : c
          )
        )
        if (!silent) {
          const deg = data.current?.temp != null ? Math.round(data.current.temp) : '—'
          showToast(`${p.name} · ${deg}°`)
        }
      } catch (e) {
        console.error(e)
        setWeatherError(true)
        if (!silent) showToast('Could not load weather')
      } finally {
        setLoading(false)
      }
    },
    [showToast]
  )

  useEffect(() => {
    const start = loadLastPlace() || DEFAULT_PLACE
    setPlace(start)
    loadWeather(start, { silent: true })
    fetchCitiesSnapshot(QUICK_CITIES.map((c) => ({ ...c, id: `city-${c.name}` })))
      .then(setCitySnaps)
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep favorite strip temps fresh
  useEffect(() => {
    if (!favorites.length) {
      setFavSnaps([])
      return
    }
    let cancelled = false
    fetchCitiesSnapshot(favorites)
      .then((list) => {
        if (!cancelled) setFavSnaps(list)
      })
      .catch(() => {
        if (!cancelled) setFavSnaps(favorites)
      })
    return () => {
      cancelled = true
    }
  }, [favorites])

  useEffect(() => {
    if (!online) showToast('You’re offline')
  }, [online, showToast])

  useEffect(() => {
    if (!autoRefresh || !place) return
    const id = setInterval(() => loadWeather(place, { silent: true }), 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [autoRefresh, place, loadWeather])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false)
        else if (settingsOpen) setSettingsOpen(false)
        else if (howOpen) setHowOpen(false)
        else if (userMenuOpen) setUserMenuOpen(false)
        else if (panelOpen) {
          setPanelOpen(false)
          setActiveNav('home')
        } else if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
        }
        return
      }
      if (typing) return
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        setPanelOpen(false)
        setSearchOpen(true)
      } else if (e.key === 'f' || e.key === 'F') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault()
          toggleFullscreen()
        }
      } else if (e.key === 'h' || e.key === 'H') {
        setPanelMode('hourly')
        setPanelOpen(true)
        setActiveNav('forecast')
      } else if (e.key === 'd' || e.key === 'D') {
        setPanelMode('analytics')
        setPanelOpen(true)
        setActiveNav('chart')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen, settingsOpen, howOpen, userMenuOpen, panelOpen])

  const selectPlace = useCallback(
    (p, { openHourly = true, fromSearch = false } = {}) => {
      const placeObj = toPlace(p)
      setPlace(placeObj)
      pushRecent(placeObj)
      saveLastPlace(placeObj)
      setZoom(1.08)
      setResetToken((n) => n + 1)
      setFullscreen(false)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})

      if (fromSearch) {
        setPanelOpen(false)
        setActiveNav('home')
      } else if (openHourly) {
        setPanelMode('hourly')
        setPanelOpen(true)
        setActiveNav('forecast')
      }
      loadWeather(placeObj)
    },
    [loadWeather]
  )

  const locateMe = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Location not supported')
      return
    }
    setLocating(true)
    showToast('Finding you…')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude: lat, longitude: lng } = pos.coords
          const found = await reverseGeocode(lat, lng)
          selectPlace(
            {
              ...found,
              lat,
              lng,
            },
            { openHourly: true, fromSearch: true }
          )
          showToast(`${found.name} · near you`)
        } catch (e) {
          console.error(e)
          selectPlace(
            {
              id: `geo-${pos.coords.latitude},${pos.coords.longitude}`,
              name: 'Your location',
              country: '',
              admin1: '',
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              timezone: 'auto',
              label: 'Your location',
            },
            { openHourly: true, fromSearch: true }
          )
          showToast('Location found')
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        showToast(err?.code === 1 ? 'Location permission denied' : 'Could not get location')
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 60000 }
    )
  }, [selectPlace, showToast])

  const sharePlace = useCallback(async () => {
    if (!place) return
    const temp =
      weather?.current?.temp != null
        ? unit === 'F'
          ? Math.round((weather.current.temp * 9) / 5 + 32)
          : Math.round(weather.current.temp)
        : null
    const label = weather?.current?.label || ''
    const text = [
      place.label || place.name,
      temp != null ? `${temp}°${unit}` : null,
      label,
      typeof window !== 'undefined' ? window.location.href : '',
    ]
      .filter(Boolean)
      .join(' · ')

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${place.name} weather`,
          text,
          url: window.location.href,
        })
        showToast('Shared')
      } else {
        await navigator.clipboard.writeText(text)
        showToast('Copied to clipboard')
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(text)
        showToast('Copied to clipboard')
      } catch {
        showToast('Could not share')
      }
    }
  }, [place, weather, unit, showToast])

  const handleNav = (id) => {
    setActiveNav(id)
    if (fullscreen) {
      document.exitFullscreen?.().catch(() => {})
      setFullscreen(false)
    }
    if (id === 'home') {
      setPanelOpen(false)
      setZoom(1)
      setMode('3d')
      setAutoRotate(true)
      setResetToken((n) => n + 1)
      showToast('Global view')
    } else if (id === 'search') {
      setPanelOpen(false)
      setSearchOpen(true)
    } else if (id === 'forecast') {
      setPanelMode('hourly')
      setPanelOpen(true)
    } else if (id === 'chart') {
      setPanelMode('analytics')
      setPanelOpen(true)
    } else if (id === 'alerts') {
      setPanelMode('alerts')
      setPanelOpen(true)
    }
  }

  const handleResetView = () => {
    setZoom(1)
    setMode('3d')
    setAutoRotate(true)
    setResetToken((n) => n + 1)
    showToast('View reset')
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        setPanelOpen(false)
        await document.documentElement.requestFullscreen()
        setFullscreen(true)
        showToast('Fullscreen')
      } else {
        await document.exitFullscreen()
        setFullscreen(false)
      }
    } catch {
      setFullscreen((f) => {
        const next = !f
        if (next) setPanelOpen(false)
        showToast(next ? 'Fullscreen' : 'Exit fullscreen')
        return next
      })
    }
  }

  const setUnitPersist = (u) => {
    setUnit(u)
    savePrefs({ unit: u })
  }

  const setDarkPersist = (d) => {
    setDark(d)
    savePrefs({ dark: d })
  }

  useEffect(() => {
    try {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#050a14' : '#9ebbd8')
    } catch {
      /* ignore */
    }
  }, [dark])

  const focus = useMemo(() => {
    if (!place) return null
    return { name: place.name, lat: place.lat, lng: place.lng, temp: weather?.current?.temp }
  }, [place, weather])

  return (
    <div className={`app-shell relative h-full w-full overflow-hidden ${dark ? '' : 'light'}`}>
      <div className="app-aurora" aria-hidden />
      <div
        className={`stage-frame absolute overflow-hidden border transition-all duration-300 ${
          fullscreen
            ? 'is-fullscreen inset-0 rounded-none border-0'
            : 'inset-2 rounded-2xl sm:inset-3 sm:rounded-[1.25rem]'
        } ${
          dark
            ? 'border-white/[0.08] bg-[#050a14]'
            : 'border-white/40 bg-[#8fafd0]'
        }`}
      >
        {loading && <div className="top-progress" aria-hidden />}

        <div className="absolute inset-0">
          <Suspense fallback={<GlobeFallback dark={dark} />}>
            <GlobeScene
              zoom={zoom}
              autoRotate={autoRotate && mode === '3d'}
              mode={mode}
              resetToken={resetToken}
              dark={dark}
              focus={focus}
              cities={citySnaps}
              unit={unit}
              onSelectCity={(city) => selectPlace(city, { openHourly: true })}
            />
          </Suspense>
        </div>

        <div className="globe-vignette absolute inset-0 z-[1]" aria-hidden />

        {!fullscreen && (
          <Sidebar
            activeNav={activeNav}
            onNav={handleNav}
            dark={dark}
            expanded={sidebarExpanded}
            onToggleExpand={() => setSidebarExpanded((e) => !e)}
            onSettings={() => setSettingsOpen(true)}
            onLogout={() => {
              setUserMenuOpen(false)
              showToast('Signed out (demo)')
            }}
          />
        )}

        {!fullscreen && (
          <TopBar
            dark={dark}
            sidebarWide={sidebarExpanded}
            online={online}
            locating={locating}
            onToggleTheme={() => {
              setDarkPersist(!dark)
              showToast(!dark ? 'Dark theme' : 'Light theme')
            }}
            latency={liveMs}
            placeName={place?.name}
            userMenuOpen={userMenuOpen}
            onUserMenu={() => setUserMenuOpen((v) => !v)}
            onCloseUserMenu={() => setUserMenuOpen(false)}
            unit={unit}
            onToggleUnit={() => setUnitPersist(unit === 'C' ? 'F' : 'C')}
            onSettings={() => setSettingsOpen(true)}
            onLogout={() => showToast('Signed out (demo)')}
            onOpenSearch={() => {
              setPanelOpen(false)
              setSearchOpen(true)
            }}
            onLocate={locateMe}
            onShare={sharePlace}
          />
        )}

        {!fullscreen && (
          <>
            <LeftPromo
              dark={dark}
              place={place}
              weather={weather}
              unit={unit}
              onHowItWorks={() => setHowOpen(true)}
              onOpenSearch={() => {
                setPanelOpen(false)
                setSearchOpen(true)
              }}
              isFavorite={placeIsFavorite}
              onToggleFavorite={() => handleToggleFavorite(place)}
              favorites={favorites}
              onSelectFavorite={(f) => selectPlace(f, { openHourly: true })}
              styleLeft={sidebarExpanded ? 'left-[12rem]' : 'left-20'}
            />
            {!online && (
              <div
                className="pointer-events-none absolute left-1/2 top-14 z-50 -translate-x-1/2 rounded-full border border-amber-400/25 bg-black/70 px-3 py-1 text-[10px] text-amber-200/90 backdrop-blur-md"
                role="status"
              >
                Offline
              </div>
            )}
            <StatsPanel
              weather={weather}
              unit={unit}
              dark={dark}
              refreshing={loading}
              error={weatherError}
              onRefresh={() => loadWeather(place)}
              hourly={weather?.hourly || []}
            />
            {!panelOpen && (
              <FavoriteStrip
                cities={favSnaps}
                place={place}
                unit={unit}
                dark={dark}
                onSelect={(f) => selectPlace(f, { openHourly: true })}
              />
            )}
          </>
        )}

        <BottomControls
          mode={mode}
          onModeChange={(m) => {
            setMode(m)
            setResetToken((n) => n + 1)
            if (m === '2d') setAutoRotate(false)
            showToast(m === '3d' ? '3D mode' : '2D mode')
          }}
          onZoomIn={() => setZoom((z) => Math.min(2.2, +(z + 0.18).toFixed(2)))}
          onZoomOut={() => setZoom((z) => Math.max(0.5, +(z - 0.18).toFixed(2)))}
          onResetView={handleResetView}
          onExpandPanel={() => {
            setPanelMode('hourly')
            setPanelOpen(true)
            setActiveNav('forecast')
          }}
          panelOpen={panelOpen && !fullscreen}
          dark={dark}
          fullscreen={fullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        <BottomPanel
          open={panelOpen && !fullscreen}
          onClose={() => {
            setPanelOpen(false)
            setActiveNav('home')
          }}
          weather={weather}
          unit={unit}
          dark={dark}
          place={place}
          mode={panelMode}
          onModeChange={(m) => {
            setPanelMode(m)
            setActiveNav(m === 'hourly' ? 'forecast' : m === 'analytics' ? 'chart' : 'alerts')
          }}
          sidebarWide={sidebarExpanded}
          loading={loading}
        />

        <Suspense fallback={null}>
          {howOpen && (
            <HowItWorksModal open={howOpen} onClose={() => setHowOpen(false)} dark={dark} />
          )}
          {searchOpen && (
            <SearchModal
              open={searchOpen}
              onClose={() => setSearchOpen(false)}
              onSelect={(p) => selectPlace(p, { fromSearch: true })}
              dark={dark}
              favorites={favorites}
              onFavoritesChange={(list, added) => {
                setFavorites(list)
                if (added === true) showToast('★ Added to favorites')
                else if (added === false) showToast('Removed from favorites')
              }}
            />
          )}
          {settingsOpen && (
            <SettingsModal
              open={settingsOpen}
              onClose={() => setSettingsOpen(false)}
              dark={dark}
              unit={unit}
              onToggleUnit={() => setUnitPersist(unit === 'C' ? 'F' : 'C')}
              autoRotate={autoRotate}
              onToggleAutoRotate={() => {
                setAutoRotate((v) => {
                  savePrefs({ autoRotate: !v })
                  return !v
                })
              }}
              autoRefresh={autoRefresh}
              onToggleAutoRefresh={() => {
                setAutoRefresh((v) => {
                  savePrefs({ autoRefresh: !v })
                  return !v
                })
              }}
            />
          )}
        </Suspense>

        {fullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto absolute right-4 top-4 z-50 glass-pill rounded-full px-3.5 py-1.5 text-xs font-medium text-white/85"
          >
            Exit fullscreen · <kbd className="kbd">Esc</kbd>
          </button>
        )}

        {toast && (
          <div
            role="status"
            className={`toast-enter pointer-events-none absolute bottom-24 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 truncate rounded-full border px-4 py-2 text-xs font-medium shadow-xl backdrop-blur-md ${
              dark
                ? 'border-white/12 bg-black/80 text-white/92'
                : 'border-slate-200 bg-white text-slate-800 shadow-slate-300/40'
            }`}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
