/** Outline icons matching video placement — each maps to a real action */
const icons = [
  {
    id: 'home',
    label: 'Global',
    // home outline
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
    // layers
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
    // storm/cloud bolt
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
          ? 'border-white/5 bg-[#060b16]/80'
          : 'border-slate-300/50 bg-slate-100/95'
      }`}
    >
      {/* Top white collapse/expand control — video style */}
      <div className={`mb-6 flex ${expanded ? 'px-3' : 'justify-center'}`}>
        <button
          type="button"
          onClick={onToggleExpand}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#0a1220] shadow-[0_4px_14px_rgba(0,0,0,0.28)] transition hover:scale-105"
          title={expanded ? 'Icons only' : 'Show labels'}
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
          <span
            className={`ml-2.5 self-center text-[12px] font-medium tracking-wide ${
              dark ? 'text-white/80' : 'text-slate-700'
            }`}
          >
            Menu
          </span>
        )}
      </div>

      <nav className={`flex flex-1 flex-col gap-0.5 ${expanded ? 'px-2' : 'items-center'}`}>
        {icons.map((icon) => {
          const active = activeNav === icon.id
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onNav?.(icon.id)}
              title={icon.label}
              className={`flex h-10 items-center rounded-xl transition-all ${
                expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
              } ${
                active
                  ? dark
                    ? 'bg-white/10 text-white'
                    : 'bg-slate-900 text-white'
                  : dark
                    ? 'text-white/40 hover:bg-white/5 hover:text-white/85'
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

      <div className={`mt-auto flex flex-col gap-0.5 pb-1 ${expanded ? 'px-2' : 'items-center'}`}>
        <button
          type="button"
          onClick={onSettings}
          title="Settings"
          className={`flex h-10 items-center rounded-xl transition ${
            expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
          } ${
            dark
              ? 'text-white/40 hover:bg-white/5 hover:text-white/85'
              : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-800'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className="shrink-0">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" className="shrink-0">
            <path d="M9 7V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1v-2" strokeLinecap="round" />
            <path d="M3 12h11M10 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {expanded && <span className="text-[12px] font-medium">Log out</span>}
        </button>
      </div>
    </aside>
  )
}
