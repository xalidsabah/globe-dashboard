/** Top bar — compact, quiet chrome */

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
  const mute = dark ? 'text-white/40' : 'text-slate-500'

  return (
    <header
      className={`pointer-events-none absolute inset-x-0 top-0 z-40 grid grid-cols-[1fr_auto_1fr] items-start gap-2 pr-3 pt-3 sm:pr-4 sm:pt-3.5 transition-all duration-300 ${
        sidebarWide ? 'pl-[11.5rem]' : 'pl-[4.25rem]'
      }`}
    >
      <div className="pointer-events-auto z-40 flex h-8 min-w-0 items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleTheme}
          className="glass-pill relative flex h-7 w-12 shrink-0 items-center rounded-full px-0.5"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={dark ? 'Light mode' : 'Dark mode'}
        >
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full shadow transition-transform duration-300 ${
              dark
                ? 'translate-x-0.5 bg-white text-[#0a1220]'
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
          className={`glass-pill flex h-7 shrink-0 items-center rounded-full px-2.5 text-[11px] tabular-nums ${
            dark ? 'text-white/70 hover:text-white' : 'text-slate-600'
          }`}
          title="Toggle °C / °F"
          aria-label={`Temperature unit °${unit}. Click to switch.`}
        >
          °{unit}
        </button>

        <button
          type="button"
          onClick={onOpenSearch}
          className={`glass-pill hidden h-7 shrink-0 items-center gap-1 rounded-full px-2.5 text-[11px] sm:flex ${
            dark ? 'text-white/45 hover:text-white/85' : 'text-slate-500 hover:text-slate-800'
          }`}
          title="Search cities (/)"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <span>Search</span>
          <kbd className="kbd opacity-60">/</kbd>
        </button>
      </div>

      <div className="pointer-events-none z-30 flex max-w-[200px] flex-col items-center px-1">
        <h1
          className={`text-center text-[15px] font-medium tracking-tight sm:text-[17px] ${
            dark ? 'text-white/80' : 'text-slate-700'
          }`}
        >
          Global View
        </h1>
        <div
          className={`mt-1 flex items-center gap-1.5 text-[10px] ${mute}`}
          title={latency != null ? `Live · ${latency} ms` : 'Live'}
        >
          <span className="live-dot h-1 w-1 shrink-0 rounded-full bg-emerald-400/90" />
          <span>Live</span>
          {latency != null && (
            <>
              <span className="opacity-40">·</span>
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
            className={`glass-pill flex h-8 items-center gap-1.5 rounded-full py-0 pl-0.5 pr-2 ${
              dark ? 'ring-1 ring-white/[0.06]' : 'ring-1 ring-slate-200/70'
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-400/90 to-indigo-500/90 ring-1 ring-white/80">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&backgroundColor=transparent"
                alt=""
                className="h-6 w-6"
              />
            </span>
            <span
              className={`hidden text-[12px] font-medium sm:inline ${
                dark ? 'text-white/85' : 'text-slate-700'
              }`}
            >
              Kai
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
                aria-label="Close menu"
              />
              <div
                role="menu"
                className={`modal-enter absolute right-0 top-full z-[70] mt-1.5 w-48 overflow-hidden rounded-xl border py-1 shadow-xl ${
                  dark
                    ? 'border-white/10 bg-[#0c1424]/98 text-white/90 backdrop-blur-xl'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {placeName && (
                  <div
                    className={`border-b px-3 py-2 ${dark ? 'border-white/8' : 'border-slate-100'}`}
                  >
                    <p className={`text-[10px] ${mute}`}>Viewing</p>
                    <p
                      className={`mt-0.5 truncate text-[12px] font-medium ${
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
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] ${
                    dark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="opacity-40" aria-hidden>
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
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] ${
                    dark
                      ? 'text-rose-300/90 hover:bg-rose-500/10'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  <span className="opacity-60" aria-hidden>
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
