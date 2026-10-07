import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { layeredNoise } from './noise'

export default function ThreeCanvas({ layers, resolution, simulationField = null, fogEnabled = false }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    const width = mount.clientWidth
    const height = mount.clientHeight

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
    camera.position.set(3.5, 3.2, 5.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    // prefer pastel background token, fallback to dark
    let bgColor = '#111216'
    try {
      const cssBg = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-4').trim()
      if (cssBg) bgColor = cssBg
    } catch {
      bgColor = '#111216'
    }
    renderer.setClearColor(bgColor)
    if (fogEnabled) scene.fog = new THREE.Fog(bgColor, 2.8, 7.5)
    renderer.domElement.style.display = 'block'
    mount.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    // keep the controls focused on the center (where the cube is)
    controls.target.set(0, 0, 0)
    controls.update()

    const segments = Math.max(12, Math.min(256, resolution - 1))
    const geometry = new THREE.PlaneGeometry(4.8, 4.8, segments, segments)
    const positions = geometry.attributes.position
    const colors = new Float32Array(positions.count * 3)
    const colorStops = [
      { height: 0.15, color: new THREE.Color('#064b78') },
      { height: 0.35, color: new THREE.Color('#10a878') },
      { height: 0.52, color: new THREE.Color('#e1c341') },
      { height: 0.72, color: new THREE.Color('#d86a3d') },
      { height: 0.92, color: new THREE.Color('#fff0c2') },
    ]
    for (let index = 0; index < positions.count; index += 1) {
      const x = positions.getX(index) / 4.8 + 0.5
      const y = positions.getY(index) / 4.8 + 0.5
      let heightValue = layeredNoise(x, y, layers)
      if (simulationField) {
        const fieldX = Math.min(simulationField.size - 1, Math.floor(x * simulationField.size))
        const fieldY = Math.min(simulationField.size - 1, Math.floor(y * simulationField.size))
        heightValue = simulationField.values[fieldY * simulationField.size + fieldX]
      }
      positions.setZ(index, (heightValue - 0.5) * 1.8)

      const colorHeight = Math.min(1, Math.max(0, heightValue))
      let lowerStop = colorStops[0]
      let upperStop = colorStops[colorStops.length - 1]
      for (let stopIndex = 0; stopIndex < colorStops.length - 1; stopIndex += 1) {
        if (colorHeight >= colorStops[stopIndex].height && colorHeight <= colorStops[stopIndex + 1].height) {
          lowerStop = colorStops[stopIndex]
          upperStop = colorStops[stopIndex + 1]
          break
        }
      }
      const blend = Math.min(1, Math.max(0, (colorHeight - lowerStop.height) / (upperStop.height - lowerStop.height)))
      const vertexColor = lowerStop.color.clone().lerp(upperStop.color, blend)
      colors[index * 3] = vertexColor.r
      colors[index * 3 + 1] = vertexColor.g
      colors[index * 3 + 2] = vertexColor.b
    }
    positions.needsUpdate = true
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    geometry.computeVertexNormals()
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.68, metalness: 0.03, emissive: 0x24152b, emissiveIntensity: 0.12 })
    const terrain = new THREE.Mesh(geometry, material)
    terrain.rotation.x = -Math.PI / 2.35
    scene.add(terrain)
    const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffb6c1, transparent: true, opacity: 0.2 }))
    wire.rotation.copy(terrain.rotation)
    scene.add(wire)

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(5, 5, 5)
    scene.add(dirLight)
    scene.add(new THREE.AmbientLight(0x686078, 0.8))

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
      terrain.rotation.z += 0.0015
      wire.rotation.z += 0.0015
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('resize', onResize)
      controls.dispose()
      renderer.dispose()
      if (mount && renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement)
      }
      scene.clear()
    }
  }, [layers, resolution, simulationField, fogEnabled])

  // update cube material/scale reactively by letting effect rerun on props change
  return <div ref={mountRef} style={{ width: '100%', height: '100%' }} />
}
