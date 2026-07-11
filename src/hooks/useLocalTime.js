import { useEffect, useState } from 'react'

/** Live clock for a place timezone — updates every 30s */
export default function useLocalTime(timeZone) {
  const [text, setText] = useState('')

  useEffect(() => {
    if (!timeZone || timeZone === 'auto') {
      setText('')
      return
    }
    const tick = () => {
      try {
        setText(
          new Intl.DateTimeFormat(undefined, {
            hour: 'numeric',
            minute: '2-digit',
            timeZone,
          }).format(new Date())
        )
      } catch {
        setText('')
      }
    }
    tick()
    const id = window.setInterval(tick, 30000)
    return () => window.clearInterval(id)
  }, [timeZone])

  return text
}
