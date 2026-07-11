/**
 * 3D stage entry — isolated so Vite can code-split three / fiber / three-globe.
 */
import { Suspense, useMemo } from 'react'
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

  return (
    <Canvas
      camera={{ position: [0, 40, 240], fov: 45, near: 1, far: 2000 }}
      dpr={dpr}
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
