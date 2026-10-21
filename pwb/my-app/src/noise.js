export function hash2D(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123
  return value - Math.floor(value)
}

export function valueNoise(x, y, octaves, persistence) {
  let value = 0
  let amplitude = 1
  let frequency = 1
  let amplitudeTotal = 0

  for (let octave = 0; octave < octaves; octave += 1) {
    const sampleX = x * frequency
    const sampleY = y * frequency
    const x0 = Math.floor(sampleX)
    const y0 = Math.floor(sampleY)
    const tx = sampleX - x0
    const ty = sampleY - y0
    const smoothX = tx * tx * (3 - 2 * tx)
    const smoothY = ty * ty * (3 - 2 * ty)
    const top = hash2D(x0, y0) * (1 - smoothX) + hash2D(x0 + 1, y0) * smoothX
    const bottom = hash2D(x0, y0 + 1) * (1 - smoothX) + hash2D(x0 + 1, y0 + 1) * smoothX
    value += (top * (1 - smoothY) + bottom * smoothY) * amplitude
    amplitudeTotal += amplitude
    amplitude *= persistence
    frequency *= 2
  }

  return value / amplitudeTotal
}

export function shapeNoise(value, shape) {
  if (shape === 'terraces') return Math.floor(value * 6) / 5
  if (shape === 'islands') return Math.max(0, 1 - Math.abs(value * 2 - 1) * 1.35)
  if (shape === 'ridge') return 1 - Math.abs(value * 2 - 1)
  return value
}

export function layeredNoise(x, y, layers, time = 0) {
  return layers.reduce((result, layer, index) => {
    const sample = shapeNoise(
      valueNoise(x * layer.frequency + time * layer.drift, y * layer.frequency + time * layer.drift, layer.octaves, 0.52),
      layer.shaping,
    )
    const weighted = sample * layer.amplitude * layer.opacity
    if (index === 0) return weighted
    if (layer.blend === 'add') return result + weighted
    if (layer.blend === 'multiply') return result * (weighted + (1 - layer.opacity))
    if (layer.blend === 'max') return Math.max(result, weighted)
    return result * (1 - layer.opacity) + weighted
  }, 0)
}