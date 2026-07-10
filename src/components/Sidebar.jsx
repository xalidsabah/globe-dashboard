/** Navigation rail — icons map to real actions */

const icons = [
  {
    id: 'home',
    label: 'Global',
    path: 'M4 10.5 12 3l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z',
  },
  {
    id: 'search',
    label: 'Search',
    path: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-3.5-3.5',
  },
  {
    id: 'forecast',
    label: 'Hourly',
    path: 'M12 4 3 9l9 5 9-5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  },
  {
    id: 'chart',
    label: '7-Day',
    path: 'M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-7',
  },
  {
    id: 'alerts',
    label: 'Alerts',
    path: 'M7 15h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.4A3 3 0 0 0 7 15zM11 14l-1.5 3h2.2L10.5 21l4-5h-2.2L14 14',
  },
]

export default function Sidebar({
  activeNav = 'home',
  onNav,
  dark = true,
  onSettings,
  onLogout,
  expanded = false,
  onToggleExpand,
  hidden = false,
}) {
  if (hidden) return null

  const width = expanded ? 'w-[168px]' : 'w-14'

  return (
    <aside
      className={`absolute left-0 top-0 bottom-0 z-20 flex ${width} flex-col border-r py-3 transition-[width] duration-300 ease-out ${
        dark
          ? 'border-white/[0.06] bg-[#060b16]/75 backdrop-blur-xl'
          : 'border-slate-300/40 bg-white/80 backdrop-blur-xl'
      }`}
      aria-label="Main navigation"
    >
      <div className={`mb-5 flex items-center ${expanded ? 'px-3' : 'justify-center'}`}>
        <button
          type="button"
          onClick={onToggleExpand}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-lg transition hover:scale-105 ${
            dark
              ? 'bg-white text-[#0a1220] shadow-black/30'
              : 'bg-slate-900 text-white shadow-slate-400/40'
          }`}
          title={expanded ? 'Collapse menu' : 'Expand menu'}
          aria-expanded={expanded}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          >
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {expanded && (
          <div className="ml-2.5 min-w-0">
            <p
              className={`truncate text-[12px] font-semibold tracking-wide ${
                dark ? 'text-white/90' : 'text-slate-800'
              }`}
            >
              Weather
            </p>
            <p className={`text-[10px] ${dark ? 'text-white/35' : 'text-slate-400'}`}>Globe</p>
          </div>
        )}
      </div>

      <nav className={`flex flex-1 flex-col gap-1 ${expanded ? 'px-2' : 'items-center'}`}>
        {icons.map((icon) => {
          const active = activeNav === icon.id
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onNav?.(icon.id)}
              title={icon.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-10 items-center rounded-xl transition-all ${
                expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
              } ${
                active
                  ? dark
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 text-white shadow-[inset_0_0_0_1px_rgba(56,189,248,0.15)]'
                    : 'bg-slate-900 text-white shadow-md'
                  : dark
                    ? 'text-white/40 hover:bg-white/5 hover:text-white/90'
                    : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'
              }`}
            >
              {active && (
                <span
                  className={`nav-active-dot absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full ${
                    expanded ? '' : ''
                  } ${dark ? 'bg-sky-400' : 'bg-sky-300'}`}
                  aria-hidden
                />
              )}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <path d={icon.path} />
              </svg>
              {expanded && (
                <span className="truncate text-[12px] font-medium tracking-wide">{icon.label}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className={`mt-auto flex flex-col gap-1 pb-1 ${expanded ? 'px-2' : 'items-center'}`}>
        <button
          type="button"
          onClick={onSettings}
          title="Settings"
          className={`flex h-10 items-center rounded-xl transition ${
            expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
          } ${
            dark
              ? 'text-white/40 hover:bg-white/5 hover:text-white/90'
              : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            className="shrink-0"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
              strokeLinecap="round"
            />
          </svg>
          {expanded && <span className="text-[12px] font-medium">Settings</span>}
        </button>
        <button
          type="button"
          onClick={onLogout}
          title="Log out"
          className={`flex h-10 items-center rounded-xl transition ${
            expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
          } ${
            dark
              ? 'text-white/40 hover:bg-rose-500/10 hover:text-rose-300'
              : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            className="shrink-0"
          >
            <path
              d="M9 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-2"
              strokeLinecap="round"
            />
            <path d="M3 12h11M10 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {expanded && <span className="text-[12px] font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
