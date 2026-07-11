/** Navigation rail — icons map to real actions */
import { useI18n } from '../i18n/index.jsx'

const icons = [
  {
    id: 'home',
    labelKey: 'global',
    path: 'M4 10.5 12 3l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z',
  },
  {
    id: 'search',
    labelKey: 'search',
    path: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-3.5-3.5',
  },
  {
    id: 'forecast',
    labelKey: 'hourly',
    path: 'M12 4 3 9l9 5 9-5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  },
  {
    id: 'chart',
    labelKey: 'sevenDay',
    path: 'M4 19V5M4 19h16M8 15v-4M12 15V8M16 15v-7',
  },
  {
    id: 'alerts',
    labelKey: 'alerts',
    path: 'M7 15h9a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.4A3 3 0 0 0 7 15zM11 14l-1.5 3h2.2L10.5 21l4-5h-2.2L14 14',
  },
]

export default function Sidebar({
  activeNav = 'home',
  onNav,
  dark = true,
  onSettings,
  onClearData,
  expanded = false,
  onToggleExpand,
  hidden = false,
}) {
  const { t } = useI18n()
  if (hidden) return null

  const width = expanded ? 'w-[168px]' : 'w-14'

  return (
    <aside
      className={`absolute left-0 top-0 bottom-0 z-20 flex ${width} flex-col border-r py-3.5 transition-[width] duration-300 ease-out ${
        dark
          ? 'border-white/[0.07] bg-[#040810]/70 backdrop-blur-2xl'
          : 'border-slate-400/35 bg-white/90 backdrop-blur-2xl shadow-sm'
      }`}
      aria-label={t('menu')}
    >
      <div className={`mb-6 flex items-center ${expanded ? 'px-3' : 'justify-center'}`}>
        <button
          type="button"
          onClick={onToggleExpand}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl shadow-lg transition hover:scale-105 active:scale-95 ${
            dark
              ? 'bg-gradient-to-br from-white to-slate-200 text-[#030712] shadow-black/40'
              : 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-slate-400/40'
          }`}
          title={expanded ? t('close') : t('menu')}
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
          <p
            className={`ml-2.5 truncate text-[12px] font-semibold ${
              dark ? 'text-white/70' : 'text-slate-900'
            }`}
          >
            {t('weather')}{' '}
            <span className={dark ? 'text-white/30' : 'text-slate-600'}>{t('globe')}</span>
          </p>
        )}
      </div>

      <nav className={`flex flex-1 flex-col gap-1 ${expanded ? 'px-2' : 'items-center'}`}>
        {icons.map((icon) => {
          const active = activeNav === icon.id
          const label = t(icon.labelKey)
          return (
            <button
              key={icon.id}
              type="button"
              onClick={() => onNav?.(icon.id)}
              title={label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex h-10 items-center rounded-2xl transition-all ${
                expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
              } ${
                active
                  ? dark
                    ? 'bg-gradient-to-r from-sky-500/25 to-violet-500/15 text-white shadow-[inset_0_0_0_1px_rgba(56,189,248,0.22)]'
                    : 'bg-slate-900 text-white shadow-md'
                  : dark
                    ? 'text-white/45 hover:bg-white/[0.06] hover:text-white'
                    : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
              }`}
            >
              {active && (
                <span
                  className={`nav-active-dot absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full ${
                    dark ? 'bg-sky-400' : 'bg-sky-300'
                  }`}
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
                <span className="truncate text-[12px] font-medium tracking-wide">{label}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className={`mt-auto flex flex-col gap-1 pb-1 ${expanded ? 'px-2' : 'items-center'}`}>
        <button
          type="button"
          onClick={onSettings}
          title={t('settings')}
          className={`flex h-10 items-center rounded-xl transition ${
            expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
          } ${
            dark
              ? 'text-white/40 hover:bg-white/5 hover:text-white/90'
              : 'text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
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
          {expanded && <span className="text-[12px] font-medium">{t('settings')}</span>}
        </button>
        {onClearData && (
          <button
            type="button"
            onClick={onClearData}
            title={t('clearLocalData')}
            className={`flex h-10 items-center rounded-xl transition ${
              expanded ? 'w-full gap-3 px-2.5' : 'w-10 justify-center'
            } ${
              dark
                ? 'text-white/40 hover:bg-rose-500/10 hover:text-rose-300'
                : 'text-slate-700 hover:bg-rose-50 hover:text-rose-700'
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
                d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {expanded && <span className="text-[12px] font-medium">{t('clearData')}</span>}
          </button>
        )}
      </div>
    </aside>
  )
}
