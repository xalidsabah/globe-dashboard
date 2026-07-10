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
          className={`h-10 w-10 rounded-full border-2 ${
            dark
              ? 'border-white/10 border-t-sky-400/70'
              : 'border-slate-300/60 border-t-sky-600/70'
          } animate-spin`}
          aria-hidden
        />
        <p className={`text-[11px] ${dark ? 'text-white/30' : 'text-slate-600/70'}`}>
          Loading globe
        </p>
      </div>
    </div>
  )
}
