import { useEffect, useState } from 'react'

/**
 * True when secondary UI should stay open:
 * coarse pointer (touch) or prefers-reduced-motion.
 */
export default function useQuietExpand() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setOpen(coarse.matches || reduce.matches)
    sync()
    coarse.addEventListener('change', sync)
    reduce.addEventListener('change', sync)
    return () => {
      coarse.removeEventListener('change', sync)
      reduce.removeEventListener('change', sync)
    }
  }, [])

  return open
}
