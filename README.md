# The season you call home

**Start here: [World Rules — illustrated guide](my-app/WORLD_RULES.md)** · Places, controls, seasons, and simulation behavior.

A pastel, shoujo-inspired worldbuilding prototype built with React, Vite, and Three.js. Explore a voxel neighborhood, walk its streets, enter your bedroom, and experiment with seasons, weather, plants, and rendering styles.

## Features

- A neighborhood with a school, mall, café, noodle restaurant, bakery, bookshop, florist, boutique, houses, and apartments.
- Permanent school and home signs, plus hover names for other buildings.
- An enterable bedroom with seasonal lighting, bedding, and decorations.
- Neighborhood overview and ground-level street view.
- Spring, summer, autumn, and winter presets shared across views.
- Independent rain, snow, wind, plant-growth, and fog/humidity simulations with play/pause and reset.
- Voxel-density and render-resolution sliders.
- Distance-driven and ambient-occlusion shader options.
- Collapsible control sections.
- Firebase email/password authentication and basic user profiles.

The neighborhood is constructed procedurally from a fixed layout. This is an exploration and simulation prototype; NPC stories, quests, shopping, and other building interiors are not implemented.

## Run locally

### Requirements

- Node.js 20.19+ within the 20.x series, or Node.js 22.12+ (as required by the installed Vite version).
- npm.
- A browser with WebGL support.
- Firebase web-app configuration for the current startup code, which initializes Firebase unconditionally.

From the repository root:

```sh
cd my-app
npm ci
```

Create `.env.local` inside `my-app` using your Firebase web-app configuration:

```dotenv
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-web-app-id
```

Use the values supplied by your Firebase project. `.env.local` is ignored by Git. `VITE_` values are included in the browser bundle; do not put service-account credentials or other server secrets in them.

For account features, enable Email/Password sign-in, authorize your local development hostname in Firebase Authentication, and configure Firestore access for the user profile documents. The app also initializes a Storage client, although file uploads are not part of the current world interface.

Start the development server:

```sh
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. Restart Vite after changing environment variables. Exploring the world does not require signing in, but the current app still needs valid Firebase configuration to initialize.

## Controls

| Mode / control | Action |
| --- | --- |
| Overview or room: drag | Orbit the camera |
| Overview or room: scroll | Zoom |
| Click your house or its sign | Enter your room |
| Enter your room / Neighborhood | Switch between inside and outside |
| Hover over another building | Show its name |
| Enter street view | Switch to ground level |
| Street view: drag | Look around |
| Street view: W/S or Up/Down | Walk forward/backward |
| Street view: A/D | Step sideways |
| Street view: Left/Right | Turn |
| Street view: on-screen buttons | Move or turn without a keyboard |
| Escape with preview focused / Exit street view | Restore the overview |
| Section heading or +/− | Open or minimize controls |

Click the preview to focus keyboard movement after using another control. Street movement stays within connected road corridors.

## Seasons and simulations

| Simulation | Available seasons |
| --- | --- |
| Rain | Spring, summer, autumn |
| Snow | Winter |
| Wind | All seasons |
| Plant growth | Spring, summer |
| Fog & humidity | Winter |

Each simulation starts paused. Play advances its own clock; pause holds its current result. Reset clears and pauses only that simulation while retaining its slider settings. Unsupported seasons disable controls and hold progress until a supported season returns.

- **Rain:** slowly fills visible street puddles. Set intensity to zero while playing to dry them.
- **Snow:** adds snow layers; temperatures above freezing introduce melting. Winter’s preset snow remains after reset.
- **Wind:** steers playing rain and snow, carries leaves, and sways plants.
- **Plant growth:** adds up to 24 neighborhood plants. At the default 50% speed, one plant appears about every 42 seconds in spring or 52 seconds in summer. There are no simulated room plants.
- **Fog/humidity:** gradually builds or clears winter mist. The room shows mist beyond its window.

Seasons, rendering settings, and simulation progress carry between views during the page session. Reloading resets the world; authentication does not provide world save/load.

## Rendering controls

| Setting | Range / options | Default |
| --- | --- | --- |
| Voxel density | 1×–4×; neighborhood geometry only | 2× |
| Render resolution | 25%–150%; both views | 100% |
| Shader | Distance-driven, ambient occlusion | Distance-driven |

Higher density uses more geometry; higher resolution uses more rendering resources. Distance-driven atmospheric fading is available in every season and is separate from the winter-only fog simulation.

## Development commands

Run these from `my-app`:

```sh
npm run dev      # Development server
npm run build    # Production output in dist/
npm run preview  # Serve the production build locally
npm run lint     # ESLint across the project
```

There is no dedicated automated test script in `my-app/package.json` yet. The build currently emits a large-bundle advisory. Full-project lint has previously reported unused variables and empty catch blocks in the legacy `my-app/src/GeoCanvas.jsx`; it is not used by the current world interface.

`my-app/firebase.json` configures Firebase Hosting to serve `dist/` with an SPA fallback to `index.html`. Building does not deploy the site.

## Project structure

| Path | Purpose |
| --- | --- |
| `my-app/src/App.jsx` | Shared state, navigation, update loop, control layout |
| `my-app/src/NeighborhoodCanvas.jsx` | Voxel buildings, labels, picking, overview rendering |
| `my-app/src/RoomCanvas.jsx` | Bedroom scene and seasonal furnishings |
| `my-app/src/streetView.js` | Ground-level navigation and movement boundaries |
| `my-app/src/seasons.js` | Seasonal palettes and descriptions |
| `my-app/src/weatherSimulation.js` | Availability, clocks, rates, and reset rules |
| `my-app/src/weatherScene.js` | Visual weather, puddles, snow layers, and plants |
| `my-app/src/WeatherControls.jsx` | Simulation controls and readouts |
| `my-app/src/worldShaders.js` | Shared rendering effects |
| `my-app/src/ControlSection.jsx` | Collapsible sections |
| `my-app/src/firebase.js`, `my-app/src/auth.js`, `my-app/src/profile.js` | Firebase setup, authentication, and profiles |
| `my-app/src/App.css`, `my-app/src/index.css` | Interface styling |
| `my-app/WORLD_RULES.md` | Detailed current world rules |
| `STYLE-GUIDE.md` | Repository visual style guide |

Legacy terrain/noise components remain in the source tree but are not part of the current interface.

## Current limitations

- No saved worlds, offline simulation progress, automatic season cycle, or day/night cycle.
- Weather is a simplified visual model, not a full fluid, climate, or ecosystem simulation.
- Rain and humidity do not currently affect plant growth; humidity does not alter puddle drying.
- Simulated extra snow layers cover selected original buildings, not every expanded-neighborhood roof.
- High-density street blocks can show patchiness from small voxel gaps, overlapping geometry, or occlusion. Continuous-road cleanup is not implemented.

Keep this README focused on getting started. Update [WORLD_RULES.md](my-app/WORLD_RULES.md) when behavior changes.
