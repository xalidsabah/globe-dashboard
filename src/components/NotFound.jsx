/** 404 — lost off the globe */
import { useI18n } from '../i18n/index.jsx'

export default function NotFound() {
  const { t } = useI18n()
  const path =
    typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''

  return (
    <div className="app-shell relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="app-aurora" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 40%, rgba(56,189,248,0.12), transparent 60%)',
        }}
      />

      <main className="relative z-10 mx-4 w-full max-w-md fade-in">
        <div className="panel-float px-8 py-10 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400/80">
            {t('notFoundCode')}
          </p>
          <h1 className="text-display mt-3 text-[2.75rem] text-gradient sm:text-[3.25rem]">
            {t('notFoundTitle')}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-white/50">
            {t('notFoundBody')}
          </p>
          {path && path !== '/' && (
            <p
              className="mt-3 truncate rounded-full bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/35"
              title={path}
            >
              {path}
            </p>
          )}

          <div className="mt-8 flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
            <a
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-[13px] font-bold text-[#030712] shadow-lg shadow-white/10 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              {t('notFoundHome')}
            </a>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="glass-pill inline-flex h-11 items-center justify-center rounded-full px-6 text-[13px] font-semibold text-white/70 hover:text-white"
            >
              {t('notFoundBack')}
            </button>
          </div>

          <p className="mt-8 text-[11px] font-medium text-white/25">{t('appName')}</p>
        </div>
      </main>
    </div>
  )
}
