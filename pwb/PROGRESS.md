# Development progress

Last updated: October 21, 2026

## Completed

- [x] Replaced the dark interface shell with a light pastel theme.
- [x] Added architectural customization for the user's house.
  - One, two, or three stories
  - Gable, flat, or stepped roof
  - No porch, stoop, or covered porch
  - Optional chimney and roof dormer
- [x] Kept house colors fixed to the established neighborhood palette.
- [x] Added a continuous day/night simulation.
  - Five real minutes per simulated day at 1× speed
  - Season-aware daylight duration and solar height
  - Dawn, daylight, dusk, and night lighting transitions
  - Automatic bedroom lamp response after dark
- [x] Added an automatic seasonal calendar.
  - 90 simulated days per season
  - Manual season selection pauses automatic advancement
  - Fast-forwarded days contribute to seasonal progress
- [x] Added an in-game HUD.
  - Circular day/night progress dial without a numeric clock
  - Current season
  - Current day out of 90
  - Seasonal progress bar
- [x] Added time controls.
  - 1×, 5×, 30×, and 120× speeds
  - Half-day skip
  - One-day and seven-day skips
- [x] Added configurable neighborhood streetlights.
  - Automatic dusk-to-dawn, always-on, and always-off modes
  - Warm, rose, and cool light tones
  - Brightness range from 25% to 250%
- [x] Reduced streetlight leakage.
  - Replaced point lights with downward spotlights
  - Enabled and tuned spotlight shadows
  - Tightened light distance and falloff
  - Closed visible voxel shadow seams with slight cube overlap
- [x] Kept seasonal, weather, time, house, and streetlight state synchronized between supported views during the current session.

## Verification

- [x] Production build succeeds with Vite.
- [x] Patch whitespace validation succeeds.
- [ ] Dedicated automated gameplay tests have not been added.
- [ ] Full visual regression coverage has not been added.

The production build currently emits Vite's existing large-bundle advisory because the main JavaScript chunk exceeds 500 kB. This is a performance advisory, not a build failure.

## Remaining limitations

- World state and simulated time reset after a page reload.
- Authentication does not yet save or restore customized worlds.
- Weather remains a visual approximation rather than a full climate simulation.
- Only the bedroom is enterable; other building interiors are not implemented.
- Shadow-casting streetlights increase GPU work at high voxel density or render resolution.
- There is no dedicated automated test suite in `my-app/package.json`.

## Suggested next steps

1. Save house, time, season, weather, and streetlight settings to the signed-in user's profile.
2. Add visual regression snapshots for day, night, each season, and maximum streetlight brightness.
3. Add quality presets that reduce shadow resolution on lower-powered devices.
4. Split the main JavaScript bundle with lazy-loaded scene modules.
