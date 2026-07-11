import WeatherIcon from './WeatherIcon'
import { formatDay, formatHour } from '../lib/weather'
import { evaluateConditions } from '../lib/risk'
import { useI18n } from '../i18n/index.jsx'

function dispTemp(c, unit) {
  if (c == null) return '—'
  return unit === 'F' ? Math.round((c * 9) / 5 + 32) : Math.round(c)
}

const TABS = [
  { id: 'hourly', labelKey: 'hourly' },
  { id: 'analytics', labelKey: 'sevenDay' },
  { id: 'alerts', labelKey: 'alerts' },
]

function levelLabel(level, t) {
  if (level === 'High') return t('high')
  if (level === 'Medium') return t('medium')
  return t('low')
}

function statusLabel(status, t) {
  if (status === 'Alert') return t('risk_alert')
  if (status === 'Caution') return t('risk_caution')
  if (status === 'No data') return t('risk_noData')
  return t('risk_stable')
}

export default function BottomPanel({
  open,
  onClose,
  weather,
  unit = 'C',
  dark = true,
  place,
  mode = 'hourly',
  onModeChange,
  sidebarWide = false,
  loading = false,
}) {
  const { t } = useI18n()
  const hourly = (weather?.hourly || []).slice(0, 24)
  const daily = weather?.daily || []
  const tz = weather?.timezone
  const c = weather?.current
  const {
    riskScore,
    riskLabel,
    riskStatus,
    factors,
    alerts,
  } = evaluateConditions(weather, place, t)

  const riskTone =
    riskLabel === 'High'
      ? 'text-rose-400 bg-rose-400/10'
      : riskLabel === 'Medium'
        ? 'text-amber-400 bg-amber-400/10'
        : 'text-emerald-400 bg-emerald-400/10'

  const temps = hourly.map((h) => h.temp).filter((x) => x != null)
  const tMin = temps.length ? Math.min(...temps) : 0
  const tMax = temps.length ? Math.max(...temps) : 1
  const span = Math.max(1, tMax - tMin)

  return (
    <div
      className={`bottom-panel absolute inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-4 ${
        open ? 'expanded' : 'collapsed'
      }`}
      style={{ paddingLeft: sidebarWide ? '11.5rem' : '4.25rem' }}
      aria-hidden={!open}
    >
      <div className="glass relative mx-auto max-w-[1400px] overflow-hidden rounded-[1.35rem] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className={`absolute left-1/2 top-2 z-10 flex h-5 w-14 -translate-x-1/2 items-center justify-center ${
            dark ? 'text-white/35 hover:text-white/70' : 'text-slate-400 hover:text-slate-700'
          }`}
          aria-label={t('close')}
        >
          <div
            className={`h-1 w-10 rounded-full transition ${
              dark ? 'bg-white/30 hover:bg-white/50' : 'bg-slate-300 hover:bg-slate-400'
            }`}
          />
        </button>

        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-b px-4 pb-3 pt-7 md:px-5 ${
            dark ? 'border-white/[0.06]' : 'border-slate-200/80'
          }`}
        >
          <div className="min-w-0">
            <h3
              className={`truncate text-sm font-semibold tracking-wide ${
                dark ? 'text-white/95' : 'text-slate-900'
              }`}
            >
              {place?.name || t('selectCity')}
              {place?.country ? (
                <span className={`font-normal ${dark ? 'text-white/40' : 'text-slate-400'}`}>
                  {' '}
                  · {place.country}
                </span>
              ) : null}
            </h3>
            <p className={`mt-0.5 text-[11px] ${dark ? 'text-white/40' : 'text-slate-500'}`}>
              {c ? (
                <>
                  {dispTemp(c.temp, unit)}°{unit} · {c.label}
                  {loading ? ` · ${t('updatingEllipsis')}` : ''}
                </>
              ) : loading ? (
                t('loadingWeather')
              ) : (
                t('clickPin')
              )}
            </p>
          </div>

          <div
            className={`flex items-center gap-0.5 rounded-full p-0.5 ${
              dark ? 'bg-white/5' : 'bg-slate-100'
            }`}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onModeChange?.(tab.id)}
                className={`panel-tab ${mode === tab.id ? 'active' : dark ? 'text-white/45 hover:text-white/80' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid max-h-[min(42vh,300px)] grid-cols-1 gap-4 overflow-y-auto panel-scroll p-4 md:grid-cols-12 md:p-5">
          <div className="md:col-span-8">
            {/* Loading skeleton */}
            {loading && !weather && (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton h-9 w-full" />
                ))}
              </div>
            )}

            {/* HOURLY */}
            {mode === 'hourly' && (
              <>
                {/* Mini chart strip */}
                {hourly.length > 0 && (
                  <div
                    className={`mb-3 flex h-16 items-end gap-0.5 rounded-xl border px-2 pb-1.5 pt-2 ${
                      dark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/80'
                    }`}
                  >
                    {hourly.slice(0, 18).map((h) => {
                      const hgt = 20 + ((h.temp - tMin) / span) * 70
                      return (
                        <div
                          key={h.time}
                          className="group relative flex flex-1 flex-col items-center justify-end"
                          title={`${formatHour(h.time, tz)}: ${dispTemp(h.temp, unit)}°`}
                        >
                          <span className="pointer-events-none absolute -top-4 hidden rounded bg-black/80 px-1 text-[8px] text-white group-hover:block">
                            {dispTemp(h.temp, unit)}°
                          </span>
                          <div
                            className={`hour-bar w-full max-w-[10px] rounded-t-sm ${
                              (h.precipProb || 0) > 50
                                ? 'bg-sky-400/70'
                                : dark
                                  ? 'bg-gradient-to-t from-sky-600/40 to-sky-300/80'
                                  : 'bg-gradient-to-t from-sky-500/50 to-sky-400'
                            }`}
                            style={{ height: `${hgt}%` }}
                          />
                        </div>
                      )
                    })}
                  </div>
                )}

                <div
                  className={`panel-scroll max-h-[180px] overflow-auto rounded-xl border ${
                    dark ? 'border-white/5' : 'border-slate-200'
                  }`}
                >
                  <table className="w-full text-left text-xs">
                    <thead
                      className={`sticky top-0 z-[1] text-[10px] ${
                        dark ? 'bg-[#0a1220]/95 text-white/35' : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      <tr>
                        <th className="px-3 py-2 font-medium">{t('time')}</th>
                        <th className="px-3 py-2 font-medium">{t('condition')}</th>
                        <th className="px-3 py-2 font-medium">{t('temp')}</th>
                        <th className="px-3 py-2 font-medium">{t('feels')}</th>
                        <th className="px-3 py-2 font-medium">{t('rain')}</th>
                        <th className="px-3 py-2 font-medium">{t('wind')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!hourly.length && !loading && (
                        <tr>
                          <td
                            colSpan={6}
                            className={`px-3 py-8 text-center ${dark ? 'text-white/40' : 'text-slate-500'}`}
                          >
                            {t('noHourly')}
                          </td>
                        </tr>
                      )}
                      {hourly.map((h) => (
                        <tr
                          key={h.time}
                          className={`activity-row border-t ${
                            dark ? 'border-white/5 text-white/75' : 'border-slate-100 text-slate-600'
                          }`}
                        >
                          <td
                            className={`px-3 py-2 font-medium tabular-nums ${
                              dark ? 'text-white/90' : 'text-slate-800'
                            }`}
                          >
                            {formatHour(h.time, tz)}
                          </td>
                          <td className="px-3 py-2">
                            <span className="inline-flex items-center gap-1.5">
                              <span className={dark ? 'text-sky-300' : 'text-sky-500'}>
                                <WeatherIcon icon={h.icon} size={14} isDay={h.isDay} />
                              </span>
                              <span className="max-w-[120px] truncate">{h.label}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2 font-semibold tabular-nums">{dispTemp(h.temp, unit)}°</td>
                          <td className="px-3 py-2 tabular-nums opacity-60">{dispTemp(h.feels, unit)}°</td>
                          <td
                            className={`px-3 py-2 tabular-nums ${
                              (h.precipProb || 0) > 40
                                ? dark
                                  ? 'text-sky-300'
                                  : 'text-sky-600'
                                : ''
                            }`}
                          >
                            {h.precipProb != null ? `${Math.round(h.precipProb)}%` : '—'}
                          </td>
                          <td className="px-3 py-2 tabular-nums opacity-60">
                            {h.wind != null ? `${Math.round(h.wind)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* 7-DAY */}
            {mode === 'analytics' && (
              <div className={`overflow-hidden rounded-xl border ${dark ? 'border-white/5' : 'border-slate-200'}`}>
                {daily.map((d, i) => (
                  <div
                    key={d.date}
                    className={`flex items-center gap-2 px-3 py-2.5 text-xs ${
                      i > 0 ? (dark ? 'border-t border-white/5' : 'border-t border-slate-100') : ''
                    }`}
                  >
                    <span className={`w-[96px] font-medium ${dark ? 'text-white/90' : 'text-slate-800'}`}>
                      {i === 0 ? t('today') : formatDay(d.date, tz)}
                    </span>
                    <span className={dark ? 'text-sky-300' : 'text-sky-500'}>
                      <WeatherIcon icon={d.icon} size={16} />
                    </span>
                    <span className={`min-w-0 flex-1 truncate ${dark ? 'text-white/50' : 'text-slate-500'}`}>
                      {d.label}
                    </span>
                    {/* temp range bar */}
                    <div className="hidden w-20 items-center sm:flex">
                      <div className={`h-1.5 w-full overflow-hidden rounded-full ${dark ? 'bg-white/10' : 'bg-slate-200'}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                          style={{
                            width: `${Math.min(100, Math.max(20, ((d.tMax ?? 0) + 10) * 2))}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="w-10 text-right font-semibold tabular-nums">{dispTemp(d.tMax, unit)}°</span>
                    <span className="w-10 text-right tabular-nums opacity-40">{dispTemp(d.tMin, unit)}°</span>
                  </div>
                ))}
                {!daily.length && !loading && (
                  <p className={`px-3 py-8 text-center text-xs ${dark ? 'text-white/40' : 'text-slate-500'}`}>
                    {t('noDaily')}
                  </p>
                )}
              </div>
            )}

            {/* ALERTS — derived from hourly/daily Open-Meteo signals */}
            {mode === 'alerts' && (
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className={`flex gap-3 rounded-xl border px-3 py-2.5 ${
                      dark ? 'border-white/5 bg-white/[0.03]' : 'border-slate-200 bg-white/70'
                    }`}
                  >
                    <span
                      className={`mt-0.5 h-fit shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        a.level === 'High'
                          ? 'bg-rose-400/15 text-rose-400'
                          : a.level === 'Medium'
                            ? 'bg-amber-400/15 text-amber-400'
                            : 'bg-emerald-400/15 text-emerald-400'
                      }`}
                    >
                      {levelLabel(a.level, t)}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium ${dark ? 'text-white/90' : 'text-slate-800'}`}>
                        {a.title}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] leading-relaxed ${
                          dark ? 'text-white/40' : 'text-slate-500'
                        }`}
                      >
                        {a.detail}
                      </p>
                    </div>
                  </div>
                ))}
                <p className={`px-1 pt-1 text-[10px] ${dark ? 'text-white/25' : 'text-slate-400'}`}>
                  {t('derivedNote')}
                </p>
              </div>
            )}
          </div>

          {/* Risk card */}
          <div className="md:col-span-4">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className={`text-sm font-medium ${dark ? 'text-white/90' : 'text-slate-800'}`}>
                {t('riskOverview')}
              </h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${riskTone}`}>
                {statusLabel(riskStatus, t)}
              </span>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                dark ? 'border-white/5 bg-white/[0.03]' : 'border-slate-200 bg-white/70'
              }`}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-[10px] ${dark ? 'text-white/30' : 'text-slate-400'}`}>
                    {t('score')}
                  </p>
                  <p className={`mt-0.5 text-3xl font-semibold tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
                    {riskScore}
                    <span className={`text-base font-normal ${dark ? 'text-white/35' : 'text-slate-400'}`}>
                      /100
                    </span>
                  </p>
                </div>
                <div className="relative h-14 w-14">
                  <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke={dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
                      strokeWidth="3"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke={
                        riskLabel === 'High' ? '#fb7185' : riskLabel === 'Medium' ? '#fbbf24' : '#34d399'
                      }
                      strokeWidth="3"
                      strokeDasharray={`${riskScore} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div
                    className={`absolute inset-0 flex items-center justify-center text-[10px] font-medium ${
                      riskLabel === 'High'
                        ? 'text-rose-400'
                        : riskLabel === 'Medium'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                    }`}
                  >
                    {levelLabel(riskLabel, t)}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  { label: t('precip'), value: factors.precip, color: 'bg-sky-400' },
                  { label: t('wind'), value: factors.wind, color: 'bg-violet-400' },
                  { label: t('uv'), value: factors.uv, color: 'bg-amber-400' },
                  ...(factors.extreme > 0
                    ? [{ label: t('extreme'), value: factors.extreme, color: 'bg-rose-400' }]
                    : []),
                ].map((row) => (
                  <div key={row.label}>
                    <div className="mb-0.5 flex justify-between text-[10px]">
                      <span className={dark ? 'text-white/40' : 'text-slate-500'}>{row.label}</span>
                      <span className={`tabular-nums ${dark ? 'text-white/55' : 'text-slate-600'}`}>
                        {row.value}%
                      </span>
                    </div>
                    <div
                      className={`h-1 overflow-hidden rounded-full ${
                        dark ? 'bg-white/10' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${row.color}`}
                        style={{ width: `${row.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className={`mt-3 text-[10px] leading-relaxed ${dark ? 'text-white/30' : 'text-slate-400'}`}>
                Open-Meteo · {tz || 'local'} · {t('advisoryOnly')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
