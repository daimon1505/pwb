# STYLE GUIDE — Pastel / Girly UI (inspired by TouchDesigner & Max MSP)

Purpose
- Define the visual language for the app: pastel, soft, tactile, and slightly experimental — borrowing layout and modular thinking from TouchDesigner and Max/MSP patching environments.

Principles
- Soft, approachable: pastel hues, gentle contrast, rounded geometry.
- Modular, grid-based layout: panels and nodes that feel like patch boxes.
- Playful yet readable: clear typography, generous spacing, friendly micro-interactions.
- Artistic tools vibe: subtle noise, glow, and layered translucency to evoke creative tools.

Color Palette (primary tokens)
- `--color-bg`: #0B0F14 (deep charcoal base for canvas areas)
- `--color-surface`: #F6F6F8 (light surface for side panels)
- `--color-accent-1`: #FFB6C1 (pastel pink)
- `--color-accent-2`: #FFD8A8 (pastel peach)
- `--color-accent-3`: #CDE7FF (pastel blue)
- `--color-accent-4`: #D8C7FF (lavender)
- `--color-muted`: #A6B0BD (muted gray-blue)
- `--color-white`: #FFFFFF
- `--color-shadow`: rgba(2,6,23,0.6)

Usage notes
- Canvas background: `--color-bg` to maximize focus on visuals.
- Panels & UI surfaces: `--color-surface` with soft drop shadows and 8–12px corner radius.
- Accent colors: use 1–2 accents for primary actions; alternate accents for secondary/experimental controls.

Typography
- Primary UI font: system stack for performance; for headings consider a rounded display (e.g., Poppins) for a girly, soft feel.
- Suggested stack:
  - Heading: `Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` (700)
  - Body: `Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` (400/500)
- Sizes (desktop): H1 20–28px, H2 18px, Body 14–16px, Small 12px.

Components & Tokens
- Buttons
  - Primary: filled with `--color-accent-1`, white text, 10–12px vertical padding, border-radius 10px.
  - Secondary: outline with `--color-muted` and subtle background hover using `--color-accent-3` at 8% opacity.
- Side Panel (controls)
  - Width: 260–320px, background `--color-surface`, padding 12–16px, shadow: 0 6px 18px rgba(0,0,0,0.08).
  - Controls grouped in rounded cards with 8px gap.
- Sliders & Knobs
  - Sliders: pastel track, rounded thumb, 6–10px height; show numeric readout inline.
  - Knobs: circular handles with a soft highlight and subtle inner shadow to look tactile.
- Canvas window
  - Full-bleed section, dark base; overlays (HUD) use translucent panels with soft blur or subtle noise.

Iconography & Imagery
- Use rounded, simplified icons; stroke weight medium (1.5–2px).
- Icons and markers on canvas should use accent colors with slight glow (outer glow 8–12px at low opacity).

Motion & Interaction
- Motion speed: slow and organic. Easing: cubic-bezier(0.22, 1, 0.36, 1) for entrances; linear or slight ease for continuous motion.
- Hover: lift and brighten (transform: translateY(-4px); box-shadow increase).
- Click: quick depress animation (scale 0.98) and immediate tactile feedback.

Textures & Visual Effects
- Subtle grain/noise overlay on canvas to add analog warmth (2–4% opacity).
- Soft glow around highlights (accent color blended additively at low opacity).

Accessibility
- Maintain minimum contrast of 4.5:1 for body text against background where possible — prefer white text on dark canvas (`--color-white` on `--color-bg`).
- Provide keyboard focus styles (outline with `--color-accent-3`).
- Ensure all UI controls are reachable by keyboard and have aria labels.

Three.js Canvas Guidelines
- Use `--color-bg` for renderer clear color.
- Use accent colors for interactive markers and UI overlays.
- Keep camera controls subtle; add a small UI hint in the corner explaining controls (orbit/pan/zoom).

Inspiration & Layout Tips (TouchDesigner / Max MSP)
- Modular panels: arrange control groups as movable, resizable panels that mimic patch nodes.
- Snap-to-grid when rearranging panels; allow stacking and layering.
- Provide a small inspector panel for selected nodes/markers with parameters (this matches Max/MSP patch behavior).

CSS Variables (starter snippet)
```css
:root{
  --color-bg:#0B0F14;
  --color-surface:#F6F6F8;
  --color-accent-1:#FFB6C1;
  --color-accent-2:#FFD8A8;
  --color-accent-3:#CDE7FF;
  --color-accent-4:#D8C7FF;
  --color-muted:#A6B0BD;
  --color-white:#FFFFFF;
  --radius-sm:8px;
  --radius-md:12px;
  --shadow-soft:0 6px 18px rgba(2,6,23,0.12);
}
```

Assets & Exports
- Export icons as 2x PNG and SVG. Provide a small icon set with pastel strokes and filled variants.
- Prepare knob and slider sprites or vector components to ensure crisp scaling.

Deliverables & Next Steps
- Create a Figma page with the color tokens, components (button, panel, slider, knob), and a small layout template for the canvas + side-panel.
- Implement CSS variables in the app and replace hard-coded values.
- Prototype movable panels and knob controls next.

Notes
- This guide favors mood and tactile design over strict minimalism: keep things soft, playful, and modular. Use subtle animation and pastel accents to create an inviting, creative interface.
