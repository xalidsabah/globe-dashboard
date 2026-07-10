/** Simple SVG weather glyphs — no external icon pack */
export default function WeatherIcon({ icon = 'cloud', size = 28, className = '', isDay = true }) {
  const s = size
  const stroke = 'currentColor'
  const common = {
    width: s,
    height: s,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
  }

  switch (icon) {
    case 'sun':
      return (
        <svg {...common}>
          {isDay ? (
            <>
              <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" stroke="none" />
              <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
            </>
          ) : (
            <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 7 7 0 1 0 21 14.5z" fill="currentColor" stroke="none" />
          )}
        </svg>
      )
    case 'partly':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="3.2" fill="currentColor" opacity="0.85" stroke="none" />
          <path d="M9 3v1.2M3.5 9H2.3M4.6 4.6l.8.8" opacity="0.7" />
          <path d="M7 18h9a3.5 3.5 0 0 0 .25-7 4.8 4.8 0 0 0-9.1 1.3A3 3 0 0 0 7 18z" fill="currentColor" opacity="0.35" />
          <path d="M7 18h9a3.5 3.5 0 0 0 .25-7 4.8 4.8 0 0 0-9.1 1.3A3 3 0 0 0 7 18z" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...common}>
          <path d="M7 18h10a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.5 1.5A3.5 3.5 0 0 0 7 18z" fill="currentColor" opacity="0.2" />
          <path d="M7 18h10a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.5 1.5A3.5 3.5 0 0 0 7 18z" />
        </svg>
      )
    case 'fog':
      return (
        <svg {...common}>
          <path d="M4 9h16M5 13h14M7 17h10" />
        </svg>
      )
    case 'drizzle':
      return (
        <svg {...common}>
          <path d="M7 15h9a3.2 3.2 0 0 0 .2-6.4 4.5 4.5 0 0 0-8.6 1.2A2.8 2.8 0 0 0 7 15z" />
          <path d="M9 17.5v1.5M12 18v2M15 17.5v1.5" />
        </svg>
      )
    case 'rain':
      return (
        <svg {...common}>
          <path d="M7 14h10a3.5 3.5 0 0 0 .25-7 5 5 0 0 0-9.5 1.4A3 3 0 0 0 7 14z" />
          <path d="M8 17l-1 3M12 16.5l-1 3.5M16 17l-1 3" />
        </svg>
      )
    case 'snow':
      return (
        <svg {...common}>
          <path d="M7 14h10a3.5 3.5 0 0 0 .25-7 5 5 0 0 0-9.5 1.4A3 3 0 0 0 7 14z" />
          <path d="M9 17.5h.01M12 19h.01M15 17.5h.01" strokeWidth="2.4" />
        </svg>
      )
    case 'sleet':
      return (
        <svg {...common}>
          <path d="M7 14h10a3.5 3.5 0 0 0 .25-7 5 5 0 0 0-9.5 1.4A3 3 0 0 0 7 14z" />
          <path d="M9 17l-.5 1.5M12 16.5 11 19M15 17l-.5 1.5" />
          <path d="M17 19h.01" strokeWidth="2.2" />
        </svg>
      )
    case 'storm':
      return (
        <svg {...common}>
          <path d="M7 13h9a3.2 3.2 0 0 0 .2-6.4 4.5 4.5 0 0 0-8.6 1.2A2.8 2.8 0 0 0 7 13z" />
          <path d="M11 14l-2 4h3l-1.5 4" fill="currentColor" opacity="0.85" stroke="none" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <path d="M7 18h10a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.5 1.5A3.5 3.5 0 0 0 7 18z" />
        </svg>
      )
  }
}
