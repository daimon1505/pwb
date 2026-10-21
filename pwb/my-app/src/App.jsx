import { useState, useEffect, useRef } from 'react'
import './App.css'
import ControlSection from './ControlSection'
import WeatherControls from './WeatherControls'
import { initialWeather, initialSimulation, stepWeather, resetSimulation } from './weatherSimulation'
import RoomCanvas from './RoomCanvas'
import NeighborhoodCanvas from './NeighborhoodCanvas'
import { seasons } from './seasons'
import { shaderOptions } from './worldShaders'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { createUserProfile } from './profile'
import { signUp, signIn, logOut } from './auth'
import { getSolarState } from './solarCycle'

const DAY_DURATION_MS = 5 * 60 * 1000

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [seasonIndex, setSeasonIndex] = useState(0)
  const [autoSeasons, setAutoSeasons] = useState(true)
  const [dayPhase, setDayPhase] = useState(.34)
  const [seasonDay, setSeasonDay] = useState(1)
  const [timeSpeed, setTimeSpeed] = useState(1)
  const simulatedDaysRef = useRef(.34)
  const seasonEpochRef = useRef(0)
  const [voxelDensity, setVoxelDensity] = useState(2)
  const [renderResolution, setRenderResolution] = useState(100)
  const [houseOptions, setHouseOptions] = useState({
    stories: 2,
    roofStyle: 'gable',
    porchStyle: 'stoop',
    chimney: true,
    dormer: false,
  })
  const [streetLightOptions, setStreetLightOptions] = useState({ behavior: 'automatic', tone: 'warm', brightness: 70 })
  const [shaderSelection, setShaderMode] = useState('distance')
  const shaderMode = shaderOptions.some((option) => option.id === shaderSelection) ? shaderSelection : 'distance'
  const [weather, setWeather] = useState(initialWeather)
  const [simulation, setSimulation] = useState(initialSimulation)
  const [streetView, setStreetView] = useState(false)
  const [view, setView] = useState('neighborhood')
  const season = seasons[seasonIndex]
  const solarState = getSolarState(dayPhase, season.id)
  const timeOfDay = solarState.altitude > 6 * Math.PI / 180 ? 'Day' : solarState.altitude > -6 * Math.PI / 180 ? (solarState.rising ? 'Dawn' : 'Dusk') : 'Night'
  const [user, setUser] = useState(null)
  const updateHouse = (key, value) => setHouseOptions((current) => ({ ...current, [key]: value }))
  const updateStreetLights = (key, value) => setStreetLightOptions((current) => ({ ...current, [key]: value }))
  const syncSimulationClock = (totalDays) => {
    setDayPhase(((totalDays % 1) + 1) % 1)
    setSeasonDay(Math.floor(totalDays) % 90 + 1)
    const epoch = Math.floor(totalDays / 90)
    if (autoSeasons && epoch !== seasonEpochRef.current) {
      const steps = epoch - seasonEpochRef.current
      setSeasonIndex((current) => ((current + steps) % seasons.length + seasons.length) % seasons.length)
    }
    seasonEpochRef.current = epoch
  }
  const fastForwardDays = (days) => {
    simulatedDaysRef.current += days
    syncSimulationClock(simulatedDaysRef.current)
  }

useEffect(() => {
  let previous = performance.now()
  const timer = setInterval(() => {
    const now = performance.now()
    const dt = Math.min(.25, (now - previous) / 1000)
    previous = now
    setSimulation((current) => stepWeather(current, weather, season.id, dt))
  }, 100)
  return () => clearInterval(timer)
}, [weather, season.id])

useEffect(() => {
  let previous = performance.now()
  const updateClock = () => {
    const now = performance.now()
    simulatedDaysRef.current += ((now - previous) / DAY_DURATION_MS) * timeSpeed
    previous = now
    syncSimulationClock(simulatedDaysRef.current)
  }
  const timer = setInterval(updateClock, 200)
  return () => clearInterval(timer)
}, [timeSpeed, autoSeasons])

async function handleAuthentication(action) {
  setAuthError('')
  setAuthBusy(true)

  try {
    await action(email.trim(), password)
    setPassword('')
  } catch (error) {
    setAuthError(error.message)
  } finally {
    setAuthBusy(false)
  }
}

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser)

    if (currentUser) {
      createUserProfile(currentUser).catch((error) => {
    console.error('Could not create user profile:', error)
  })
    }
  })

  return unsubscribe
}, [])

  return (
    <div className="app-root">
      <header className="app-header">
        <div><p className="eyebrow">Small worlds / 01</p><h1>The season you call home</h1></div>
        <span className="status-pill">
        <i />
        {user ? `Signed in as ${user.email}` : 'Not signed in'}
      </span>
        
      </header>
      <section className="auth-panel">
  {user ? (
    <button
      type="button"
      disabled={authBusy}
      onClick={() => handleAuthentication(logOut)}
    >
      Sign out
    </button>
  ) : (
    <div>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <button
        type="button"
        disabled={authBusy || !email.trim() || !password}
        onClick={() => handleAuthentication(signUp)}
      >
        Create account
      </button>

      <button
        type="button"
        disabled={authBusy || !email.trim() || !password}
        onClick={() => handleAuthentication(signIn)}
      >
        Sign in
      </button>
    </div>
  )}

  {authBusy && <p>Working…</p>}
  {authError && <p role="alert">{authError}</p>}
</section>
      <div className="app-body">
        <main className="canvas-area">
          <div className="canvas-heading"><div><span className="section-label">Your little world</span><strong>{view === 'room' ? 'Your room' : 'Your neighborhood'}</strong></div><span className="resolution-readout">{season.name} · {timeOfDay}</span></div>
          <nav className="world-navigation" aria-label="Explore your world"><button type="button" aria-pressed={view === 'neighborhood'} onClick={() => setView('neighborhood')}>← Neighborhood</button><button type="button" aria-pressed={view === 'room'} onClick={() => setView('room')}>Enter your room ↗</button>{view === 'neighborhood' && <button type="button" aria-pressed={streetView} onClick={() => setStreetView(!streetView)}>{streetView ? 'Exit street view' : 'Enter street view'}</button>}</nav>
          <div className="preview-stage">
            {view === 'room' ? <RoomCanvas dayPhase={dayPhase} renderResolution={renderResolution} weather={weather} simulation={simulation} shaderMode={shaderMode} season={season} /> : <NeighborhoodCanvas dayPhase={dayPhase} houseOptions={houseOptions} streetLightOptions={streetLightOptions} streetView={streetView} onExitStreet={() => setStreetView(false)} voxelDensity={voxelDensity} renderResolution={renderResolution} weather={weather} simulation={simulation} shaderMode={shaderMode} season={season} onEnterRoom={() => setView('room')} />}
            <div className={`world-hud ${timeOfDay.toLowerCase()}`} role="status" aria-live="polite" aria-label={`${season.name}, day ${seasonDay} of 90, ${timeOfDay}, ${Math.round(dayPhase * 100)} percent through the day and night cycle`}>
              <div className="hud-cycle" title={`${timeOfDay} · ${Math.round(dayPhase * 100)}% through the cycle`}>
                <div className="day-cycle-ring">
                  <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" pathLength="100" style={{ strokeDashoffset: 100 - dayPhase * 100 }} /></svg>
                  <span aria-hidden="true">{timeOfDay === 'Night' ? '☾' : timeOfDay === 'Day' ? '☀' : '◐'}</span>
                </div>
                <small>{timeOfDay}</small>
              </div>
              <div className="hud-divider" />
              <div className="hud-season"><span className="hud-season-symbol" aria-hidden="true">{season.symbol}</span><span><strong>{season.name}</strong><small>Day {seasonDay} of 90</small></span></div>
              <div className="hud-season-track" aria-hidden="true"><i style={{ width: `${seasonDay / 90 * 100}%` }} /></div>
            </div>
          </div>
          <div className="canvas-footer"><span>{view === 'neighborhood' && streetView ? 'Drag to look · WASD / arrows to move · Esc to exit' : 'Drag to look around · Scroll to zoom'}</span><span>{view === 'room' ? 'Home, sweet home' : 'Hover for place names · Click your house to enter'}</span></div>
        </main>
        <aside className="side-panel">
          <div className="panel-title"><span className="section-label">World building</span><h2>A neighborhood of your own</h2></div>
          <p className="panel-intro">School mornings, afternoons at the mall, and a room to come home to. Explore your little voxel neighborhood through the seasons.</p>
          <ControlSection title="Your house" value="Customize">
            <div className="house-customizer">
              <label className="select-control">Stories
                <select value={houseOptions.stories} onChange={(event) => updateHouse('stories', Number(event.target.value))}>
                  <option value="1">One story</option><option value="2">Two stories</option><option value="3">Three stories</option>
                </select>
              </label>
              <label className="select-control">Roof shape
                <select value={houseOptions.roofStyle} onChange={(event) => updateHouse('roofStyle', event.target.value)}>
                  <option value="gable">Classic gable</option><option value="flat">Modern flat</option><option value="stepped">Cottage stepped</option>
                </select>
              </label>
              <label className="select-control">Front porch
                <select value={houseOptions.porchStyle} onChange={(event) => updateHouse('porchStyle', event.target.value)}>
                  <option value="none">No porch</option><option value="stoop">Front stoop</option><option value="covered">Covered porch</option>
                </select>
              </label>
              <label className="toggle-control"><input type="checkbox" checked={houseOptions.chimney} onChange={(event) => updateHouse('chimney', event.target.checked)} /> Chimney <b>{houseOptions.chimney ? 'On' : 'Off'}</b></label>
              <label className="toggle-control"><input type="checkbox" checked={houseOptions.dormer} disabled={houseOptions.roofStyle === 'flat'} onChange={(event) => updateHouse('dormer', event.target.checked)} /> Roof dormer <b>{houseOptions.dormer && houseOptions.roofStyle !== 'flat' ? 'On' : 'Off'}</b></label>
            </div>
          </ControlSection>
          {view === 'neighborhood' && <ControlSection title="Street lights" value={streetLightOptions.behavior === 'automatic' ? 'Night auto' : streetLightOptions.behavior === 'always' ? 'Always on' : 'Off'}>
            <div className="street-light-controls">
              <label className="select-control">When to glow
                <select value={streetLightOptions.behavior} onChange={(event) => updateStreetLights('behavior', event.target.value)}>
                  <option value="automatic">Automatically at night</option><option value="always">Always on</option><option value="off">Always off</option>
                </select>
              </label>
              <label className="select-control">Light tone
                <select value={streetLightOptions.tone} onChange={(event) => updateStreetLights('tone', event.target.value)}>
                  <option value="warm">Warm golden</option><option value="rose">Soft rose</option><option value="cool">Moonlit white</option>
                </select>
              </label>
              <label className="control"><span>Brightness <b>{streetLightOptions.brightness}%</b></span><input type="range" min="25" max="250" step="25" value={streetLightOptions.brightness} onChange={(event) => updateStreetLights('brightness', Number(event.target.value))} /></label>
              <p className="weather-help">Automatic lights fade on at dusk and turn off again after sunrise.</p>
            </div>
          </ControlSection>}
          <ControlSection title="Seasons & time" value={`${season.name} · ${timeOfDay}`}>
          <label className="toggle-control cycle-toggle"><input type="checkbox" checked={autoSeasons} onChange={(event) => setAutoSeasons(event.target.checked)} /> Run seasons automatically <b>{autoSeasons ? 'On' : 'Off'}</b></label>
          <div className="time-controls">
            <label className="select-control">Cycle speed
              <select value={timeSpeed} onChange={(event) => setTimeSpeed(Number(event.target.value))}>
                <option value="1">Normal · 1×</option><option value="5">Fast · 5×</option><option value="30">Faster · 30×</option><option value="120">Very fast · 120×</option>
              </select>
            </label>
            <div className="time-actions" aria-label="Fast forward time">
              <button type="button" onClick={() => fastForwardDays(.5)}>Next day / night</button>
              <button type="button" onClick={() => fastForwardDays(1)}>+1 day</button>
              <button type="button" onClick={() => fastForwardDays(7)}>+7 days</button>
            </div>
          </div>
          <fieldset className="season-options"><legend>Choose a season</legend>
            {seasons.map((item, index) => <button key={item.id} type="button" aria-pressed={seasonIndex === index} className={seasonIndex === index ? 'season-button selected' : 'season-button'} onClick={() => { setSeasonIndex(index); setAutoSeasons(false) }}><span aria-hidden="true">{item.symbol}</span>{item.name}</button>)}
          </fieldset>
          <label className="control season-slider"><span>Season <b>{season.name}</b></span><input type="range" min="0" max="3" step="1" value={seasonIndex} aria-valuetext={season.name} onChange={(event) => { setSeasonIndex(Number(event.target.value)); setAutoSeasons(false) }} /></label>
          <p className="cycle-status" aria-live="polite"><span className={`time-orb ${timeOfDay.toLowerCase()}`} aria-hidden="true" />{timeOfDay} · Day {seasonDay} of 90 · {timeSpeed}× speed</p>
          </ControlSection>
          <WeatherControls settings={weather} simulation={simulation} season={season.id} reset={(key) => { setSimulation((current) => resetSimulation(current, key)); setWeather((current) => ({ ...current, [key]: false })) }} update={(key, value) => setWeather((current) => ({ ...current, [key]: value }))} />
          <ControlSection title="Geometry" value={`${voxelDensity}× · ${renderResolution}%`}>
            <label className="control"><span>Voxel density <b>{voxelDensity}×</b></span><input type="range" min="1" max="4" step="1" value={voxelDensity} onChange={(event) => setVoxelDensity(Number(event.target.value))} /></label>
            <p className="weather-help">Coarse to fine voxels for the neighborhood’s buildings and trees. Higher density adds smaller blocks while preserving their shapes.</p>
            <label className="control"><span>Render resolution <b>{renderResolution}%</b></span><input type="range" min="25" max="150" step="25" value={renderResolution} onChange={(event) => setRenderResolution(Number(event.target.value))} /></label>
            <p className="weather-help">Lower for a pixelated preview, higher for sharper edges. Applies to both views; higher settings use more graphics power.</p>
          </ControlSection>
          <ControlSection title="Shaders" value={shaderOptions.find((option) => option.id === shaderMode).name}>
          <div className="shader-panel">
            <fieldset className="shader-options"><legend>Choose a shader</legend>
              {shaderOptions.map((option) => <label key={option.id} className={`shader-option ${shaderMode === option.id ? 'selected' : ''}`}>
                <input type="radio" name="world-shader" value={option.id} checked={shaderMode === option.id} onChange={() => setShaderMode(option.id)} />
                <span>{option.name}</span>
              </label>)}
            </fieldset>
            <p className="shader-description" aria-live="polite">{shaderOptions.find((option) => option.id === shaderMode).description}</p>
            <small>Applies to the neighborhood and your room.</small>
          </div>
          </ControlSection>
          {view === 'neighborhood' && <ControlSection title="Around the block"><div className="location-guide"><p><b>01 · School</b>Classrooms beneath a little clock tower.</p><p><b>02 · Shops & restaurants</b>Petal Mall, Peach Blossom Café, Moonlight Noodles, Sugar Cloud Bakery, Little Chapter Bookshop, Petal & Stem Florist, and Ribbon Boutique.</p><button type="button" onClick={() => setView('room')}><b>03 · Your house ↗</b>Step inside and visit your room.</button></div></ControlSection>}
          <ControlSection title="Inside & outside"><div className="season-story" aria-live="polite"><h3>{season.title}</h3><p>{view === 'room' ? season.description : { spring: 'Pink blossom trees and fresh green lawns soften the streets.', summer: 'Green canopies, golden flowers, and bright afternoon sunshine.', autumn: 'Copper trees and warm light settle over the neighborhood.', winter: 'Snow-covered lawns and rooftops turn the block into a quiet winter miniature.' }[season.id]}</p>{view === 'room' && <dl><div><dt>Window</dt><dd>{season.window}</dd></div><div><dt>Bed</dt><dd>{season.bedding}</dd></div><div><dt>Little details</dt><dd>{season.details}</dd></div></dl>}</div></ControlSection>
          <p className="room-note">One neighborhood, four seasons. The season you choose follows you home.</p>
        </aside>
      </div>
    </div>
  )
}

export default App
