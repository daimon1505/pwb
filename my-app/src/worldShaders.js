import { Fog } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

export const shaderOptions = [
  { id: 'distance', name: 'Distance-driven', description: 'Soft atmospheric depth. Surfaces fade toward the sky color as they move farther from the camera.' },
  { id: 'ao', name: 'Ambient occlusion', description: 'Broad, soft shading in corners and sheltered spaces brings out the shape of the world.' },
]

// Shared pipeline: distance-based fog or screen-space ambient occlusion.
export function createWorldShaders(renderer, scene, camera, scale) {
  const composer = new EffectComposer(renderer)
  const base = new RenderPass(scene, camera)
  const occlusion = new SSAOPass(scene, camera, 1, 1, 16)
  const output = new OutputPass()
  composer.addPass(base)
  composer.addPass(occlusion)
  composer.addPass(output)
  const fog = new Fog(scene.background || '#cce6ed', scale === 'room' ? 9 : 40, scale === 'room' ? 27 : 105)
  let currentMode

  // Labels are interface overlays, so exclude them from the geometry depth pass.
  const renderOverride = occlusion.renderOverride.bind(occlusion)
  occlusion.renderOverride = (...args) => {
    const labels = []
    scene.traverse((object) => {
      if (object.isSprite && object.visible) { labels.push(object); object.visible = false }
    })
    try { renderOverride(...args) } finally { labels.forEach((label) => { label.visible = true }) }
  }

  return {
    setMode(mode) {
      if (mode === currentMode) return
      currentMode = mode
      scene.fog = mode === 'distance' ? fog : null
      occlusion.enabled = mode !== 'distance'
      const radius = scale === 'room' ? .65 : 1.6
      occlusion.kernelRadius = radius
      // SSAO compares linear depth normalized by the camera's clipping range.
      occlusion.minDistance = .008 / (camera.far - camera.near)
      occlusion.maxDistance = (radius * 1.5) / (camera.far - camera.near)
    },
    resize(width, height) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(Math.max(1, width), Math.max(1, height)) },
    render(atmosphere = null) {
      scene.fog = atmosphere || (currentMode === 'distance' ? fog : null)
      if (scene.background?.isColor) fog.color.copy(scene.background)
      composer.render()
    },
    dispose() {
      scene.fog = null
      occlusion.dispose()
      // These resources are not released by SSAOPass.dispose in this version.
      occlusion.ssaoMaterial.dispose()
      occlusion.noiseTexture.dispose()
      base.dispose(); output.dispose(); composer.dispose()
    },
  }
}
