import { useI18n } from '../i18n/index.jsx'

const ROWS = [
  { keys: ['/'], labelKey: 'sc_search' },
  { keys: ['H'], labelKey: 'sc_hourly' },
  { keys: ['D'], labelKey: 'sc_7day' },
  { keys: ['F'], labelKey: 'sc_fullscreen' },
  { keys: ['L'], labelKey: 'sc_locate' },
  { keys: ['S'], labelKey: 'sc_share' },
  { keys: ['?'], labelKey: 'sc_help' },
  { keys: ['Esc'], labelKey: 'sc_esc' },
]

export default function ShortcutsHelp({ open, onClose, dark = true }) {
  const { t } = useI18n()
  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-[85] flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-label={t('keyboardShortcuts')}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
        aria-label={t('close')}
      />
      <div
        className={`modal-enter relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl ${
          dark
            ? 'border border-white/10 bg-[#0a1220]/95 backdrop-blur-2xl'
            : 'border border-slate-200 bg-white/96'
        }`}
      >
        <div className={`flex items-center justify-between border-b px-5 py-4 ${dark ? 'border-white/8' : 'border-slate-100'}`}>
          <div>
            <p className={`text-[10px] ${dark ? 'text-white/30' : 'text-slate-400'}`}>{t('reference')}</p>
            <h2 className={`text-lg font-medium ${dark ? 'text-white' : 'text-slate-900'}`}>
              {t('shortcuts')}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              dark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-slate-100 text-slate-500'
            }`}
          >
            ✕
          </button>
        </div>
        <ul className="space-y-1 px-4 py-3">
          {ROWS.map((row) => (
            <li
              key={row.labelKey}
              className={`flex items-center justify-between rounded-xl px-2 py-2 ${
                dark ? 'hover:bg-white/[0.03]' : 'hover:bg-slate-50'
              }`}
            >
              <span className={`text-[13px] ${dark ? 'text-white/80' : 'text-slate-700'}`}>
                {t(row.labelKey)}
              </span>
              <span className="flex gap-1">
                {row.keys.map((k) => (
                  <kbd key={k} className="kbd min-w-[1.5rem] text-[10px]">
                    {k}
                  </kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <p className={`border-t px-5 py-3 text-[11px] ${dark ? 'border-white/6 text-white/30' : 'border-slate-100 text-slate-400'}`}>
          {t('shortcutsFoot')}
        </p>
      </div>
    </div>
  )
}
