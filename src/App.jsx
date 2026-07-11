import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react'
import Sidebar from './components/Sidebar'
import GlobeFallback from './components/GlobeFallback'
import TopBar from './components/TopBar'
import LeftPromo from './components/LeftPromo'
import StatsPanel from './components/StatsPanel'
import BottomControls from './components/BottomControls'
import BottomPanel from './components/BottomPanel'
import FavoriteStrip from './components/FavoriteStrip'
import {
  fetchWeatherBundle,
  fetchCitiesSnapshot,
  reverseGeocode,
  bestOutdoorWindow,
  QUICK_CITIES,
} from './lib/weather'
import { capitalForCountry, isCapitalPlace } from './lib/capitals'
import {
  loadFavorites,
  toggleFavorite as toggleFavoriteStore,
  isFavorite as checkFavorite,
  pushRecent,
  normalizePlace,
  loadLastPlace,
  saveLastPlace,
  RECENT_KEY,
  FAVORITES_KEY,
  LAST_PLACE_KEY,
} from './lib/places'
import { placeFromSearch, writePlaceToUrl, placeShareUrl } from './lib/urlPlace'
import useOnline from './hooks/useOnline'
import { useI18n } from './i18n/index.jsx'

const loadGlobeScene = () => import('./components/GlobeScene')
const GlobeScene = lazy(loadGlobeScene)
const SearchModal = lazy(() => import('./components/SearchModal'))
const SettingsModal = lazy(() => import('./components/SettingsModal'))
const HowItWorksModal = lazy(() => import('./components/HowItWorksModal'))
const ShortcutsHelp = lazy(() => import('./components/ShortcutsHelp'))

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
  const { t } = useI18n()
  const [dark, setDark] = useState(prefs.dark !== false)
  const [autoTheme, setAutoTheme] = useState(prefs.autoTheme === true)
  const [quality, setQuality] = useState(prefs.quality === 'low' ? 'low' : 'high')
  const [mode, setMode] = useState('3d')
  // Start zoomed out so capitals / cities are visible on the globe
  const [zoom, setZoom] = useState(0.72)
  const [panelOpen, setPanelOpen] = useState(false)
  const [capitalSnap, setCapitalSnap] = useState(null)
  const [panelMode, setPanelMode] = useState('hourly')
  const [activeNav, setActiveNav] = useState('home')
  const [howOpen, setHowOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [resetToken, setResetToken] = useState(0)
  const [unit, setUnit] = useState(prefs.unit === 'F' ? 'F' : 'C')
  const [place, setPlace] = useState(() => placeFromSearch() || loadLastPlace() || DEFAULT_PLACE)
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
      const name = target?.name || t('city')
      showToast(added ? t('toast_saved', { name }) : t('toast_removed', { name }))
    },
    [place, showToast, t]
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
        const data = await fetchWeatherBundle(p.lat, p.lng, p.timezone || 'auto')
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
          const aqiBit =
            data.air?.labelKey || (data.air?.label && data.air.label !== '—')
              ? t('toast_aqi', {
                  label: data.air.labelKey ? t(data.air.labelKey) : data.air.label,
                })
              : ''
          showToast(`${p.name} · ${deg}°${aqiBit}`)
        }
      } catch (e) {
        console.error(e)
        setWeatherError(true)
        if (!silent) showToast(t('couldNotLoadWeather'))
      } finally {
        setLoading(false)
      }
    },
    [showToast, t]
  )

  const outdoor = useMemo(
    () => bestOutdoorWindow(weather?.hourly, weather?.timezone),
    [weather]
  )

  useEffect(() => {
    const fromUrl = placeFromSearch()
    const start = fromUrl || loadLastPlace() || DEFAULT_PLACE
    setPlace(start)
    writePlaceToUrl(start)
    loadWeather(start, { silent: true })
    // Batch weather for metros + capitals (Open-Meteo multi-location)
    const seed = QUICK_CITIES.map((c) => ({
      ...c,
      id: c.id || `city-${c.name}`,
      isCapital: Boolean(c.isCapital || isCapitalPlace(c)),
    }))
    // Chunk if needed — API accepts many points; keep under ~40 per request
    const chunk = (arr, n) => {
      const out = []
      for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n))
      return out
    }
    Promise.all(chunk(seed, 40).map((part) => fetchCitiesSnapshot(part)))
      .then((parts) => setCitySnaps(parts.flat()))
      .catch(() => setCitySnaps(seed))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When place changes, resolve country capital + load its weather for the pin
  useEffect(() => {
    if (!place?.country && !place?.countryCode) {
      setCapitalSnap(null)
      return
    }
    const cap = capitalForCountry(place.country, place.countryCode)
    if (!cap) {
      setCapitalSnap(null)
      return
    }
    const same =
      Math.abs(cap.lat - place.lat) < 0.5 && Math.abs(cap.lng - place.lng) < 0.5
    if (same && weather?.current) {
      setCapitalSnap({
        ...cap,
        temp: weather.current.temp,
        group: weather.current.group,
        icon: weather.current.icon,
        isCapital: true,
      })
      return
    }

    let cancelled = false
    // Pin immediately; weather fills in from snapshot batch or dedicated fetch
    setCapitalSnap((prev) => {
      if (
        prev &&
        Math.abs(prev.lat - cap.lat) < 0.2 &&
        Math.abs(prev.lng - cap.lng) < 0.2 &&
        prev.temp != null
      ) {
        return { ...prev, ...cap, isCapital: true }
      }
      return { ...cap, isCapital: true, temp: prev?.temp, group: prev?.group, icon: prev?.icon }
    })

    fetchCitiesSnapshot([{ ...cap, id: cap.id || `capital-${cap.name}` }])
      .then((list) => {
        if (cancelled) return
        const row = list[0] || {}
        setCapitalSnap({ ...cap, ...row, isCapital: true })
        setCitySnaps((prev) => {
          const match = (c) =>
            Math.abs(c.lat - cap.lat) < 0.35 && Math.abs(c.lng - cap.lng) < 0.35
          if (prev.some(match)) {
            return prev.map((c) => (match(c) ? { ...c, ...row, isCapital: true } : c))
          }
          return [...prev, { ...cap, ...row, isCapital: true }]
        })
      })
      .catch(() => {
        /* keep placeholder capital pin */
      })

    return () => {
      cancelled = true
    }
    // weather fields only — avoid re-fetching on full weather object churn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    place?.lat,
    place?.lng,
    place?.country,
    place?.countryCode,
    weather?.current?.temp,
    weather?.current?.group,
    weather?.current?.icon,
  ])

  // Deep link back/forward
  useEffect(() => {
    const onPop = () => {
      const p = placeFromSearch()
      if (!p) return
      setPlace(p)
      saveLastPlace(p)
      loadWeather(p, { silent: true })
      setResetToken((n) => n + 1)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [loadWeather])

  // Auto theme from local is_day when enabled
  useEffect(() => {
    if (!autoTheme || weather?.current?.isDay == null) return
    setDark(!weather.current.isDay)
  }, [autoTheme, weather?.current?.isDay])

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
    if (!online) showToast(t('toast_offline'))
  }, [online, showToast, t])

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

  const selectPlace = useCallback(
    (p, { openHourly = true, fromSearch = false } = {}) => {
      const placeObj = toPlace(p)
      setPlace(placeObj)
      pushRecent(placeObj)
      saveLastPlace(placeObj)
      writePlaceToUrl(placeObj)
      // Country-level zoom (near LOD) — one capital star + nearby cities
      setZoom(1.35)
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
      showToast(t('toast_locUnsupported'))
      return
    }
    setLocating(true)
    showToast(t('toast_finding'))
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const found = await reverseGeocode(lat, lng)
          // Always prefer a real place name from reverse geocode
          const placeName =
            (found.name && String(found.name).trim()) ||
            (found.admin1 && String(found.admin1).trim()) ||
            (found.country && String(found.country).trim()) ||
            `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`
          const placeLabel =
            (found.label && String(found.label).trim()) ||
            [placeName, found.admin1, found.country].filter(Boolean).join(', ')
          selectPlace(
            {
              ...found,
              id: found.id || `geo-${lat.toFixed(4)},${lng.toFixed(4)}`,
              name: placeName,
              label: placeLabel,
              lat,
              lng,
            },
            { openHourly: true, fromSearch: true }
          )
          showToast(t('toast_nearYou', { name: placeName }))
        } catch (e) {
          console.error(e)
          // Still fly to coords; name from coords so we never stick on "Your location"
          const coordName = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`
          selectPlace(
            {
              id: `geo-${lat.toFixed(4)},${lng.toFixed(4)}`,
              name: coordName,
              country: '',
              admin1: '',
              lat,
              lng,
              timezone: 'auto',
              label: coordName,
            },
            { openHourly: true, fromSearch: true }
          )
          showToast(t('toast_locFound'))
        } finally {
          setLocating(false)
        }
      },
      (err) => {
        setLocating(false)
        showToast(err?.code === 1 ? t('toast_locDenied') : t('toast_locFail'))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
    )
  }, [selectPlace, showToast, t])

  const clearLocalData = useCallback(() => {
    try {
      localStorage.removeItem(PREFS_KEY)
      localStorage.removeItem(RECENT_KEY)
      localStorage.removeItem(FAVORITES_KEY)
      localStorage.removeItem(LAST_PLACE_KEY)
    } catch {
      /* ignore */
    }
    setFavorites([])
    setFavSnaps([])
    setPlace(DEFAULT_PLACE)
    setUnit('C')
    setDark(true)
    setAutoTheme(false)
    setQuality('high')
    setAutoRotate(true)
    setAutoRefresh(true)
    writePlaceToUrl(DEFAULT_PLACE)
    loadWeather(DEFAULT_PLACE, { silent: true })
    showToast(t('toast_cleared'))
  }, [loadWeather, showToast, t])

  const sharePlace = useCallback(async () => {
    if (!place) return
    const temp =
      weather?.current?.temp != null
        ? unit === 'F'
          ? Math.round((weather.current.temp * 9) / 5 + 32)
          : Math.round(weather.current.temp)
        : null
    const label = weather?.current?.label || ''
    const link = placeShareUrl(place)
    const text = [
      place.label || place.name,
      temp != null ? `${temp}°${unit}` : null,
      label,
      weather?.air?.label ? `AQI ${weather.air.label}` : null,
      link,
    ]
      .filter(Boolean)
      .join(' · ')

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${place.name} weather`,
          text,
          url: link,
        })
        showToast(t('toast_shared'))
      } else {
        await navigator.clipboard.writeText(text)
        showToast(t('toast_copied'))
      }
    } catch (e) {
      if (e?.name === 'AbortError') return
      try {
        await navigator.clipboard.writeText(text)
        showToast(t('toast_copied'))
      } catch {
        showToast(t('toast_shareFail'))
      }
    }
  }, [place, weather, unit, showToast, t])

  const handleNav = (id) => {
    setActiveNav(id)
    if (fullscreen) {
      document.exitFullscreen?.().catch(() => {})
      setFullscreen(false)
    }
    if (id === 'home') {
      setPanelOpen(false)
      setZoom(0.72)
      setMode('3d')
      setAutoRotate(true)
      setResetToken((n) => n + 1)
      showToast(t('toast_global'))
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
    setZoom(0.72)
    setMode('3d')
    setAutoRotate(true)
    setResetToken((n) => n + 1)
    showToast(t('toast_reset'))
  }

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        setPanelOpen(false)
        await document.documentElement.requestFullscreen()
        setFullscreen(true)
        showToast(t('toast_fs'))
      } else {
        await document.exitFullscreen()
        setFullscreen(false)
      }
    } catch {
      setFullscreen((f) => {
        const next = !f
        if (next) setPanelOpen(false)
        showToast(next ? t('toast_fs') : t('exitFullscreen'))
        return next
      })
    }
  }, [showToast, t])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA'
      if (e.key === 'Escape') {
        if (helpOpen) setHelpOpen(false)
        else if (searchOpen) setSearchOpen(false)
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
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault()
        setHelpOpen(true)
        return
      }
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
      } else if ((e.key === 'l' || e.key === 'L') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        locateMe()
      } else if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        sharePlace()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    searchOpen,
    settingsOpen,
    howOpen,
    helpOpen,
    userMenuOpen,
    panelOpen,
    locateMe,
    sharePlace,
    toggleFullscreen,
  ])

  const setUnitPersist = (u) => {
    setUnit(u)
    savePrefs({ unit: u })
  }

  const setDarkPersist = (d) => {
    setAutoTheme(false)
    savePrefs({ dark: d, autoTheme: false })
    setDark(d)
  }

  const setAutoThemePersist = (on) => {
    setAutoTheme(on)
    savePrefs({ autoTheme: on })
    if (on && weather?.current?.isDay != null) {
      setDark(!weather.current.isDay)
    }
  }

  const setQualityPersist = (q) => {
    setQuality(q)
    savePrefs({ quality: q })
  }

  useEffect(() => {
    try {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? '#030712' : '#a8c4de')
    } catch {
      /* ignore */
    }
  }, [dark])

  const focus = useMemo(() => {
    if (!place) return null
    return {
      name: place.name,
      country: place.country,
      lat: place.lat,
      lng: place.lng,
      temp: weather?.current?.temp,
      group: weather?.current?.group,
      icon: weather?.current?.icon,
      isCapital: isCapitalPlace(place) || Boolean(place.isCapital),
    }
  }, [place, weather])

  const capitalForGlobe = useMemo(() => {
    if (!capitalSnap) return null
    return {
      ...capitalSnap,
      isCapital: true,
    }
  }, [capitalSnap])

  return (
    <div className={`app-shell relative h-full w-full overflow-hidden ${dark ? '' : 'light'}`}>
      <div className="app-aurora" aria-hidden />
      <div
        className={`stage-frame absolute overflow-hidden border transition-all duration-300 ${
          fullscreen
            ? 'is-fullscreen inset-0 rounded-none border-0'
            : 'inset-2 rounded-[1.35rem] sm:inset-3 sm:rounded-[1.5rem]'
        } ${
          dark
            ? 'border-white/[0.08] bg-[#030712]'
            : 'border-slate-400/40 bg-[#a8c4de]'
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
              favorites={favorites}
              capital={capitalForGlobe}
              unit={unit}
              quality={quality}
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
            onClearData={() => {
              setUserMenuOpen(false)
              clearLocalData()
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
              showToast(!dark ? t('toast_dark') : t('toast_light'))
            }}
            onOpenHelp={() => setHelpOpen(true)}
            latency={liveMs}
            placeName={place?.name}
            userMenuOpen={userMenuOpen}
            onUserMenu={() => setUserMenuOpen((v) => !v)}
            onCloseUserMenu={() => setUserMenuOpen(false)}
            unit={unit}
            onToggleUnit={() => setUnitPersist(unit === 'C' ? 'F' : 'C')}
            onSettings={() => setSettingsOpen(true)}
            onClearData={clearLocalData}
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
              outdoor={outdoor}
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
              outdoor={outdoor}
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
            showToast(m === '3d' ? t('mode3d') : t('mode2d'))
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
                if (added === true) showToast(t('toast_favAdd'))
                else if (added === false) showToast(t('toast_favRem'))
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
              autoTheme={autoTheme}
              onToggleAutoTheme={() => setAutoThemePersist(!autoTheme)}
              quality={quality}
              onToggleQuality={() => setQualityPersist(quality === 'high' ? 'low' : 'high')}
            />
          )}
          {helpOpen && (
            <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} dark={dark} />
          )}
        </Suspense>

        {fullscreen && (
          <button
            type="button"
            onClick={toggleFullscreen}
            className="pointer-events-auto absolute right-4 top-4 z-50 glass-pill rounded-full px-3.5 py-1.5 text-xs font-medium text-white/85"
          >
            {t('exitFullscreen')} · <kbd className="kbd">Esc</kbd>
          </button>
        )}

        {toast && (
          <div
            role="status"
            className={`toast-enter glass-pill pointer-events-none absolute bottom-24 left-1/2 z-50 max-w-[90vw] -translate-x-1/2 truncate rounded-full px-5 py-2.5 text-xs font-semibold shadow-2xl ${
              dark ? 'text-white/95' : 'text-slate-900'
            }`}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  )
}
