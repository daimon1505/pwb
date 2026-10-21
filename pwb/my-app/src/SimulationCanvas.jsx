import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { layeredNoise } from './noise'

const neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]]

function drawField(context, state) {
  const { size, height, water } = state
  const image = context.createImageData(size, size)
  for (let index = 0; index < height.length; index += 1) {
    const terrain = Math.min(1, Math.max(0, height[index]))
    const wetness = Math.min(1, water[index] * 4)
    const index4 = index * 4
    image.data[index4] = Math.min(255, 12 + terrain * 190 + wetness * 12)
    image.data[index4 + 1] = Math.min(255, 40 + terrain * 150 + wetness * 40)
    image.data[index4 + 2] = Math.min(255, 55 + terrain * 90 + wetness * 105)
    image.data[index4 + 3] = 255
  }
  context.putImageData(image, 0, 0)
}

function simulateStep(state, settings) {
  const { size, height, water, sediment } = state
  const nextWater = new Float32Array(water)
  const nextSediment = new Float32Array(sediment)

  for (let index = 0; index < height.length; index += 1) {
    nextWater[index] += settings.rainfall
    const x = index % size
    const y = Math.floor(index / size)
    let lowestIndex = index
    let lowestLevel = height[index] + water[index]
    for (const [offsetX, offsetY] of neighborOffsets) {
      const neighborX = x + offsetX
      const neighborY = y + offsetY
      if (neighborX < 0 || neighborX >= size || neighborY < 0 || neighborY >= size) continue
      const neighborIndex = neighborY * size + neighborX
      const neighborLevel = height[neighborIndex] + water[neighborIndex]
      if (neighborLevel < lowestLevel) {
        lowestLevel = neighborLevel
        lowestIndex = neighborIndex
      }
    }
    if (lowestIndex !== index && water[index] > 0) {
      const slope = Math.max(0, height[index] + water[index] - lowestLevel)
      const flow = Math.min(water[index] * settings.flow, slope * settings.flow)
      nextWater[index] -= flow
      nextWater[lowestIndex] += flow
      const eroded = Math.min(height[index] * 0.2, flow * settings.erosion)
      height[index] -= eroded
      nextSediment[index] += eroded
    }
  }

  for (let index = 0; index < height.length; index += 1) {
    const capacity = Math.max(0.001, water[index] * settings.capacity)
    if (nextSediment[index] > capacity) {
      const deposited = (nextSediment[index] - capacity) * settings.deposition
      height[index] += deposited
      nextSediment[index] -= deposited
    } else {
      const dissolved = Math.min(height[index] * 0.1, (capacity - nextSediment[index]) * settings.erosion * 0.05)
      height[index] -= dissolved
      nextSediment[index] += dissolved
    }
    nextWater[index] *= 1 - settings.evaporation
  }

  state.water = nextWater
  state.sediment = nextSediment
}

const SimulationCanvas = forwardRef(function SimulationCanvas({ layers, resolution, running, settings }, ref) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)

  useImperativeHandle(ref, () => ({
    getHeightField: () => {
      const state = stateRef.current
      if (!state) return null
      return { size: state.size, values: new Float32Array(state.height) }
    },
  }), [])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const size = Math.min(720, Math.max(160, resolution * 2))
    canvas.width = size
    canvas.height = size
    const height = new Float32Array(size * size)
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) height[y * size + x] = Math.min(1, Math.max(0, layeredNoise(x / size, y / size, layers)))
    }
    stateRef.current = { size, height, water: new Float32Array(size * size), sediment: new Float32Array(size * size) }
    drawField(context, stateRef.current)
  }, [layers, resolution])

  useEffect(() => {
    if (!running) return undefined
    let frameId
    const tick = () => {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      const state = stateRef.current
      if (!context || !state) return
      for (let iteration = 0; iteration < settings.speed; iteration += 1) simulateStep(state, settings)
      drawField(context, state)
      frameId = requestAnimationFrame(tick)
    }
    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [running, settings])

  return <canvas ref={canvasRef} className="simulation-canvas" aria-label="Hydraulic erosion simulation" />
})

export default SimulationCanvas
