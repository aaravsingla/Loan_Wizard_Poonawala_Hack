import { useState, useEffect } from 'react'

export default function Counter({ value, duration = 1400, decimals = 0 }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const progress = Math.min((Date.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress >= 1) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [value, duration])

  return <span>{display.toFixed(decimals)}</span>
}