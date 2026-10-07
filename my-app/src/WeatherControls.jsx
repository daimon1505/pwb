import ControlSection from './ControlSection'
import { plantCount, simulationAvailable, simulationSeasons } from './weatherSimulation'

function Slider({ label, value, min = 0, max = 1, step = .05, unit = '%', onChange }) {
  return <label className="control"><span>{label}<b>{unit === '%' ? Math.round(value * 100) : value}{unit}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}
export default function WeatherControls({ settings, update, reset, simulation, season }) {
  const slider = (key, label, extra = {}) => <Slider label={label} value={settings[key]} onChange={(value) => update(key, value)} {...extra} />
  const section = (key, title, children) => {
    const available = simulationAvailable(key, season)
    const availability = simulationSeasons[key].join(', ')
    const unavailableLabel = key === 'rain' ? 'Not in winter' : key === 'plants' ? 'Spring & summer only' : 'Winter only'
    return <ControlSection title={title} value={!available ? unavailableLabel : settings[key] ? 'Playing' : 'Paused'}>
      {!available && <p className="weather-help">Available in {availability}. Progress is held until you choose a supported season.</p>}
      <fieldset className="simulation-settings" disabled={!available}>
        <div className="weather-actions"><button type="button" onClick={() => update(key, !settings[key])}>{settings[key] ? 'Pause' : 'Play'} {title.toLowerCase()}</button><button type="button" onClick={() => reset(key)}>Reset {title.toLowerCase()}</button></div>
        {children}
      </fieldset>
    </ControlSection>
  }
  return <ControlSection title="Simulators">
    <p className="weather-help">Each simulation has its own clock, play/pause, and reset. Rain runs in spring, summer, and autumn. Plants grow in spring and summer. Snow and fog are winter-only. Wind is available all year.</p>
    {section('rain', 'Rain', <>
      {slider('rainfall', 'Rain intensity')}
      <p className="weather-help">Water slowly spreads across street tiles. Coverage measures the fraction of the street covered by puddles. Set rain to zero while playing to let them dry.</p>
      <output>Puddle coverage: {(simulation.water * 100).toFixed(1)}%</output>
    </>)}
    {section('snow', 'Snow', <>
      {slider('snowfall', 'Snowfall intensity')}{slider('temperature', 'Temperature', { min: -10, max: 15, step: 1, unit: '°C' })}
      <p className="weather-help">Snow builds on roofs and melts above freezing. Winter’s base snow remains.</p>
      <output>New snow: {Math.round(simulation.snow * 100)}%</output>
    </>)}
    {section('wind', 'Wind', <>
      {slider('windStrength', 'Wind strength')}{slider('direction', 'Wind direction', { min: 0, max: 360, step: 5, unit: '°' })}
      <p className="weather-help">Wind steers falling rain and snow, carries leaves, and sways plants. Play wind alongside rain or snow to see the effect. Pausing wind lets precipitation fall straight down. Direction: 0° east, 90° south, 180° west, 270° north.</p>
    </>)}
    {section('plants', 'Seasonal plant growth', <>
      {slider('growthSpeed', 'Growth speed')}
      <p className="weather-help">New plants gradually appear in garden beds, up to 24. Growth is fastest in spring. At the default spring speed, a new plant appears about every 42 seconds.</p>
      <output>Neighborhood plants: {plantCount(simulation.growth)} / 24</output>
    </>)}
    {section('fog', 'Fog & humidity', <>
      {slider('humidity', 'Humidity')}
      <p className="weather-help">Winter humidity gradually builds mist. Inside, it stays beyond the window.</p>
      <output>Mist: {Math.round(simulation.mist * 100)}%</output>
    </>)}
  </ControlSection>
}
