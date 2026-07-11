import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Html } from '@react-three/drei'
import ThreeGlobe from 'three-globe'
import * as THREE from 'three'

const DAY_IMG =
  'https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-blue-marble.jpg'
const NIGHT_IMG =
  'https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-night.jpg'
const TOPO_IMG =
  'https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-topology.png'

const GLOBE_R = 100
const DEG2RAD = Math.PI / 180

/**
 * MUST match three-globe's polar2Cartesian exactly, otherwise pins drift into the ocean.
 * three-globe: phi = (90-lat)°, theta = (90-lng)°, x/y/z with +Z at lat0/lng0
 */
function polar2Cartesian(lat, lng, radius = GLOBE_R) {
  const phi = (90 - lat) * DEG2RAD
  const theta = (90 - lng) * DEG2RAD
  const r = radius
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

function AtmosphereLayers({ dark }) {
  const layers = dark
    ? [
        { scale: 1.045, color: '#2b6fff', opacity: 0.22 },
        { scale: 1.09, color: '#1a4fcc', opacity: 0.12 },
        { scale: 1.15, color: '#0d2f80', opacity: 0.07 },
        { scale: 1.22, color: '#061a4a', opacity: 0.04 },
      ]
    : [
        { scale: 1.04, color: '#7ec8ff', opacity: 0.28 },
        { scale: 1.08, color: '#5aa8f0', opacity: 0.14 },
        { scale: 1.14, color: '#8ec5f5', opacity: 0.08 },
        { scale: 1.2, color: '#b8d9f8', opacity: 0.04 },
      ]

  return (
    <group>
      {layers.map((L, i) => (
        <mesh key={i} scale={L.scale}>
          <sphereGeometry args={[GLOBE_R, 64, 64]} />
          <meshBasicMaterial
            color={L.color}
            transparent
            opacity={L.opacity}
            side={THREE.BackSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
      <mesh scale={dark ? 1.06 : 1.055}>
        <sphereGeometry args={[GLOBE_R, 64, 64]} />
        <meshBasicMaterial
          color={dark ? '#4d8cff' : '#a8d4ff'}
          transparent
          opacity={dark ? 0.08 : 0.1}
          side={THREE.FrontSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

function weatherColor(group, dark, active) {
  if (active) return '#f5c518'
  const map = {
    clear: dark ? '#fbbf24' : '#d97706',
    cloud: dark ? '#94a3b8' : '#64748b',
    rain: dark ? '#38bdf8' : '#0284c7',
    drizzle: dark ? '#7dd3fc' : '#0ea5e9',
    snow: dark ? '#e0f2fe' : '#7dd3fc',
    sleet: dark ? '#a5f3fc' : '#22d3ee',
    storm: dark ? '#c084fc' : '#7c3aed',
    fog: dark ? '#a8a29e' : '#78716c',
  }
  return map[group] || (dark ? '#60a5fa' : '#1d4ed8')
}

function EarthGlobe({ dark, points, arcs }) {
  const globeObj = useMemo(() => new ThreeGlobe({ animateIn: false }).showAtmosphere(true), [])

  useEffect(() => {
    globeObj
      .globeImageUrl(dark ? NIGHT_IMG : DAY_IMG)
      .bumpImageUrl(TOPO_IMG)
      .showAtmosphere(true)
      .atmosphereColor(dark ? '#4d8cff' : '#7ec8ff')
      .atmosphereAltitude(dark ? 0.32 : 0.28)
      .arcsData([])
      .arcColor('color')
      .arcAltitude(0.18)
      .arcStroke(0.45)
      .arcDashLength(0.4)
      .arcDashGap(0.6)
      .arcDashAnimateTime(2800)

    const mat = globeObj.globeMaterial()
    if (mat) {
      mat.color = new THREE.Color('#ffffff')
      if (dark) {
        mat.emissive = new THREE.Color('#ffffff')
        mat.emissiveIntensity = 1.45
        mat.shininess = 5
        mat.specular = new THREE.Color('#111122')
        const apply = () => {
          if (mat.map) {
            mat.emissiveMap = mat.map
            mat.needsUpdate = true
          }
        }
        apply()
        const id = setInterval(() => {
          if (mat.map) {
            apply()
            clearInterval(id)
          }
        }, 80)
        setTimeout(() => clearInterval(id), 10000)
      } else {
        mat.emissive = new THREE.Color('#223344')
        mat.emissiveIntensity = 0.25
        mat.emissiveMap = null
        mat.shininess = 22
        mat.specular = new THREE.Color('#445566')
        mat.needsUpdate = true
      }
    }
  }, [dark, globeObj])

  useEffect(() => {
    globeObj
      .pointsData(points || [])
      .pointAltitude(0.014)
      .pointRadius('size')
      .pointColor('color')
  }, [points, globeObj])

  useEffect(() => {
    globeObj.arcsData(arcs || [])
  }, [arcs, globeObj])

  useEffect(
    () => () => {
      try {
        globeObj.traverse((obj) => {
          obj.geometry?.dispose?.()
          const mats = obj.material
            ? Array.isArray(obj.material)
              ? obj.material
              : [obj.material]
            : []
          mats.forEach((m) => {
            m.map?.dispose?.()
            m.emissiveMap?.dispose?.()
            m.dispose?.()
          })
        })
      } catch {
        /* ignore */
      }
    },
    [globeObj]
  )

  return <primitive object={globeObj} />
}

function CityPin({ city, active, dark, unit, onSelect, groupRef }) {
  // Same math as three-globe points → pins sit on land
  const pos = polar2Cartesian(city.lat, city.lng, GLOBE_R * 1.02)
  const { camera } = useThree()
  const [front, setFront] = useState(true)
  const world = useRef(new THREE.Vector3())

  // Hide labels on the far side of the globe (behind Earth from the camera)
  useFrame(() => {
    if (!groupRef?.current) return
    world.current.copy(pos)
    groupRef.current.localToWorld(world.current)
    // Pin is on the front hemisphere if it faces roughly toward the camera
    const facing = world.current.dot(camera.position) > 0
    if (facing !== front) setFront(facing)
  })

  const temp =
    city.temp == null
      ? null
      : unit === 'F'
        ? Math.round((city.temp * 9) / 5 + 32)
        : Math.round(city.temp)

  // Always keep the active selection pin; hide others when on the back face
  if (!front && !active) return null

  return (
    <Html
      position={pos}
      center
      distanceFactor={155}
      zIndexRange={[15, 0]}
      style={{
        pointerEvents: front || active ? 'auto' : 'none',
        userSelect: 'none',
        opacity: front || active ? 1 : 0,
      }}
      occlude={false}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(city)
        }}
        className={`city-pin group flex flex-col items-center gap-0.5 ${active ? 'z-10' : ''}`}
        title={`${city.name}${temp != null ? ` ${temp}°` : ''}`}
      >
        <span
          className={`rounded-md border px-1.5 py-0.5 text-[9px] font-medium shadow-lg backdrop-blur-md whitespace-nowrap ${
            active
              ? dark
                ? 'border-amber-400/50 bg-amber-400/25 text-white'
                : 'border-amber-500/50 bg-amber-50 text-slate-900'
              : dark
                ? 'border-white/20 bg-black/70 text-white/95 group-hover:border-sky-400/50'
                : 'border-slate-300 bg-white text-slate-800 group-hover:border-sky-400 shadow-md'
          }`}
        >
          {city.name}
          {temp != null && (
            <span className={active ? 'text-amber-200' : dark ? 'text-sky-300' : 'text-sky-600'}>
              {' '}
              {temp}°
            </span>
          )}
        </span>
        <span
          className="h-2.5 w-2.5 rounded-full ring-2 shadow-md"
          style={{
            background: weatherColor(city.group || city.icon, dark, active),
            boxShadow: active ? '0 0 12px rgba(245,197,24,0.9)' : undefined,
            ringColor: active ? 'rgba(245,197,24,0.4)' : 'transparent',
          }}
        />
      </button>
    </Html>
  )
}

/** Rotate globe group so lat/lng faces the camera (+Z) */
function faceLatLng(group, lat, lng) {
  // lat0/lng0 is already on +Z in three-globe space.
  // Rotate Y by -lng, then X by +lat to bring target to +Z.
  group.rotation.order = 'YXZ'
  group.rotation.y = -lng * DEG2RAD
  group.rotation.x = lat * DEG2RAD
  group.rotation.z = 0
}

export default function Globe({
  zoom = 1,
  autoRotate = true,
  mode = '3d',
  resetToken = 0,
  dark = true,
  focus = null,
  cities = [],
  favorites = [],
  unit = 'C',
  onSelectCity,
}) {
  const controlsRef = useRef()
  const groupRef = useRef()
  const { camera } = useThree()
  const targetZoom = useRef(zoom)
  const baseDist = useRef(235)

  useEffect(() => {
    targetZoom.current = zoom
  }, [zoom])

  useEffect(() => {
    if (!groupRef.current) return

    if (focus?.lat != null && focus?.lng != null) {
      faceLatLng(groupRef.current, focus.lat, focus.lng)
    } else {
      // Nice default: Americas / Atlantic
      faceLatLng(groupRef.current, 20, -40)
    }

    const dist = baseDist.current / (targetZoom.current || 1)
    if (mode === '2d') {
      camera.position.set(0, dist * 0.98, dist * 0.12)
    } else {
      camera.position.set(0, dist * 0.12, dist)
    }
    camera.lookAt(0, 0, 0)
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0)
      controlsRef.current.update()
    }
  }, [resetToken, mode, camera, focus?.lat, focus?.lng])

  useFrame(() => {
    const controls = controlsRef.current
    if (controls) {
      controls.autoRotate = Boolean(autoRotate && mode === '3d')
      controls.autoRotateSpeed = 0.2
      if (mode === '2d') {
        controls.minPolarAngle = Math.PI / 2 - 0.05
        controls.maxPolarAngle = Math.PI / 2 + 0.05
      } else {
        controls.minPolarAngle = 0.2
        controls.maxPolarAngle = Math.PI - 0.2
      }
    }

    const desired = baseDist.current / Math.max(0.4, targetZoom.current)
    const current = camera.position.length()
    if (Number.isFinite(current) && current > 10) {
      const diff = Math.abs(current - desired)
      if (diff > 1.5) {
        camera.position.setLength(THREE.MathUtils.lerp(current, desired, 0.1))
      }
    }
  })

  const near = (a, b, eps = 0.35) =>
    a &&
    b &&
    a.lat != null &&
    b.lat != null &&
    Math.abs(a.lat - b.lat) < eps &&
    Math.abs(a.lng - b.lng) < eps

  // Always include the selected/search focus so any city can pin, not only QUICK_CITIES
  const focusCity = useMemo(() => {
    if (focus?.lat == null || focus?.lng == null) return null
    return {
      id: `focus-${focus.lat},${focus.lng}`,
      name: focus.name || 'Selected',
      lat: focus.lat,
      lng: focus.lng,
      temp: focus.temp,
      group: focus.group,
      icon: focus.icon,
    }
  }, [focus])

  const points = useMemo(() => {
    const list = [...(cities || [])]
    if (focusCity && !list.some((c) => near(c, focusCity))) {
      list.push(focusCity)
    }
    // Favorites that aren't in the quick-city list
    for (const f of favorites || []) {
      if (f.lat == null || f.lng == null) continue
      if (!list.some((c) => near(c, f))) list.push(f)
    }
    return list.map((c) => {
      const active = near(c, focusCity)
      return {
        lat: c.lat,
        lng: c.lng,
        size: active ? 0.6 : 0.28,
        color: weatherColor(c.group, dark, active),
      }
    })
  }, [cities, focusCity, favorites, dark])

  // Soft arcs linking favorites
  const arcs = useMemo(() => {
    const nodes = (favorites || []).filter((f) => f.lat != null && f.lng != null)
    if (nodes.length < 2) return []
    const stroke = dark ? 'rgba(125, 211, 252, 0.45)' : 'rgba(14, 165, 233, 0.4)'
    const out = []
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i]
      const b = nodes[i + 1]
      out.push({
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
        color: stroke,
      })
    }
    if (nodes.length >= 3) {
      const a = nodes[nodes.length - 1]
      const b = nodes[0]
      out.push({
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
        color: stroke,
      })
    }
    return out.slice(0, 12)
  }, [favorites, dark])

  // Labels: major cities + favorites + always the focused/search place
  const labelCities = useMemo(() => {
    const major = new Set([
      'New York',
      'Los Angeles',
      'Chicago',
      'London',
      'Paris',
      'Tokyo',
      'Dubai',
      'Sydney',
      'Singapore',
      'São Paulo',
      'Cairo',
      'Mumbai',
      'Berlin',
      'Moscow',
      'Hong Kong',
      'Mexico City',
      'Istanbul',
      'Seoul',
      'Lagos',
      'Buenos Aires',
    ])
    const favKeys = new Set(
      (favorites || []).map((f) => `${Number(f.lat).toFixed(1)},${Number(f.lng).toFixed(1)}`)
    )
    const byKey = new Map()
    const add = (c) => {
      if (!c || c.lat == null || c.lng == null) return
      const key = `${Number(c.lat).toFixed(2)},${Number(c.lng).toFixed(2)}`
      const prev = byKey.get(key)
      // Prefer named focus / richer data
      if (!prev || (c.name && !prev.name) || c.temp != null) byKey.set(key, { ...prev, ...c })
      else byKey.set(key, prev)
    }

    for (const c of cities || []) {
      if (
        major.has(c.name) ||
        near(c, focusCity) ||
        favKeys.has(`${Number(c.lat).toFixed(1)},${Number(c.lng).toFixed(1)}`)
      ) {
        add(c)
      }
    }
    for (const f of favorites || []) add(f)
    // Critical: searched places are not in QUICK_CITIES — always pin focus
    if (focusCity) add(focusCity)

    return Array.from(byKey.values())
  }, [cities, focusCity, favorites])

  return (
    <>
      {dark ? (
        <>
          <ambientLight intensity={2.8} />
          <directionalLight position={[10, 8, 12]} intensity={2.4} color="#ffffff" />
          <directionalLight position={[-8, 3, -6]} intensity={1.2} color="#7aa8ff" />
          <hemisphereLight args={['#c5d8ff', '#050a14', 1.3]} />
          <pointLight position={[0, 0, 180]} intensity={0.9} color="#dce8ff" distance={600} />
        </>
      ) : (
        <>
          <ambientLight intensity={1.8} />
          <directionalLight position={[6, 10, 8]} intensity={3.2} color="#fff8f0" />
          <directionalLight position={[-10, 3, -6]} intensity={0.9} color="#8eb6ff" />
          <hemisphereLight args={['#e8f2ff', '#b8cce0', 1.1]} />
        </>
      )}

      <group ref={groupRef} scale={0.95}>
        <AtmosphereLayers dark={dark} />
        <EarthGlobe dark={dark} points={points} arcs={arcs} />
        {labelCities.map((city) => {
          const active =
            focus &&
            Math.abs(city.lat - focus.lat) < 0.5 &&
            Math.abs(city.lng - focus.lng) < 0.5
          return (
            <CityPin
              key={`${city.name}-${city.lat}-${city.lng}`}
              city={city}
              active={active}
              dark={dark}
              unit={unit}
              onSelect={onSelectCity}
              groupRef={groupRef}
            />
          )
        })}
      </group>

      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom
        minDistance={120}
        maxDistance={420}
        rotateSpeed={mode === '2d' ? 0.35 : 0.5}
        zoomSpeed={0.75}
        autoRotate={Boolean(autoRotate && mode === '3d')}
        autoRotateSpeed={0.2}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}
