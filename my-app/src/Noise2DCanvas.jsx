import { useEffect, useRef } from 'react'
import { layeredNoise } from './noise'

export default function Noise2DCanvas({ layers, resolution }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const size = Math.min(720, Math.max(160, resolution * 2))
    canvas.width = size
    canvas.height = size
    const image = context.createImageData(size, size)
    const palette = [[12, 20, 28], [38, 62, 69], [114, 139, 120], [218, 185, 130], [245, 224, 178]]

    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const value = Math.min(1, Math.max(0, layeredNoise(x / size, y / size, layers)))
        const scaled = value * (palette.length - 1)
        const lower = Math.floor(scaled)
        const upper = Math.min(palette.length - 1, lower + 1)
        const mix = scaled - lower
        const index = (y * size + x) * 4
        image.data[index] = palette[lower][0] + (palette[upper][0] - palette[lower][0]) * mix
        image.data[index + 1] = palette[lower][1] + (palette[upper][1] - palette[lower][1]) * mix
        image.data[index + 2] = palette[lower][2] + (palette[upper][2] - palette[lower][2]) * mix
        image.data[index + 3] = 255
      }
    }
    context.putImageData(image, 0, 0)
  }, [layers, resolution])

  return <canvas ref={canvasRef} className="noise-2d-canvas" aria-label="2D noise preview" />
}