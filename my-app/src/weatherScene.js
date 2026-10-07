import * as THREE from 'three'
import { plantCount, simulationAvailable } from './weatherSimulation.js'

export function createWeatherScene(scene, room = false) {
  const group = new THREE.Group(); scene.add(group)
  const resources = []
  function mesh(w, h, d, x, y, z, color) {
    const geometry = new THREE.BoxGeometry(w, h, d)
    const material = new THREE.MeshStandardMaterial({ color, roughness: .7 })
    const object = new THREE.Mesh(geometry, material); object.position.set(x, y, z)
    group.add(object); resources.push(geometry, material); return object
  }
  function particles(count, color, size, lines = false) {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * (lines ? 6 : 3)), 3))
    const material = lines ? new THREE.LineBasicMaterial({color, transparent:true, opacity:.65}) : new THREE.PointsMaterial({color, size, transparent:true, opacity:.8})
    const object = lines ? new THREE.LineSegments(geometry, material) : new THREE.Points(geometry, material)
    object.frustumCulled = false
    group.add(object); resources.push(geometry, material)
    return object
  }
  const rain = particles(room ? 110 : 650, '#bfd8ed', .06, true)
  const snow = particles(room ? 80 : 380, '#ffffff', room ? .045 : .11)
  const leaves = particles(room ? 16 : 65, '#dca482', room ? .035 : .12)
  // Equal-area tiles cover the actual cross streets. Partial tiles keep the
  // visible surface area proportional to the coverage readout.
  const streetTiles = []
  for (let x = -12.875; x < 13; x += .25) for (let z = -.625; z < 1.25; z += .25) streetTiles.push([x,z])
  for (let x = -.375; x < 1.25; x += .25) for (let z = -7.625; z < 6.5; z += .25) if(z < -.75 || z > 1.25) streetTiles.push([x,z])
  for (let x = -12.875; x < 13; x += .25) for (let z = -7.625; z < -6.25; z += .25) if (x < -.5 || x > 1.25) streetTiles.push([x,z])
  streetTiles.sort((a,b) => Math.sin(a[0]*17+a[1]*31)-Math.sin(b[0]*17+b[1]*31))
  const puddles = room ? [] : streetTiles.map(([x,z]) => {
    const object = mesh(.25, .014, .25, x, .51, z, '#528ba9')
    object.material.roughness = .12; object.material.metalness = .25
    object.material.emissive.set('#24475a'); object.material.emissiveIntensity = .25
    return object
  })
  const snowcaps = room ? [mesh(2.3, .1, .3, .8, 1.15, -2.9, '#f2f6ff')] : [
    mesh(5.25, .3, 2.75, -4.125, 3.52, -4.125, '#f2f6ff'),
    mesh(5.25, .3, 3.25, 4.625, 3.52, -4.125, '#f2f6ff'),
    mesh(3, .3, 2.5, -5, 3.8, 3.25, '#f2f6ff'),
    mesh(3, .3, 2.5, 3.25, 3.8, 3.25, '#f2f6ff'),
  ]
  snowcaps.forEach((cap) => { cap.userData.baseY = cap.position.y - cap.geometry.parameters.height / 2 })
  const plants = []
  const plantingSites = room ? [] : Array.from({length:24}, (_,i) => [-6.6+(i%12)*.42,.25,5.6+Math.floor(i/12)*.48])
  for (const [x,y,z] of plantingSites) {
    const pot = mesh(.23,.2,.23,x,y+.1,z,'#bd968a'); pot.visible = false
    const plant = new THREE.Group(); plant.position.set(x,y+.2,z); group.add(plant)
    const stem = mesh(.04,.6,.04,0,.3,0,'#789970'); group.remove(stem); plant.add(stem)
    for(let i=0;i<4;i++) {
      const leaf = mesh(.2,.09,.13,(i%2 ? 1 : -1)*.09,.15+i*.1,0,'#9aaa76'); group.remove(leaf); plant.add(leaf)
    }
    const flower = mesh(.16,.13,.16,0,.63,0,'#edb0cd'); group.remove(flower); plant.add(flower)
    plants.push({pot,plant,flower})
  }
  const fog = new THREE.FogExp2('#d2dce6', 0)
  const mist = room ? mesh(2.35,1.65,.015,.8,2,-2.95,'#e1e6ed') : null
  if(mist) { mist.material.transparent = true; mist.material.depthWrite = false }
  const fract = (x) => x - Math.floor(x)
  function animateParticles(object, count, time, speed, windX, windZ, lines = false, driftX = time * windX, driftZ = time * windZ) {
    const data = object.geometry.attributes.position
    const width = room ? 2.2 : 26, height = room ? 1.55 : 8, depth = room ? .13 : 18
    for(let i=0;i<count;i++) {
      const x = fract(i*.618 + driftX/width)*width + (room ? -.3 : -13)
      const y = fract(i*.371-time*speed/height)*height + (room ? 1.2 : .6)
      const z = fract(i*.713 + driftZ/depth)*depth + (room ? -3.15 : -11.5)
      data.setXYZ(i*(lines?2:1),x,y,z)
      if(lines) data.setXYZ(i*2+1,x-windX*.06,y+speed*.06,z-windZ*.06)
    }
    data.needsUpdate = true
  }
  return {
    update(settings, state, season) {
      const wind = state.windTime > 0 ? settings.windStrength : 0
      const angle = settings.direction*Math.PI/180
      const wx = Math.cos(angle)*wind*2, wz = Math.sin(angle)*wind*2
      rain.visible = simulationAvailable('rain', season.id) && state.rainTime > 0; snow.visible = season.id === 'winter' && state.snowTime > 0; leaves.visible = state.windTime > 0
      const rainCount = Math.round((room?110:650)*settings.rainfall)
      rain.geometry.setDrawRange(0,rainCount*2)
      animateParticles(rain,rainCount,state.rainTime,room?1.4:7,state.rainVelocityX ?? 0,state.rainVelocityZ ?? 0,true,state.rainDriftX ?? 0,state.rainDriftZ ?? 0)
      const snowCount = Math.round((room?80:380)*settings.snowfall)
      snow.geometry.setDrawRange(0,snowCount)
      animateParticles(snow,snowCount,state.snowTime,room?.25:1,state.snowVelocityX ?? 0,state.snowVelocityZ ?? 0,false,state.snowDriftX ?? 0,state.snowDriftZ ?? 0)
      animateParticles(leaves,room?16:65,state.windTime,.12,wx,wz)
      puddles.forEach((puddle,i) => { const fill = Math.max(0, Math.min(1, state.water*puddles.length-i)); puddle.visible=fill>0; puddle.scale.set(Math.sqrt(fill),1,Math.sqrt(fill)) })
      snowcaps.forEach((cap) => {cap.visible=season.id==='winter' && state.snow>.005; cap.scale.y=state.snow; cap.position.y=cap.userData.baseY+cap.geometry.parameters.height*state.snow/2})
      plants.forEach(({pot,plant,flower},i) => {
        pot.visible=plant.visible=i<plantCount(state.growth,plants.length)
        plant.scale.setScalar(.8 + .2 * Math.min(1, Math.max(0, state.growth*plants.length-i-1)))
        plant.rotation.z=Math.sin(state.windTime*2+i)*wind*.16
        flower.visible=state.growth>.45 && season.id!=='winter'
        plant.children.slice(1,5).forEach((leaf) => leaf.material.color.set(season.leaves))
      })
      if(mist) {mist.visible=season.id==='winter' && state.mist>.01; mist.material.opacity=state.mist*.65}
      fog.color.set(season.sky); fog.density=state.mist*.025
      return !room && season.id==='winter' && state.mist>.01 ? fog : null
    },
    dispose() {scene.remove(group); resources.forEach((resource) => resource.dispose())},
  }
}
