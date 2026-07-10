/**
 * 3D stage entry — isolated so Vite can code-split three / fiber / three-globe.
 */
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Globe from './Globe'

export default function GlobeScene({
  zoom,
  autoRotate,
  mode,
  resetToken,
  dark,
  focus,
  cities,
  unit,
  onSelectCity,
}) {
  return (
    <Canvas
      camera={{ position: [0, 40, 240], fov: 45, near: 1, far: 2000 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
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
          unit={unit}
          onSelectCity={onSelectCity}
        />
      </Suspense>
    </Canvas>
  )
}
