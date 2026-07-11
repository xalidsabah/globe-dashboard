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
  unit,
  onSelectCity,
}) {
  const dpr = useMobileDpr()
  const pageVisible = usePageVisible()

  return (
    <Canvas
      camera={{ position: [0, 40, 240], fov: 45, near: 1, far: 2000 }}
      dpr={dpr}
      frameloop={pageVisible ? 'always' : 'demand'}
      gl={{ antialias: !dpr || dpr[1] > 1.3, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <color attach="background" args={[dark ? '#050a14' : '#7fa8cc']} />
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
          unit={unit}
          onSelectCity={onSelectCity}
        />
      </Suspense>
    </Canvas>
  )
}
