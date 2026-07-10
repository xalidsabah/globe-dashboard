/** Top bar — safe zones so center title never sits under account chip */
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
  onLogout,
  onOpenSearch,
  sidebarWide = false,
}) {
  return (
    <header
      className={`pointer-events-none absolute inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-start gap-3 pr-4 pt-4 transition-all duration-300 ${
        sidebarWide ? 'pl-[11.5rem]' : 'pl-[4.25rem]'
      }`}
    >
      {/* LEFT */}
      <div className="pointer-events-auto z-40 flex h-9 min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className="glass-pill relative flex h-8 w-14 shrink-0 items-center rounded-full px-1"
          aria-label="Toggle theme"
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full shadow transition-transform duration-300 ${
              dark
                ? 'translate-x-0 bg-white text-[#0a1220]'
                : 'translate-x-6 bg-slate-900 text-amber-300'
            }`}
          >
            {dark ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="4" />
              </svg>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleUnit}
          className={`glass-pill flex h-8 shrink-0 items-center rounded-full px-3 text-[11px] font-medium tabular-nums ${
            dark ? 'text-white/80' : 'text-slate-700'
          }`}
          title="Toggle °C / °F"
        >
          °{unit}
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className={`glass-pill hidden h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium md:flex ${
            dark ? 'text-white/60 hover:text-white/90' : 'text-slate-600'
          }`}
          title="Search cities (/)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Search
          <kbd className="kbd">/</kbd>
        </button>
      </div>

      {/* CENTER — own column, never under account */}
      <div className="pointer-events-none z-30 flex max-w-[220px] flex-col items-center px-2">
        <h1
          className={`text-center text-[20px] tracking-[0.02em] sm:text-[22px] ${
            dark ? 'text-white/95' : 'text-slate-800'
          }`}
          style={{ fontWeight: 450 }}
        >
          Global View
        </h1>
        <div
          className={`mt-1.5 flex h-5 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-normal tracking-[0.1em] backdrop-blur-md ${
            dark
              ? 'border-white/12 bg-black/45 text-white/60'
              : 'border-slate-300/80 bg-white/90 text-slate-600 shadow-sm'
          }`}
        >
          <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span className="uppercase">Live</span>
          {latency != null && (
            <>
              <span className="opacity-30">·</span>
              <span className="tabular-nums tracking-normal opacity-80">{latency} ms</span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT — highest z so nothing covers account */}
      <div className="pointer-events-auto z-50 flex min-w-0 justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={onUserMenu}
            className={`glass-pill flex h-9 items-center gap-2 rounded-full py-0 pl-1 pr-3 shadow-lg ${
              dark ? 'ring-1 ring-white/10' : 'ring-1 ring-slate-200/80'
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-2 ring-white">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=ffffff"
                alt="Kai"
                className="h-7 w-7"
              />
            </span>
            <span
              className={`max-w-[100px] truncate text-sm font-medium tracking-wide ${
                dark ? 'text-white' : 'text-slate-800'
              }`}
            >
              Kai
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              className={`shrink-0 transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${
                dark ? 'text-white/45' : 'text-slate-400'
              }`}
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
                aria-label="Close menu"
              />
              <div
                className={`absolute right-0 top-full z-[70] mt-2 w-52 overflow-hidden rounded-2xl border py-1.5 shadow-2xl ${
                  dark
                    ? 'border-white/10 bg-[#0c1424]/98 text-white/90 backdrop-blur-xl'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {placeName && (
                  <div
                    className={`border-b px-3.5 py-2.5 ${
                      dark ? 'border-white/8' : 'border-slate-100'
                    }`}
                  >
                    <p className={`text-[10px] uppercase tracking-wider ${dark ? 'text-white/35' : 'text-slate-400'}`}>
                      Viewing
                    </p>
                    <p className={`mt-0.5 truncate text-xs font-medium ${dark ? 'text-white' : 'text-slate-800'}`}>
                      {placeName}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onCloseUserMenu()
                    onSettings?.()
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs ${
                    dark ? 'hover:bg-white/6' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="opacity-50">⚙</span> Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCloseUserMenu()
                    onLogout?.()
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs ${
                    dark ? 'text-rose-300 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <span className="opacity-70">⎋</span> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
