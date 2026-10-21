# Noise Equations

This document describes the procedural noise used by the 2D and 3D screens in `my-app`.

## Shared Noise Function

Both screens use the same deterministic value-noise function. For a sample position `(x, y)`, the generator:

1. Finds the four corners of the grid cell containing the sample.
2. Generates a repeatable pseudo-random value at each corner with a 2D hash.
3. Smoothly interpolates between the four corner values.
4. Repeats that process across multiple octaves.
5. Averages the octave values into a final value between `0` and `1`.

The hash is deterministic, so the same coordinates always produce the same terrain:

```text
hash(x, y) = fract(sin(127.1x + 311.7y) * 43758.5453123)
```

The interpolation uses a smoothstep curve:

```text
smooth(t) = t²(3 - 2t)
```

This removes hard transitions between grid cells and creates continuous terrain.

## Octaves

An octave is another layer of noise sampled at a higher frequency and lower amplitude.

```text
noise(x, y) =
  (n₀ × 1.00 + n₁ × 0.52 + n₂ × 0.52² + ...) /
  (1.00 + 0.52 + 0.52² + ...)
```

- **Frequency** controls how many large or small features appear across the screen.
- **Octaves** controls how many detail passes are combined.
- Each octave doubles the sampling frequency.
- Each octave uses `0.52` of the previous octave's amplitude.
- More octaves create finer surface detail, while fewer octaves create broader shapes.

## Shaping Operations

After the noise value is calculated, a shaping operation remaps its range. The selected operation is applied in both the 2D and 3D screens.

### Natural

```text
shape(v) = v
```

Keeps the original smooth value-noise distribution. This is the most general-purpose terrain shape.

### Ridge

```text
shape(v) = 1 - |2v - 1|
```

Reflects values around the midpoint. Low and high values move toward the center, producing narrow ridges and sharper repeating peaks.

### Terraces

```text
shape(v) = floor(6v) / 5
```

Quantizes the noise into visible height bands. In 3D this creates step-like plateaus; in 2D it produces contour-like regions.

### Islands

```text
shape(v) = max(0, 1 - |2v - 1| × 1.35)
```

Compresses the outer parts of the range toward zero. This emphasizes central land masses and creates darker, lower boundaries that read like water around islands.

## Amplitude

Amplitude controls how strongly the final noise value affects the result.

```text
height = (shape(noise(x, y)) - 0.5) × amplitude × 1.8
```

- In the 2D screen, amplitude changes the brightness range of the color map.
- In the 3D screen, amplitude changes the vertical displacement of the plane.
- Higher values create stronger contrast and taller terrain.

## 2D Screen

The 2D screen samples the noise across a square raster. Each normalized pixel coordinate is evaluated with the shared equation, then converted into a color using a terrain palette.

The 2D preview is useful for seeing:

- Large-scale frequency patterns
- Fine octave detail
- Terrace bands
- Ridge structures
- Island boundaries

The grid resolution controls the raster size used to calculate the preview. Higher resolution gives more samples and finer visual detail but requires more computation.

## 3D Screen

The 3D screen uses the same noise values to displace the vertices of a subdivided plane.

```text
vertex.z = (shape(noise(x, y)) - 0.5) × amplitude × 1.8
```

The plane is rotated into a terrain view and can be orbited with the mouse or trackpad. Its vertex colors are also derived from the normalized noise height:

- Deep blue: low areas and water
- Teal: lower vegetation zones
- Gold: mid-elevation terrain
- Orange: higher rock zones
- Pale cream: peaks and high elevation

This means changing frequency, octaves, amplitude, resolution, or shaping changes both the geometry and the terrain colors.

## Resolution

Resolution controls the number of subdivisions used by the previews.

- In 2D, it controls the number of raster samples.
- In 3D, it controls the number of plane segments and therefore the number of terrain vertices.
- Higher resolution produces smoother 3D terrain and more detailed 2D output.
- Lower resolution is faster and makes the grid structure more apparent.

## Relationship Between the Screens

The 2D and 3D screens are two views of the same procedural field:

```text
(x, y) -> value noise -> octaves -> shaping -> amplitude
                                      |              |
                                      v              v
                              2D color map     3D vertex height
```

If a feature appears at a particular position in the 2D map, the corresponding feature appears in the same position on the 3D plane when viewed from above.
