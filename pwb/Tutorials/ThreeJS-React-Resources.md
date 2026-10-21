# Three.js + React — Resources (combined)

This single-file resource collects beginner-friendly links, quick reference notes, examples to try, and setup commands for using Three.js with React.

## Quick Links
- Official Three.js docs: https://threejs.org/docs/
- Three.js fundamentals: https://threejsfundamentals.org/
- React Three Fiber (R3F): https://docs.pmnd.rs/react-three-fiber/getting-started/introduction
- @react-three/drei helpers: https://github.com/pmndrs/drei
- Three.js examples & editor: https://threejs.org/examples/
- GLTF tools: https://gltf.io/ and https://github.com/KhronosGroup/glTF
- Bruno Simon (interactive course): https://threejs-journey.com/
- Discover three.js (tutorial book): https://discoverthreejs.com/

## Cheatsheet — Common Patterns

Scene setup (plain Three.js)
```js
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(width, height)
mount.appendChild(renderer.domElement)
```

React integration tips (plain Three.js)
- Create renderer and scene inside `useEffect` and append `renderer.domElement` to a `ref`.
- On cleanup, dispose renderer, geometries, materials, remove event listeners.

React Three Fiber quick install
```bash
npm install three @react-three/fiber @react-three/drei
```

R3F basic scene (JSX)
```jsx
import { Canvas } from '@react-three/fiber'
function Scene(){
  return (
    <Canvas>
      <ambientLight />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </Canvas>
  )
}
```

Common helpers
- OrbitControls: `three/examples/jsm/controls/OrbitControls` or `drei`'s `<OrbitControls />`.
- GLTFLoader: `three/examples/jsm/loaders/GLTFLoader` or `drei`'s `useGLTF`.
- Postprocessing: `postprocessing` or `@react-three/postprocessing`.

Performance tips
- Use `requestAnimationFrame` only when needed; pause renders when tab inactive.
- Reuse geometries and materials; call `.dispose()` when removing.
- Use lower poly counts for mobile and LOD for complex scenes.

## Examples to Try

1) Rotating cube (plain Three.js)
- Use your `src/ThreeCanvas.jsx` as a starting point — change material and add UI controls.

2) React Three Fiber (R3F) version
- Recreate the cube using R3F's `<Canvas>` and `<mesh>` JSX.

3) GLTF model viewer
- Load a `.glb` model with `GLTFLoader` or `useGLTF` and add orbit controls.

4) Particle field
- Use `Points` with a `BufferGeometry` and animate positions in shader or JS.

5) Post-processing
- Add bloom, vignette, and color grading using postprocessing libraries.

6) Interactive globe
- Use `SphereGeometry`, map textures, and raycast markers (see `GeoCanvas` for a start).

7) Audio-reactive visuals
- Use the WebAudio API analyser and feed values to shaders or object transforms.

## Setup & Commands

Create a Vite + React app (if needed):
```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```

Install Three.js and helpers:
```bash
npm install three
# or for React Three Fiber
npm install three @react-three/fiber @react-three/drei
```

Start dev server:
```bash
npm run dev
```

Project tips
- For R3F prefer `Canvas` for declarative scenes and `drei` for helpers.
- Keep assets in `public/` or `src/assets/` for Vite.

## How to Use These Resources
- Read the links for guided tutorials and deeper reference.
- Use the cheatsheet for quick patterns while coding.
- Try examples locally in your `my-app` project; copy small components to experiment.

If you'd like, I can add runnable mini-examples in the repo (R3F cube, GLTF viewer) and wire npm scripts so you can open each example quickly. Tell me which examples you want first.
