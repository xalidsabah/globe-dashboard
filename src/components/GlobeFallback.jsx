/** Quiet stage placeholder while the 3D chunk loads */

export default function GlobeFallback({ dark = true }) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ background: dark ? '#050a14' : '#7fa8cc' }}
      role="status"
      aria-live="polite"
      aria-label="Loading globe"
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative h-14 w-14"
          aria-hidden
        >
          <div
            className={`absolute inset-0 rounded-full border ${
              dark ? 'border-white/8' : 'border-white/40'
            }`}
          />
          <div
            className={`absolute inset-0 rounded-full border-2 border-transparent ${
              dark ? 'border-t-sky-400/60' : 'border-t-sky-700/50'
            } animate-spin`}
          />
        </div>
        <p className={`text-[11px] tracking-wide ${dark ? 'text-white/28' : 'text-slate-600/75'}`}>
          Loading globe
        </p>
      </div>
    </div>
  )
}
