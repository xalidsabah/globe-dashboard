/** Compact star toggle used in search + live city card */

function StarIcon({ filled, size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3.2 14.6 9l6.2.5-4.7 4 1.4 6.1L12 16.5 6.5 19.6l1.4-6.1-4.7-4L9.4 9 12 3.2z" />
    </svg>
  )
}

export default function StarButton({
  filled = false,
  onClick,
  dark = true,
  size = 'md',
  className = '',
  label,
}) {
  const dims = size === 'sm' ? 'h-8 w-8 rounded-lg' : 'h-9 w-9 rounded-xl'
  const icon = size === 'sm' ? 15 : 16
  const tone = filled
    ? dark
      ? 'text-amber-300 hover:bg-amber-400/10'
      : 'text-amber-500 hover:bg-amber-50'
    : dark
      ? 'text-white/25 hover:bg-white/5 hover:text-amber-300'
      : 'text-slate-300 hover:bg-slate-100 hover:text-amber-500'

  const text = label || (filled ? 'Remove favorite' : 'Add favorite')

  return (
    <button
      type="button"
      title={text}
      aria-label={text}
      aria-pressed={filled}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center transition ${dims} ${tone} ${className}`}
    >
      <StarIcon filled={filled} size={icon} />
    </button>
  )
}

export { StarIcon }
