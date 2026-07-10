/** Video-style bottom controls: 3D/2D pill, expand chevron, Zoom circles */
export default function BottomControls({
  mode,
  onModeChange,
  onZoomIn,
  onZoomOut,
  onResetView,
  onExpandPanel,
  panelOpen,
  dark = true,
  fullscreen = false,
  onToggleFullscreen,
  sidebarWide = false,
}) {
  const active = dark ? 'bg-white text-[#0a1220] shadow' : 'bg-slate-900 text-white shadow'
  const idle = dark ? 'text-white/55 hover:text-white' : 'text-slate-600 hover:text-slate-900'
  // Equal circular buttons — video zoom cluster
  const round = dark
    ? 'h-8 w-8 border border-white/10 bg-[#0c1424]/75 text-white/70 hover:bg-white/10 hover:text-white'
    : 'h-8 w-8 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm'

  return (
    <>
      {/* Center: 3D/2D + panel handle */}
      <div
        className={`pointer-events-none absolute left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-2.5 transition-all duration-300 ${
          panelOpen && !fullscreen ? 'bottom-[min(46vh,300px)]' : 'bottom-5'
        }`}
      >
        <div className="pointer-events-auto glass-pill flex h-9 items-center gap-0.5 rounded-full p-1">
          <button
            type="button"
            onClick={() => onModeChange('3d')}
            className={`flex h-7 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition ${
              mode === '3d' ? active : idle
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3 3 8v8l9 5 9-5V8l-9-5zM3 8l9 5 9-5M12 13v8"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            3D
          </button>
          <button
            type="button"
            onClick={() => onModeChange('2d')}
            className={`flex h-7 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium transition ${
              mode === '2d' ? active : idle
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 10h18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            2D
          </button>
        </div>

        {!panelOpen && !fullscreen && (
          <button
            type="button"
            onClick={onExpandPanel}
            className={`pointer-events-auto flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-sm transition ${round}`}
            aria-label="Show hourly forecast"
            title="Hourly forecast"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Right: Zoom cluster — video placement */}
      <div
        className={`pointer-events-auto absolute z-30 flex items-center gap-1.5 transition-all duration-300 ${
          panelOpen && !fullscreen ? 'bottom-[min(46vh,300px)]' : 'bottom-5'
        } ${sidebarWide ? 'right-5' : 'right-5'}`}
      >
        <span
          className={`mr-1.5 text-[10px] font-medium uppercase tracking-[0.16em] ${
            dark ? 'text-white/35' : 'text-slate-500'
          }`}
        >
          Zoom
        </span>
        <button type="button" onClick={onZoomIn} title="Zoom in" className={`flex items-center justify-center rounded-full backdrop-blur-md transition ${round}`}>
          +
        </button>
        <button type="button" onClick={onZoomOut} title="Zoom out" className={`flex items-center justify-center rounded-full backdrop-blur-md transition ${round}`}>
          −
        </button>
        <button
          type="button"
          onClick={onResetView}
          title="Reset view"
          className={`flex items-center justify-center rounded-full backdrop-blur-md transition ${round}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {/* Fullscreen — hide panel / full map */}
        <button
          type="button"
          onClick={onToggleFullscreen}
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen map'}
          className={`flex items-center justify-center rounded-full backdrop-blur-md transition ${round} ${
            fullscreen ? (dark ? 'bg-white/15 text-white' : 'bg-slate-900 text-white') : ''
          }`}
        >
          {fullscreen ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
