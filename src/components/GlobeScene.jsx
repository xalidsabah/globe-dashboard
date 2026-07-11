/**
 * 3D stage entry — isolated so Vite can code-split three / fiber / three-globe.
 */
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Globe from './Globe'

function useMobileDpr() {
  return useMemo(() => {
    if (typeof window === 'undefined') return [1, 1.5]
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const narrow = window.innerWidth < 768
    if (coarse || narrow) return [1, 1.25]
    return [1, 1.75]
  }, [])
}

function usePageVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState !== 'hidden'
  )
  useEffect(() => {
    const onVis = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])
  return visible
}

export default function GlobeScene({
  zoom,
  autoRotate,
  mode,
  resetToken,
  dark,
  focus,
  cities,
  favorites,
  capital = null,
  unit,
  quality = 'high',
  onSelectCity,
}) {
  const mobileDpr = useMobileDpr()
  const dpr = quality === 'low' ? [1, 1] : mobileDpr
  const pageVisible = usePageVisible()

  return (
    <Canvas
      camera={{ position: [0, 40, 300], fov: 45, near: 1, far: 2000 }}
      dpr={dpr}
      frameloop={pageVisible ? 'always' : 'demand'}
      gl={{
        antialias: quality === 'high' && (!dpr || dpr[1] > 1.2),
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={[dark ? '#030712' : '#8eb0d0']} />
      <Suspense fallback={null}>
        <Globe
          zoom={zoom}
          autoRotate={autoRotate}
          mode={mode}
          resetToken={resetToken}
          dark={dark}
          focus={focus}
          cities={cities}
          favorites={favorites}
          capital={capital}
          unit={unit}
          onSelectCity={onSelectCity}
        />
      </Suspense>
    </Canvas>
  )
}
