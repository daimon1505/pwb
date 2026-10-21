export const initialWeather = {
  rain: false, rainfall: .6, snow: false, snowfall: .5, temperature: -2,
  wind: false, windStrength: .5, direction: 45,
  plants: false, growthSpeed: .5, fog: false, humidity: .7,
}
export const initialSimulation = { rainTime: 0, snowTime: 0, windTime: 0, plantsTime: 0, fogTime: 0, rainDriftX: 0, rainDriftZ: 0, rainVelocityX: 0, rainVelocityZ: 0, snowDriftX: 0, snowDriftZ: 0, snowVelocityX: 0, snowVelocityZ: 0, water: 0, snow: 0, growth: 0, mist: 0 }
const clamp = (value) => Math.max(0, Math.min(1, value))
export const simulationSeasons = {
  rain: ['spring', 'summer', 'autumn'],
  snow: ['winter'],
  wind: ['spring', 'summer', 'autumn', 'winter'],
  plants: ['spring', 'summer'],
  fog: ['winter'],
}
export const simulationAvailable = (key, season) => simulationSeasons[key]?.includes(season) ?? false
export const plantCount = (growth, maximum = 24) => Math.min(maximum, Math.floor(growth * maximum))
export function resetSimulation(state, key) {
  const fields = { rain: ['rainTime', 'water', 'rainDriftX', 'rainDriftZ', 'rainVelocityX', 'rainVelocityZ'], snow: ['snowTime', 'snow', 'snowDriftX', 'snowDriftZ', 'snowVelocityX', 'snowVelocityZ'], wind: ['windTime'], plants: ['plantsTime', 'growth'], fog: ['fogTime', 'mist'] }
  const next = { ...state }
  fields[key].forEach((field) => { next[field] = initialSimulation[field] })
  return next
}

// Independent clocks and accumulators: pausing or resetting one cannot change another.
export function stepWeather(state, settings, season, dt) {
  const next = { ...state }
  for (const key of ['rain', 'snow', 'wind', 'plants', 'fog']) {
    if (settings[key] && simulationAvailable(key, season)) next[`${key}Time`] += dt
  }
  // Integrate displacement instead of multiplying elapsed time by the current
  // wind: turning the wind changes the trajectory without teleporting particles.
  const angle = settings.direction * Math.PI / 180
  const windSpeed = settings.wind ? settings.windStrength * 4 : 0
  for (const key of ['rain', 'snow']) {
    if (!settings[key] || !simulationAvailable(key, season)) continue
    const response = key === 'snow' ? .8 : 1
    next[`${key}VelocityX`] = Math.cos(angle) * windSpeed * response
    next[`${key}VelocityZ`] = Math.sin(angle) * windSpeed * response
    next[`${key}DriftX`] = (state[`${key}DriftX`] ?? 0) + next[`${key}VelocityX`] * dt
    next[`${key}DriftZ`] = (state[`${key}DriftZ`] ?? 0) + next[`${key}VelocityZ`] * dt
  }
  if (settings.rain && simulationAvailable('rain', season)) next.water = clamp(state.water + dt * (settings.rainfall * .004 - .0006))
  if (settings.snow && season === 'winter') next.snow = clamp(state.snow + dt * (settings.snowfall * .025 - Math.max(0, settings.temperature) * .0015))
  if (settings.plants && simulationAvailable('plants', season)) {
    const factor = { spring: 1, summer: .8, autumn: .4, winter: .15 }[season] ?? 1
    next.growth = clamp(state.growth + settings.growthSpeed * factor * .002 * dt)
  }
  if (settings.fog && season === 'winter') next.mist = clamp(state.mist + (settings.humidity - state.mist) * Math.min(1, dt * .4))
  return next
}
