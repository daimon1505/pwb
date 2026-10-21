import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

function latLonToXYZ(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

const sampleMarkers = [
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', lat: 35.6895, lon: 139.6917 },
]

export default function GeoCanvas({ onSelectMarker }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const width = mount.clientWidth
    const height = mount.clientHeight

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.01, 1000)
    camera.position.set(0, 0, 6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    // prefer pastel background token for globe view
    let geoBg = '#0b0f14'
    try {
      const cssGeoBg = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-4').trim()
      if (cssGeoBg) geoBg = cssGeoBg
    } catch (e) {}
    renderer.setClearColor(geoBg, 1)
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 2.5
    controls.maxDistance = 20
    controls.target.set(0, 0, 0)
    controls.update()

    // globe
    const R = 1.8
    // globe base color driven by style token (fallback to dark)
    let globeBase = '#11151a'
    try {
      const cssGlobe = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim()
      if (cssGlobe) globeBase = cssGlobe
    } catch (e) {}
    const globeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(globeBase),
      roughness: 1,
      metalness: 0.05,
    })
    const globeGeo = new THREE.SphereGeometry(R, 64, 64)
    const globe = new THREE.Mesh(globeGeo, globeMat)
    scene.add(globe)

    // subtle grid lines (wireframe overlay)
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(R + 0.001, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x1f2430, wireframe: true, opacity: 0.25, transparent: true })
    )
    scene.add(wire)

    // atmosphere glow (slightly pink/magenta tint inspired by the mood)
    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(R + 0.08, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0x4b2233, transparent: true, opacity: 0.06, blending: THREE.AdditiveBlending })
    )
    scene.add(atmosphere)

    // markers
    const markerGroup = new THREE.Group()
    scene.add(markerGroup)

    sampleMarkers.forEach((m) => {
      const pos = latLonToXYZ(m.lat, m.lon, R + 0.02)
      const ms = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshStandardMaterial({ color: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--color-accent-1').trim() || '#ff4d6d'), emissive: 0x33000c })
      )
      ms.position.copy(pos)
      ms.lookAt(new THREE.Vector3(0, 0, 0))
      ms.userData = { name: m.name }
      markerGroup.add(ms)
    })

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)
    scene.add(new THREE.AmbientLight(0x404040))

    // raycaster for clicks
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const onPointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(markerGroup.children, false)
      if (intersects.length > 0) {
        renderer.domElement.style.cursor = 'pointer'
      } else {
        renderer.domElement.style.cursor = 'grab'
      }
    }

    const onClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(markerGroup.children, false)
      if (intersects.length > 0) {
        const object = intersects[0].object
        if (onSelectMarker) onSelectMarker(object.userData.name)
      }
    }

    renderer.domElement.addEventListener('pointermove', onPointerMove)
    renderer.domElement.addEventListener('click', onClick)

    const onResize = () => {
      if (!mount) return
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    let reqId
    const animate = () => {
      reqId = requestAnimationFrame(animate)
      globe.rotation.y += 0.002
      markerGroup.rotation.y += 0.002
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('pointermove', onPointerMove)
      renderer.domElement.removeEventListener('click', onClick)
      controls.dispose()
      renderer.dispose()
      if (mount && renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [onSelectMarker])

  return <div ref={mountRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
}
