/** Top bar — compact, quiet chrome */
import { useI18n } from '../i18n/index.jsx'

export default function TopBar({
  dark,
  onToggleTheme,
  latency,
  placeName,
  userMenuOpen,
  onUserMenu,
  onCloseUserMenu,
  unit,
  onToggleUnit,
  onSettings,
  onClearData,
  onOpenSearch,
  onLocate,
  onShare,
  onOpenHelp,
  locating = false,
  online = true,
  sidebarWide = false,
}) {
  const { t } = useI18n()
  const mute = dark ? 'text-white/45' : 'text-slate-700'
  const pillBtn = `glass-pill flex h-8 shrink-0 items-center justify-center rounded-full ${
    dark ? 'text-white/55 hover:text-white' : 'text-slate-700 hover:text-slate-950'
  }`

  return (
    <header
      className={`pointer-events-none absolute inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-start gap-2 pr-3 pt-3 sm:pr-5 sm:pt-4 transition-all duration-300 ${
        sidebarWide ? 'pl-[11.5rem]' : 'pl-[4.5rem]'
      }`}
    >
      <div className="pointer-events-auto z-40 flex h-9 min-w-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleTheme}
          className="glass-pill relative flex h-8 w-[3.25rem] shrink-0 items-center rounded-full px-0.5"
          aria-label={dark ? t('lightMode') : t('darkMode')}
          title={dark ? t('lightMode') : t('darkMode')}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-transform duration-300 ease-out ${
              dark
                ? 'translate-x-0.5 bg-white text-[#030712]'
                : 'translate-x-5 bg-slate-900 text-amber-300'
            }`}
          >
            {dark ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="12" cy="12" r="4" />
              </svg>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleUnit}
          className={`glass-pill flex h-8 shrink-0 items-center rounded-full px-3 text-[11px] font-bold tabular-nums tracking-tight ${
            dark ? 'text-white/80 hover:text-white' : 'text-slate-900'
          }`}
          title={t('toggleUnit')}
          aria-label={t('toggleUnit')}
        >
          °{unit}
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className={`glass-pill hidden h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold sm:flex ${
            dark ? 'text-white/50 hover:text-white' : 'text-slate-800 hover:text-slate-950'
          }`}
          title={t('searchCities')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span>{t('search')}</span>
          <kbd className="kbd opacity-70">/</kbd>
        </button>

        {onLocate && (
          <button
            type="button"
            onClick={onLocate}
            disabled={locating}
            title={t('useMyLocation')}
            aria-label={t('useMyLocation')}
            className={`${pillBtn} w-8 ${locating ? 'opacity-60' : ''}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className={locating ? 'animate-pulse' : ''}
              aria-hidden
            >
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            title={t('shareWeather')}
            aria-label={t('shareWeather')}
            className={`${pillBtn} hidden w-8 sm:flex`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="18" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="6" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="18" cy="19" r="2.5" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M8.5 13.2 15.5 17.2M15.5 6.8 8.5 10.8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}

        {onOpenHelp && (
          <button
            type="button"
            onClick={onOpenHelp}
            title={t('keyboardShortcuts')}
            aria-label={t('keyboardShortcuts')}
            className={`${pillBtn} hidden w-8 md:flex`}
          >
            <span className="text-[12px] font-bold opacity-80">?</span>
          </button>
        )}
      </div>

      <div className="pointer-events-none z-30 flex max-w-[220px] flex-col items-center px-1">
        <h1
          className={`text-center text-[15px] font-bold tracking-tight sm:text-[18px] ${
            dark ? 'text-gradient' : 'text-gradient'
          }`}
        >
          {t('appName')}
        </h1>
        <div
          className={`status-chip mt-1.5 ${mute}`}
          title={
            !online
              ? t('offline')
              : latency != null
                ? `${t('live')} · ${latency} ms`
                : t('live')
          }
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              online ? 'live-dot bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className={dark ? 'text-white/70' : 'text-slate-800'}>
            {online ? t('live') : t('offline')}
          </span>
          {online && latency != null && (
            <>
              <span className="opacity-35">·</span>
              <span className="tabular-nums opacity-80">{latency} ms</span>
            </>
          )}
        </div>
      </div>

      <div className="pointer-events-auto z-50 flex min-w-0 justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={onUserMenu}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            className={`glass-pill flex h-9 items-center gap-2 rounded-full py-0 pl-1 pr-2.5 ${
              dark ? 'ring-1 ring-white/[0.08]' : 'ring-1 ring-slate-200/80'
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 via-indigo-500 to-violet-600 ring-2 ring-white/20 shadow-md shadow-indigo-500/30">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=transparent"
                alt=""
                className="h-7 w-7"
              />
            </span>
            <span
              className={`hidden text-[12px] font-bold sm:inline ${
                dark ? 'text-white/90' : 'text-slate-900'
              }`}
            >
              {t('guest')}
            </span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              className={`shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${mute}`}
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {userMenuOpen && (
            <>
              <button
                type="button"
                className="fixed inset-0 z-[60]"
                onClick={onCloseUserMenu}
                aria-label={t('close')}
              />
              <div
                role="menu"
                className={`modal-enter absolute right-0 top-full z-[70] mt-2 w-52 overflow-hidden rounded-2xl border py-1.5 shadow-2xl ${
                  dark
                    ? 'border-white/12 bg-[#080e1c]/96 text-white/90 backdrop-blur-2xl'
                    : 'border-slate-200/90 bg-white text-slate-700 shadow-slate-300/40'
                }`}
              >
                {placeName && (
                  <div
                    className={`border-b px-3 py-2 ${dark ? 'border-white/8' : 'border-slate-100'}`}
                  >
                    <p className={`text-[10px] ${mute}`}>{t('viewing')}</p>
                    <p
                      className={`mt-0.5 truncate text-[12px] font-medium ${
                        dark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {placeName}
                    </p>
                  </div>
                )}
                {onLocate && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onCloseUserMenu()
                      onLocate()
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] ${
                      dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    {t('useMyLocation')}
                  </button>
                )}
                {onShare && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onCloseUserMenu()
                      onShare()
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] ${
                      dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    {t('shareWeather')}
                  </button>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseUserMenu()
                    onSettings?.()
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] ${
                    dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="opacity-40" aria-hidden>
                    ⚙
                  </span>{' '}
                  {t('settings')}
                </button>
                {onClearData && (
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onCloseUserMenu()
                      onClearData()
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] ${
                      dark
                        ? 'text-rose-300/90 hover:bg-rose-500/10'
                        : 'text-rose-600 hover:bg-rose-50'
                    }`}
                  >
                    {t('clearLocalData')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
