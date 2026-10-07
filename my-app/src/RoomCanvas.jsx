import { createWeatherScene } from './weatherScene'
import { createWorldShaders } from './worldShaders'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

export default function RoomCanvas({ season, shaderMode, weather, simulation, renderResolution }) {
  const qualityRef = useRef(null)
  const mountRef = useRef(null)
  const shadersRef = useRef(null)
  const weatherRef = useRef(null)
  useEffect(() => { weatherRef.current = { weather, simulation, season } }, [weather, simulation, season])
  const sceneRef = useRef(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true }) } catch {
      // Report unavailable graphics without taking down the seasonal controls.
      queueMicrotask(() => setUnavailable(true))
      return
    }
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#242331')
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(9, 7.5, 11)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1.1, 0)
    controls.minDistance = 8
    controls.maxDistance = 19
    controls.minAzimuthAngle = 0.12
    controls.maxAzimuthAngle = 1.35
    controls.maxPolarAngle = Math.PI / 2.15
    controls.enablePan = false
    controls.enableDamping = true

    const materials = []
    function material(color) {
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
      materials.push(mat)
      return mat
    }
    function box(w, h, d, x, y, z, color) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color))
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      mesh.receiveShadow = true
      scene.add(mesh)
      return mesh
    }
    function ball(r, x, y, z, color) {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), material(color))
      mesh.position.set(x, y, z)
      mesh.castShadow = true
      scene.add(mesh)
      return mesh
    }
    const wood = '#c69f84', cream = '#f7eadc'
    box(6.2, 0.22, 5.6, 0, -0.12, 0, wood)
    for (let i = 0; i < 13; i++) box(0.015, 0.008, 5.5, -3 + i * 0.5, 0, 0, '#ad886f')
    box(0.16, 3.6, 5.6, -3.08, 1.7, 0, '#e4cdd6')
    // Back wall is built around a genuine window opening.
    box(6.2, 1.25, 0.16, 0, 0.52, -2.8, '#eee2e1')
    box(6.2, 0.65, 0.16, 0, 3.175, -2.8, '#eee2e1')
    box(2.7, 1.7, 0.16, -1.75, 2, -2.8, '#eee2e1')
    box(1.1, 1.7, 0.16, 2.55, 2, -2.8, '#eee2e1')
    box(6, 0.12, 0.12, 0, 0.08, -2.67, cream)
    box(0.12, 0.12, 5.5, -2.96, 0.08, 0, cream)
    const sky = box(2.4, 1.7, 0.05, 0.8, 2, -3.3, '#cce6ed')
    sky.material = new THREE.MeshBasicMaterial({ color: '#cce6ed' })
    materials.push(sky.material)
    const ground = box(2.4, 0.35, 0.08, 0.8, 1.32, -3.22, '#a9bf8a')
    box(0.09, 1.2, 0.08, 1.4, 1.8, -3.12, wood)
    const foliage = []
    for (const [x, y, r] of [[1.4, 2.4, .38], [1.1, 2.2, .28], [1.7, 2.2, .28]]) foliage.push(ball(r, x, y, -3.14, '#eeaec5'))
    for (const x of [-0.42, 0.8, 2.02]) box(0.07, 1.8, 0.12, x, 2, -2.65, cream)
    for (const y of [1.13, 2, 2.87]) box(2.55, 0.07, 0.16, 0.8, y, -2.65, cream)
    box(2.8, .12, .4, .8, 1.08, -2.6, cream)
    for (const x of [-.62, 2.23]) {
      box(.32, 1.95, .15, x, 1.97, -2.47, '#d5b4c6')
      for (let i = 0; i < 4; i++) box(.03, 1.9, .04, x - .12 + i * .08, 1.97, -2.36, '#e5c6d5')
    }
    // Bed, pillow, quilt, and a knitted throw.
    box(1.65, .4, 2.75, -1.8, .28, -.5, wood)
    box(1.78, 1.25, .14, -1.8, .7, -1.9, cream)
    box(1.65, .22, 2.6, -1.8, .6, -.5, '#fff5ed')
    const quilt = box(1.69, .16, 1.92, -1.8, .76, -.12, '#b4a1d2')
    box(1.15, .19, .52, -1.8, .81, -1.48, '#fff4e6')
    const throwBlanket = box(1.73, .10, .52, -1.8, .88, .49, '#edd4b9')
    const rug = box(2.7, .025, 2.05, .45, .025, .65, '#d7b9bc')
    for (let i = 0; i < 8; i++) box(.025, .006, 1.98, -.72 + i * .33, .041, .65, '#ebd5d0')
    // Writing desk with notebook, pencils, stool, and seasonal objects.
    box(2.1, .13, .82, 1.3, 1.02, -1.98, wood)
    for (const x of [.4, 2.2]) for (const z of [-2.29, -1.68]) box(.085, 1, .085, x, .5, z, cream)
    box(.58, .035, .38, 1.12, 1.11, -1.9, '#fcf0dc').rotation.y = -.15
    box(.035, .03, .34, 1.18, 1.15, -1.85, '#a77796').rotation.y = -.4
    box(.56, .12, .55, 1.1, .58, -1.04, '#b8a6bc')
    for (const x of [.9, 1.3]) for (const z of [-1.23, -.85]) box(.065, .55, .065, x, .28, z, wood)
    const seasonal = { spring: [], summer: [], autumn: [], winter: [] }
    seasonal.spring.push(box(.17, .27, .17, 2, 1.23, -2, '#b8c6bc'))
    for (let i = 0; i < 3; i++) {
      seasonal.spring.push(box(.025, .35, .025, 1.92 + i * .07, 1.46, -2, '#718c66'))
      seasonal.spring.push(ball(.085, 1.92 + i * .07, 1.64 + (i % 2) * .06, -2, '#e9a5bc'))
    }
    seasonal.summer.push(box(.35, .05, .27, 2, 1.13, -2, '#a7babe'), box(.05, .35, .05, 2, 1.29, -2, '#a7babe'))
    const fan = new THREE.Mesh(new THREE.TorusGeometry(.22, .025, 8, 32), material('#8caaaf'))
    fan.position.set(2, 1.57, -2); scene.add(fan); seasonal.summer.push(fan)
    for (let i = 0; i < 3; i++) {
      const blade = box(.07, .38, .03, 2, 1.57, -2, '#b5cbd0')
      blade.rotation.z = i * Math.PI / 3
      seasonal.summer.push(blade)
    }
    seasonal.autumn.push(ball(.18, 2, 1.28, -2, '#d59155'), box(.04, .12, .04, 2, 1.48, -2, '#827052'))
    seasonal.winter.push(box(.18, .21, .18, 2, 1.21, -2, '#efe1ce'))
    const handle = new THREE.Mesh(new THREE.TorusGeometry(.065, .018, 8, 16), material('#efe1ce'))
    handle.position.set(2.13, 1.23, -2); scene.add(handle); seasonal.winter.push(handle)
    // Bedside lamp and shelf of personal treasures.
    box(.58, .66, .58, -.51, .33, -1.9, cream)
    box(.035, .35, .035, -.51, .87, -1.9, wood)
    const shade = new THREE.Mesh(new THREE.CylinderGeometry(.16, .24, .28, 24), material('#f5d6a7'))
    shade.position.set(-.51, 1.1, -1.9); scene.add(shade)
    const lamp = new THREE.PointLight('#ffcb88', 1, 4)
    lamp.position.set(-.51, 1.18, -1.7); scene.add(lamp)
    box(.38, .09, 1.8, -2.81, 2.05, .9, wood)
    for (let i = 0; i < 6; i++) box(.22, .35 + (i % 3) * .08, .10, -2.77, 2.27, .3 + i * .13, ['#9daac6', '#d398a9', '#e5c391'][i % 3])
    ball(.15, -2.73, 2.24, 1.42, '#c7a584')
    ball(.105, -2.73, 2.43, 1.42, '#c7a584')
    for (const z of [1.33, 1.51]) ball(.045, -2.73, 2.51, z, '#c7a584')
    // Pinned sketches above the bed.
    for (let i = 0; i < 3; i++) {
      box(.48, .6, .025, -2.25 + i * .57, 2.32 + (i % 2) * .16, -2.68, cream)
      ball(.11, -2.25 + i * .57, 2.35 + (i % 2) * .16, -2.65, ['#c99aaa', '#adb6a0', '#d3b77f'][i]).scale.z = .08
      box(.14, .055, .03, -2.25 + i * .57, 2.63 + (i % 2) * .16, -2.64, '#d5bc95')
    }
    const sunlight = new THREE.DirectionalLight('#fff1d8', 2.4)
    sunlight.position.set(2, 7, 3)
    sunlight.castShadow = true
    sunlight.shadow.mapSize.set(1024, 1024)
    sunlight.shadow.camera.left = -5; sunlight.shadow.camera.right = 5
    sunlight.shadow.camera.top = 5; sunlight.shadow.camera.bottom = -5
    sunlight.shadow.normalBias = .04
    scene.add(sunlight, new THREE.HemisphereLight('#f5e8f2', '#9b8292', 2))
    sceneRef.current = { sky, ground, foliage, quilt, throwBlanket, seasonal, sunlight, lamp, shade, rug }
    const shaders = createWorldShaders(renderer, scene, camera, 'room')
    shadersRef.current = shaders
    const weatherScene = createWeatherScene(scene, true)
    const resize = () => {
      const width = mount.clientWidth, height = mount.clientHeight
      camera.aspect = width / Math.max(height, 1)
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      shaders.resize(width, height)
    }
    qualityRef.current = (resolution) => { renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * resolution / 100); resize() }
    const observer = new ResizeObserver(resize)
    observer.observe(mount); resize()
    let frame
    const draw = () => { controls.update(); const current = weatherRef.current; const atmosphere = current ? weatherScene.update(current.weather, current.simulation, current.season) : null; shaders.render(atmosphere); frame = requestAnimationFrame(draw) }
    draw()
    return () => {
      qualityRef.current = null
      cancelAnimationFrame(frame)
      observer.disconnect(); controls.dispose()
      scene.traverse((object) => object.geometry?.dispose())
      materials.forEach((mat) => mat.dispose())
      weatherScene.dispose()
      shaders.dispose(); shadersRef.current = null
      renderer.dispose(); renderer.domElement.remove()
      sceneRef.current = null
    }
  }, [])

  useEffect(() => {
    const room = sceneRef.current
    if (!room) return
    room.sky.material.color.set(season.sky)
    room.ground.material.color.set(season.ground)
    room.foliage.forEach((leaf) => { leaf.material.color.set(season.leaves); leaf.scale.setScalar(season.id === 'winter' ? .55 : 1) })
    room.quilt.material.color.set(season.quilt)
    room.quilt.scale.y = season.id === 'winter' ? 1.8 : season.id === 'summer' ? .4 : 1
    room.throwBlanket.visible = ['autumn', 'winter'].includes(season.id)
    Object.entries(room.seasonal).forEach(([key, objects]) => objects.forEach((object) => { object.visible = key === season.id }))
    room.sunlight.color.set(season.light)
    room.sunlight.intensity = season.intensity
    room.lamp.intensity = season.id === 'winter' ? 3 : .3
    room.shade.material.emissive.set(season.id === 'winter' ? '#ad7132' : '#000000')
  }, [season])

  useEffect(() => { shadersRef.current?.setMode(shaderMode) }, [shaderMode])

  useEffect(() => { qualityRef.current?.(renderResolution) }, [renderResolution])

  return <div ref={mountRef} className="room-canvas" role="img" aria-label={`Your bedroom in ${season.name.toLowerCase()}: ${season.window.toLowerCase()}, ${season.bedding.toLowerCase()}, ${season.details.toLowerCase()}.`}>{unavailable && <p className="graphics-fallback">The 3D room needs WebGL. Try opening this page in a browser with hardware acceleration enabled.</p>}</div>
}
