/** Top bar — theme, units, search, live status, account */

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
      className={`pointer-events-none absolute inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-start gap-2 pr-3 pt-3 sm:gap-3 sm:pr-4 sm:pt-4 transition-all duration-300 ${
        sidebarWide ? 'pl-[11.5rem]' : 'pl-[4.25rem]'
      }`}
    >
      {/* LEFT */}
      <div className="pointer-events-auto z-40 flex h-9 min-w-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className="glass-pill relative flex h-8 w-14 shrink-0 items-center rounded-full px-1"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-transform duration-300 ${
              dark
                ? 'translate-x-0 bg-white text-[#0a1220]'
                : 'translate-x-6 bg-slate-900 text-amber-300'
            }`}
          >
            {dark ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="12" cy="12" r="4" />
                <path
                  d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6 19 19M19 5l-1.4 1.4M6.4 17.6 5 19"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleUnit}
          className={`glass-pill flex h-8 shrink-0 items-center rounded-full px-3 text-[11px] font-semibold tabular-nums ${
            dark ? 'text-white/85 hover:text-white' : 'text-slate-700'
          }`}
          title="Toggle °C / °F"
          aria-label={`Temperature unit °${unit}. Click to switch.`}
        >
          °{unit}
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className={`glass-pill hidden h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[11px] font-medium sm:flex ${
            dark ? 'text-white/60 hover:text-white/95' : 'text-slate-600 hover:text-slate-900'
          }`}
          title="Search cities (/)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span className="hidden md:inline">Search</span>
          <kbd className="kbd">/</kbd>
        </button>
      </div>

      {/* CENTER */}
      <div className="pointer-events-none z-30 flex max-w-[240px] flex-col items-center px-1 sm:px-2">
        <h1
          className={`text-center text-[18px] font-semibold tracking-tight sm:text-[22px] ${
            dark ? 'text-white/95' : 'text-slate-800'
          }`}
        >
          Global View
        </h1>
        <div
          className={`mt-1.5 flex h-5 max-w-full items-center gap-1.5 rounded-full border px-2.5 text-[10px] font-medium tracking-[0.08em] backdrop-blur-md ${
            dark
              ? 'border-white/12 bg-black/50 text-white/65'
              : 'border-slate-300/80 bg-white/90 text-slate-600 shadow-sm'
          }`}
        >
          <span className="live-dot h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          <span className="uppercase">Live</span>
          {latency != null && (
            <>
              <span className="opacity-30">·</span>
              <span className="tabular-nums tracking-normal opacity-90">{latency} ms</span>
            </>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="pointer-events-auto z-50 flex min-w-0 justify-end">
        <div className="relative">
          <button
            type="button"
            onClick={onUserMenu}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            className={`glass-pill flex h-9 items-center gap-2 rounded-full py-0 pl-1 pr-2.5 shadow-lg sm:pr-3 ${
              dark ? 'ring-1 ring-white/10' : 'ring-1 ring-slate-200/80'
            }`}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 shadow-sm ring-2 ring-white/90">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=transparent"
                alt=""
                className="h-7 w-7"
              />
            </span>
            <span
              className={`hidden max-w-[100px] truncate text-sm font-medium tracking-wide xs:inline sm:inline ${
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
                aria-label="Close menu"
              />
              <div
                role="menu"
                className={`modal-enter absolute right-0 top-full z-[70] mt-2 w-56 overflow-hidden rounded-2xl border py-1.5 shadow-2xl ${
                  dark
                    ? 'border-white/10 bg-[#0c1424]/98 text-white/90 backdrop-blur-xl'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {placeName && (
                  <div
                    className={`border-b px-3.5 py-2.5 ${dark ? 'border-white/8' : 'border-slate-100'}`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-wider ${
                        dark ? 'text-white/35' : 'text-slate-400'
                      }`}
                    >
                      Viewing
                    </p>
                    <p
                      className={`mt-0.5 truncate text-xs font-semibold ${
                        dark ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {placeName}
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseUserMenu()
                    onSettings?.()
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium ${
                    dark ? 'hover:bg-white/6' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="opacity-50" aria-hidden>
                    ⚙
                  </span>{' '}
                  Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onCloseUserMenu()
                    onLogout?.()
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-xs font-medium ${
                    dark
                      ? 'text-rose-300 hover:bg-rose-500/10'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <span className="opacity-70" aria-hidden>
                    ⎋
                  </span>{' '}
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
