const LATITUDE = 40.7 * Math.PI / 180
const DECLINATION = {
  spring: 0,
  summer: 23.44 * Math.PI / 180,
  autumn: 0,
  winter: -23.44 * Math.PI / 180,
}

export function getSolarState(dayPhase, seasonId) {
  const declination = DECLINATION[seasonId] ?? 0
  const hourAngle = (dayPhase - .5) * Math.PI * 2
  const east = -Math.cos(declination) * Math.sin(hourAngle)
  const north = Math.cos(LATITUDE) * Math.sin(declination) - Math.sin(LATITUDE) * Math.cos(declination) * Math.cos(hourAngle)
  const up = Math.sin(LATITUDE) * Math.sin(declination) + Math.cos(LATITUDE) * Math.cos(declination) * Math.cos(hourAngle)
  const altitude = Math.asin(Math.max(-1, Math.min(1, up)))
  const twilightStart = -6 * Math.PI / 180
  const daylight = Math.max(0, Math.min(1, (altitude - twilightStart) / (12 * Math.PI / 180)))
  const horizonWarmth = 1 - Math.max(0, Math.min(1, altitude / (25 * Math.PI / 180)))

  return {
    direction: { x: east, y: up, z: -north },
    altitude,
    daylight: daylight * daylight * (3 - 2 * daylight),
    horizonWarmth,
    rising: hourAngle < 0,
  }
}
