import { createStreetView } from './streetView'
import { createWeatherScene } from './weatherScene'
import { createWorldShaders } from './worldShaders'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// All architecture is assembled on the same quarter-unit voxel grid.
export default function NeighborhoodCanvas({ season, onEnterRoom, shaderMode, weather, simulation, voxelDensity, renderResolution, streetView, onExitStreet }) {
  const streetRef = useRef(null)
  const exitStreetRef = useRef(onExitStreet)
  useEffect(() => { exitStreetRef.current = onExitStreet }, [onExitStreet])
  const tooltipRef = useRef(null)
  const qualityRef = useRef(null)
  const cameraStateRef = useRef(null)
  const mountRef = useRef(null)
  const shadersRef = useRef(null)
  const weatherRef = useRef(null)
  useEffect(() => { weatherRef.current = { weather, simulation, season } }, [weather, simulation, season])
  const worldRef = useRef(null)
  const enterRef = useRef(onEnterRoom)
  const [unavailable, setUnavailable] = useState(false)
  useEffect(() => { enterRef.current = onEnterRoom }, [onEnterRoom])

  useEffect(() => {
    const UNIT = .5 / voxelDensity
    const mount = mountRef.current
    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true }) } catch {
      queueMicrotask(() => setUnavailable(true))
      return
    }
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, .1, 150)
    camera.position.set(24, 25, 29)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 1, -2)
    if (cameraStateRef.current) {
      camera.position.copy(cameraStateRef.current.position)
      controls.target.copy(cameraStateRef.current.target)
    }
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 20; controls.maxDistance = 65
    controls.maxPolarAngle = Math.PI / 2.5
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)
    const buckets = new Map()
    let place = null
    const palette = { grass: '#a9bf8a', leaf: '#eeaec5', roof: '#ae859d', snow: '#f4f5ff', flower: '#f1b1c7' }
    function block(x, y, z, w, h, d, color, house = false) {
      const key = `${color}:${house}:${place}`
      if (!buckets.has(key)) buckets.set(key, { color, house, place, points: [] })
      const points = buckets.get(key).points
      const nx = Math.max(1, Math.round(w / UNIT)), ny = Math.max(1, Math.round(h / UNIT)), nz = Math.max(1, Math.round(d / UNIT))
      const sx = w / nx, sy = h / ny, sz = d / nz
      for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) for (let c = 0; c < nz; c++) {
        if (a && b && c && a < nx - 1 && b < ny - 1 && c < nz - 1) continue
        points.push([x + (a + .5) * sx, y + (b + .5) * sy, z + (c + .5) * sz, sx, sy, sz])
      }
    }
    block(-13, -.5, -11.5, 26, .5, 18, '#b19a8b')
    block(-13, 0, -11.5, 26, .25, 18, 'grass')
    // Cross streets and sidewalks divide a single neighborhood block.
    block(-13, .25, -.75, 26, .25, 2, '#777582')
    block(-.5, .25, -8, 1.75, .25, 14.5, '#777582')
    for (const z of [-1.25, 1.25]) block(-13, .25, z, 26, .25, .5, '#e5d8cc')
    for (const x of [-1, 1.25]) block(x, .25, -6.5, .5, 13 / 52, 13, '#e5d8cc')
    for (let x = -7.5; x < 8; x += 1.5) block(x, .5, 0, .75, .25, .25, '#eddfbd')
    for (let i = 0; i < 5; i++) block(1.75 + i * .5, .5, -.75, .25, .25, 2, '#f4ebd9')

    function windows(x, y, z, columns, rows, house = false) {
      for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
        block(x + col, y + row, z, .75, .75, .25, '#fff0d7', house)
        block(x + col + .25, y + row + .25, z + .25, .25, .25, .25, '#96bccc', house)
      }
    }
    block(-13, .25, -7.75, 26, .25, 1.5, '#777582')
    for (const z of [-8.25, -6.25]) block(-13, .25, z, 26, .25, .5, '#e5d8cc')
    // School: classroom wings, central entrance, clock tower and schoolyard.
    place = 'School'
    block(-6.75, .25, -5.5, 5.25, .25, 3.75, '#d9c7b5')
    block(-6.5, .5, -5.25, 4.75, 2.5, 2.25, '#e4b4a4')
    block(-6.75, 3, -5.5, 5.25, .25, 2.75, 'roof')
    windows(-6.25, 1, -3, 4, 2)
    block(-4.75, .5, -3, 1.25, 3.5, .75, '#f3debe')
    block(-5, 4, -3.25, 1.75, .25, 1.25, 'roof')
    block(-4.5, .5, -2.25, .75, 1.25, .25, '#857383')
    block(-4.5, 3, -2.25, .75, .75, .25, '#ffffe5')
    block(-4.25, 3.25, -2, .25, .25, .25, '#776375')
    block(-6.5, .5, -2.25, .25, 2, .25, '#a89a8b')
    block(-6.25, 2, -2.25, .75, .5, .25, '#c691b2')

    // Mall: broad glazed facade, striped canopy, roof sign and planters.
    place = 'Petal Mall'
    block(2, .25, -5.75, 5.25, .25, 4, '#d9c7b5')
    block(2.25, .5, -5.5, 4.75, 2.25, 2.75, '#c5b7d4')
    block(2, 2.75, -5.75, 5.25, .5, 3.25, '#a992b4')
    for (let x = 2.5; x < 7; x += 1) block(x, .75, -2.75, .75, 1.5, .25, '#9fc8d1')
    for (let i = 0; i < 10; i++) block(2 + i * .5, 2, -2.75, .5, .25, .75, i % 2 ? '#f2e1d4' : '#d999b4')
    block(4, .5, -2.5, 1.25, 1.5, .25, '#f7e7d2')
    block(4.25, .5, -2.25, .75, 1.25, .25, '#a5baca')
    for (const x of [2.25, 6.5]) { block(x, .5, -1.75, .5, .5, .5, '#b18c86'); block(x, 1, -1.75, .5, .5, .5, 'leaf') }

    function home(x, z, color, house = false) {
      block(x - .25, .25, z - .25, 3, .25, 3.5, '#e2cdbb', house)
      block(x, .5, z, 2.5, 2, 2.5, color, house)
      for (let step = 0; step < 4; step++) block(x - .25 + step * .25, 2.5 + step * .25, z - .25, 3 - step * .5, .25, 3, 'roof', house)
      block(x + .25, 3, z + .25, .5, 1, .5, '#bf998f', house)
      windows(x + .25, 1.25, z + 2.5, 2, 1, house)
      block(x + 1, .5, z + 2.5, .5, 1, .25, '#9d7b98', house)
      block(x + .75, .25, z + 2.75, 1, .25, .75, '#eee0cf', house)
      block(x - .25, 3.5, z, 3, .25, 2.5, 'snow', house)
    }
    place = 'Your house'
    home(-6.25, 2, '#efd0c5', true)
    place = 'Maple House'
    home(2, 2, '#e4d5aa')
    // A narrow apartment building fills the last street frontage.
    place = 'Willow Apartments'
    block(5.5, .5, 2.5, 1.75, 3.5, 2.5, '#b4c4c1')
    block(5.25, 4, 2.25, 2.25, .25, 3, 'roof')
    windows(5.75, 1, 5, 1, 3)
    function storefront(name, x, z, color, awning, restaurant = false) {
      place = name
      block(x-.25,.25,z-.25,3.5,.25,3.5,'#e2cdbb')
      block(x,.5,z,3,2.25,2.5,color)
      block(x-.25,2.75,z-.25,3.5,.25,3,'roof')
      block(x-.25,3,z-.25,3.5,.25,3,'snow')
      windows(x+.25,1,z+2.5,2,1)
      block(x+2.25,.5,z+2.5,.5,1.5,.25,'#8aaab4')
      for(let i=0;i<7;i++) block(x-.25+i*.5,2.1,z+2.5,.5,.25,.75,i%2 ? '#f7eadc' : awning)
      if(restaurant) {
        for(const tx of [x+.25,x+1.5]) {
          block(tx,.5,z+3,.5,.5,.5,'#c69f84')
          block(tx-.1,1,z+2.9,.75,.15,.75,'#f5e2be')
        }
        block(x+2,3,z+.25,.5,.5,.5,'#b09c93')
      } else {
        block(x,.5,z+3,.5,.25,.5,'#b18c86')
        block(x,.75,z+3,.5,.5,.5,'flower')
      }
    }
    storefront('Peach Blossom Café',-12,-5.5,'#efc7b7','#d999b4',true)
    storefront('Moonlight Noodles',8.75,-5.5,'#e6d4b0','#b8919f',true)
    storefront('Little Chapter Bookshop',-12,-11.25,'#bfcdd4','#8b9fb7')
    storefront('Petal & Stem Florist',-7.5,-11.25,'#c7d8be','#9bad8c')
    storefront('Sugar Cloud Bakery',-3,-11.25,'#ead0db','#cea1c1',true)
    storefront('Ribbon Boutique',1.5,-11.25,'#d4c7df','#a495ba')
    place = 'Lavender House'; home(7.5,-11.25,'#d5c5df')
    place = 'Rosewood House'; home(-12,2,'#e6bfc0')
    place = 'Sunflower House'; home(9,2,'#ead8ac')
    place = null
    // Voxel trees and flowers follow deterministic placement rules.
    for (const [x, z] of [[-7, 1.75], [-2.25, 3], [-1.75, 5.25], [7, 1.75], [1.75, -6], [-7.5, -5.75], [4.75, 5.5]]) {
      block(x, .25, z, .25, 1.75, .25, '#9b7c6a')
      block(x - .5, 1.75, z - .5, 1.25, .75, 1.25, 'leaf')
      block(x - .25, 2.5, z - .25, .75, .5, .75, 'leaf')
    }
    for (const x of [-7.25, -.75, 7.25]) {
      block(x, .5, 1.25, .25, 1.75, .25, '#867c8e')
      block(x - .25, 2.25, 1, .75, .25, .75, '#ffe7b1')
    }
    place = 'School'
    block(-6.75, 3.25, -5.5, 5.25, .25, 2.75, 'snow')
    place = 'Petal Mall'
    block(2, 3.25, -5.75, 5.25, .25, 3.25, 'snow')
    place = 'Willow Apartments'
    block(5.25, 4.25, 2.25, 2.25, .25, 3, 'snow')

    const geometry = new THREE.BoxGeometry(.98, .98, .98)
    const meshes = [], houseMeshes = [], textures = [], labelMaterials = []
    const matrix = new THREE.Matrix4()
    for (const { color, house, place, points } of buckets.values()) {
      const material = new THREE.MeshStandardMaterial({ color: palette[color] || color, roughness: 1 })
      const mesh = new THREE.InstancedMesh(geometry, material, points.length)
      points.forEach(([x, y, z, sx, sy, sz], i) => { matrix.makeScale(sx, sy, sz); matrix.setPosition(x, y, z); mesh.setMatrixAt(i, matrix) })
      mesh.castShadow = true; mesh.receiveShadow = true
      mesh.userData.place = place
      mesh.userData.palette = color
      scene.add(mesh); meshes.push(mesh)
      if (house) houseMeshes.push(mesh)
    }
    function label(text, x, y, z, house = false) {
      const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128
      const context = canvas.getContext('2d')
      context.fillStyle = house ? '#805776' : '#faf2e9'; context.fillRect(0, 0, 512, 128)
      context.font = '600 46px system-ui'; context.textAlign = 'center'; context.textBaseline = 'middle'
      context.fillStyle = house ? '#ffffff' : '#55475d'; context.fillText(text, 256, 64)
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture)
      const material = new THREE.SpriteMaterial({ map: texture, depthTest: false }); labelMaterials.push(material)
      const sprite = new THREE.Sprite(material); sprite.position.set(x, y, z); sprite.scale.set(3.5, .875, 1)
      sprite.renderOrder = 10; scene.add(sprite)
      if (house) { sprite.userData.place = 'Your house'; houseMeshes.push(sprite) }
    }
    label('SCHOOL', -4.25, 5.15, -3.5)
    label('YOUR HOUSE ↗', -5, 4.65, 3.25, true)
    const sunlight = new THREE.DirectionalLight('#fff1d8', 2.4)
    sunlight.position.set(-8, 18, 9); sunlight.castShadow = true
    sunlight.shadow.mapSize.set(2048, 2048)
    Object.assign(sunlight.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19 })
    sunlight.shadow.normalBias = .06
    scene.add(sunlight, new THREE.HemisphereLight('#fff3ef', '#b1a4b8', 2))
    worldRef.current = { scene, meshes, sunlight }
    const raycaster = new THREE.Raycaster()
    function hit(event) {
      const rect = renderer.domElement.getBoundingClientRect()
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1), camera)
      return raycaster.intersectObjects([...meshes, ...houseMeshes.filter((mesh) => mesh.isSprite)].filter((mesh) => mesh.visible), false)[0]?.object.userData.place
    }
    let down
    const pointerDown = (event) => { down = [event.clientX, event.clientY] }
    const pointerUp = (event) => {
      if (down && Math.hypot(event.clientX - down[0], event.clientY - down[1]) < 6 && hit(event) === 'Your house') enterRef.current()
      down = null
      pointerMove(event)
    }
    const hideTooltip = () => { if (tooltipRef.current) tooltipRef.current.hidden = true }
    const pointerMove = (event) => {
      const name = hit(event)
      renderer.domElement.style.cursor = name === 'Your house' ? 'pointer' : 'grab'
      const tooltip = tooltipRef.current
      if (!tooltip) return
      tooltip.hidden = !name || name === 'Your house' || name === 'School' || !!down
      tooltip.textContent = name || ''
      const rect = mount.getBoundingClientRect()
      tooltip.style.left = `${Math.max(8,Math.min(event.clientX-rect.left+14,mount.clientWidth-230))}px`
      tooltip.style.top = `${Math.max(8,event.clientY-rect.top-42)}px`
    }
    controls.addEventListener('change', hideTooltip)
    renderer.domElement.addEventListener('pointerleave', hideTooltip)
    renderer.domElement.addEventListener('pointerdown', pointerDown)
    renderer.domElement.addEventListener('pointerup', pointerUp)
    renderer.domElement.addEventListener('pointermove', pointerMove)
    const shaders = createWorldShaders(renderer, scene, camera, 'neighborhood')
    shadersRef.current = shaders
    const weatherScene = createWeatherScene(scene, false)
    const resize = () => {
      camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight)
      camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight)
      shaders.resize(mount.clientWidth, mount.clientHeight)
    }
    qualityRef.current = (resolution) => { renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * resolution / 100); resize() }
    const observer = new ResizeObserver(resize); observer.observe(mount); resize()
    const street = createStreetView(camera, controls, renderer.domElement, () => exitStreetRef.current())
    streetRef.current = street
    let previousTime = performance.now()
    let frame
    const draw = () => { const now = performance.now(); street.tick(Math.min(.05,(now-previousTime)/1000)); previousTime=now; if (controls.enabled) controls.update(); const current = weatherRef.current; const atmosphere = current ? weatherScene.update(current.weather, current.simulation, current.season) : null; shaders.render(atmosphere); frame = requestAnimationFrame(draw) }; draw()
    return () => {
      street.dispose(); streetRef.current = null
      cameraStateRef.current = { position: camera.position.clone(), target: controls.target.clone() }
      qualityRef.current = null
      cancelAnimationFrame(frame); observer.disconnect(); controls.dispose()
      renderer.domElement.removeEventListener('pointerdown', pointerDown)
      renderer.domElement.removeEventListener('pointerup', pointerUp)
      renderer.domElement.removeEventListener('pointermove', pointerMove)
      renderer.domElement.removeEventListener('pointerleave', hideTooltip)
      controls.removeEventListener('change', hideTooltip)
      hideTooltip()
      geometry.dispose(); meshes.forEach((mesh) => { mesh.dispose(); mesh.material.dispose() })
      textures.forEach((texture) => texture.dispose()); labelMaterials.forEach((material) => material.dispose())
      weatherScene.dispose()
      shaders.dispose(); shadersRef.current = null
      renderer.dispose(); renderer.domElement.remove(); worldRef.current = null
    }
  }, [voxelDensity])

  useEffect(() => {
    const world = worldRef.current
    if (!world) return
    world.scene.background = new THREE.Color(season.sky)
    world.sunlight.color.set(season.light); world.sunlight.intensity = season.intensity
    world.meshes.forEach((mesh) => {
      const key = mesh.userData.palette
      if (key === 'grass') mesh.material.color.set(season.ground)
      if (key === 'leaf') mesh.material.color.set(season.leaves)
      if (key === 'snow') mesh.visible = season.id === 'winter'
      if (key === 'flower') { mesh.visible = season.id !== 'winter'; mesh.material.color.set(season.id === 'autumn' ? '#d79858' : season.id === 'summer' ? '#f3d68c' : '#f1b1c7') }
    })
  }, [season, voxelDensity])

  useEffect(() => { shadersRef.current?.setMode(shaderMode) }, [shaderMode, voxelDensity])

  useEffect(() => { qualityRef.current?.(renderResolution) }, [renderResolution, voxelDensity])

  useEffect(() => { streetRef.current?.setMode(streetView) }, [streetView, voxelDensity])

  return <div ref={mountRef} className="room-canvas" role="group" aria-label={`Voxel neighborhood in ${season.name.toLowerCase()}, with a school, mall, cafés, restaurants, shops, and houses. Hover over buildings to see their names. Use the Enter your room button to go inside.`}>{streetView && <div className="street-controls" aria-label="Street view movement"><span>Street view · Drag to look · WASD to walk · Esc to exit</span><div>{[['left','↶ Turn left'],['forward','↑ Walk forward'],['right','Turn right ↷'],['strafeLeft','← Step left'],['back','↓ Walk back'],['strafeRight','Step right →']].map(([action,label]) => <button key={action} type="button" onClick={() => streetRef.current?.action(action)}>{label}</button>)}</div></div>}<div ref={tooltipRef} className="place-tooltip" role="tooltip" hidden />{unavailable && <p className="graphics-fallback">The neighborhood needs WebGL. Please enable hardware acceleration to view it. You can still choose a season and enter your room.</p>}</div>
}
