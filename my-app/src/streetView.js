import { Vector3 } from 'three'

// Keep the camera on connected streets, clear of buildings and the map edge.
export function isWalkable(x, z) {
  if (x < -12.6 || x > 12.6 || z < -7.5 || z > 6.1) return false
  return (z >= -.5 && z <= 1) || (x >= -.25 && x <= 1) || (z >= -7.5 && z <= -6.5)
}

export function createStreetView(camera, controls, canvas, exit) {
  let active = false, yaw = 0, pitch = 0, drag = null, overview
  const keys = new Set()
  const originalTouchAction = canvas.style.touchAction
  canvas.tabIndex = 0
  canvas.setAttribute('aria-label', 'Neighborhood preview. In street view, use W A S D to walk, arrow keys to turn, and Escape to exit.')
  function look() {
    camera.lookAt(camera.position.clone().add(new Vector3(Math.sin(yaw)*Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw)*Math.cos(pitch))))
  }
  function move(forward, side) {
    const x = camera.position.x + Math.sin(yaw)*forward + Math.cos(yaw)*side
    const z = camera.position.z - Math.cos(yaw)*forward + Math.sin(yaw)*side
    if (isWalkable(x, camera.position.z)) camera.position.x = x
    if (isWalkable(camera.position.x, z)) camera.position.z = z
    look()
  }
  function action(name) {
    if (!active) return
    if (name === 'left') yaw -= .25
    if (name === 'right') yaw += .25
    if (name === 'forward') move(.65, 0)
    if (name === 'back') move(-.65, 0)
    if (name === 'strafeLeft') move(0, -.65)
    if (name === 'strafeRight') move(0, .65)
    look()
  }
  const keyDown = (event) => {
    if (!active) return
    if (event.key === 'Escape') { event.preventDefault(); exit(); return }
    const key = event.key.toLowerCase()
    if (['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'].includes(key)) {event.preventDefault(); keys.add(key)}
  }
  const keyUp = (event) => keys.delete(event.key.toLowerCase())
  const clear = () => { keys.clear(); drag = null }
  const down = (event) => { if (active && event.button === 0) {canvas.focus({preventScroll:true}); drag = [event.clientX,event.clientY]; canvas.setPointerCapture(event.pointerId)} }
  const up = () => { drag = null }
  const pointerMove = (event) => {
    if (!active || !drag) return
    yaw -= (event.clientX-drag[0])*.004
    pitch = Math.max(-.65,Math.min(.65,pitch-(event.clientY-drag[1])*.004))
    drag = [event.clientX,event.clientY]; look()
  }
  canvas.addEventListener('keydown',keyDown); canvas.addEventListener('keyup',keyUp)
  canvas.addEventListener('blur',clear); window.addEventListener('blur',clear)
  canvas.addEventListener('pointerdown',down); canvas.addEventListener('pointermove',pointerMove)
  canvas.addEventListener('pointerup',up); canvas.addEventListener('pointercancel',clear)
  return {
    setMode(enabled) {
      if (active === enabled) return
      keys.clear(); drag = null
      active = enabled
      controls.enabled = !enabled
      if (enabled) {
        overview = {position:camera.position.clone(),target:controls.target.clone(),fov:camera.fov}
        camera.position.set(-5,1.9,.6); yaw = 0; pitch = 0; camera.fov = 65
        canvas.style.touchAction = 'none'; look(); canvas.focus({preventScroll:true})
      } else if (overview) {
        camera.position.copy(overview.position); controls.target.copy(overview.target); camera.fov = overview.fov
        canvas.style.touchAction = originalTouchAction; controls.update()
      }
      camera.updateProjectionMatrix()
    },
    action,
    tick(dt) {
      if (!active) return
      if (keys.has('arrowleft')) yaw -= dt*1.6
      if (keys.has('arrowright')) yaw += dt*1.6
      let forward = Number(keys.has('w')||keys.has('arrowup'))-Number(keys.has('s')||keys.has('arrowdown'))
      let side = Number(keys.has('d'))-Number(keys.has('a'))
      const length = Math.max(1,Math.hypot(forward,side))
      move(forward/length*dt*2.5,side/length*dt*2.5)
    },
    dispose() {
      this.setMode(false)
      canvas.removeEventListener('keydown',keyDown); canvas.removeEventListener('keyup',keyUp)
      canvas.removeEventListener('blur',clear); window.removeEventListener('blur',clear)
      canvas.removeEventListener('pointerdown',down); canvas.removeEventListener('pointermove',pointerMove)
      canvas.removeEventListener('pointerup',up); canvas.removeEventListener('pointercancel',clear)
    },
  }
}
