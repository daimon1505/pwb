import { useState, useEffect } from 'react'
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

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [seasonIndex, setSeasonIndex] = useState(0)
  const [voxelDensity, setVoxelDensity] = useState(2)
  const [renderResolution, setRenderResolution] = useState(100)
  const [shaderSelection, setShaderMode] = useState('distance')
  const shaderMode = shaderOptions.some((option) => option.id === shaderSelection) ? shaderSelection : 'distance'
  const [weather, setWeather] = useState(initialWeather)
  const [simulation, setSimulation] = useState(initialSimulation)
  const [streetView, setStreetView] = useState(false)
  const [view, setView] = useState('neighborhood')
  const season = seasons[seasonIndex]
  const [user, setUser] = useState(null)

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
          <div className="canvas-heading"><div><span className="section-label">Your little world</span><strong>{view === 'room' ? 'Your room' : 'Your neighborhood'}</strong></div><span className="resolution-readout">{season.name} afternoon</span></div>
          <nav className="world-navigation" aria-label="Explore your world"><button type="button" aria-pressed={view === 'neighborhood'} onClick={() => setView('neighborhood')}>← Neighborhood</button><button type="button" aria-pressed={view === 'room'} onClick={() => setView('room')}>Enter your room ↗</button>{view === 'neighborhood' && <button type="button" aria-pressed={streetView} onClick={() => setStreetView(!streetView)}>{streetView ? 'Exit street view' : 'Enter street view'}</button>}</nav>
          <div className="preview-stage">{view === 'room' ? <RoomCanvas renderResolution={renderResolution} weather={weather} simulation={simulation} shaderMode={shaderMode} season={season} /> : <NeighborhoodCanvas streetView={streetView} onExitStreet={() => setStreetView(false)} voxelDensity={voxelDensity} renderResolution={renderResolution} weather={weather} simulation={simulation} shaderMode={shaderMode} season={season} onEnterRoom={() => setView('room')} />}</div>
          <div className="canvas-footer"><span>{view === 'neighborhood' && streetView ? 'Drag to look · WASD / arrows to move · Esc to exit' : 'Drag to look around · Scroll to zoom'}</span><span>{view === 'room' ? 'Home, sweet home' : 'Hover for place names · Click your house to enter'}</span></div>
        </main>
        <aside className="side-panel">
          <div className="panel-title"><span className="section-label">World building</span><h2>A neighborhood of your own</h2></div>
          <p className="panel-intro">School mornings, afternoons at the mall, and a room to come home to. Explore your little voxel neighborhood through the seasons.</p>
          <ControlSection title="Seasons" value={season.name}>
          <fieldset className="season-options"><legend>Choose a season</legend>
            {seasons.map((item, index) => <button key={item.id} type="button" aria-pressed={seasonIndex === index} className={seasonIndex === index ? 'season-button selected' : 'season-button'} onClick={() => setSeasonIndex(index)}><span aria-hidden="true">{item.symbol}</span>{item.name}</button>)}
          </fieldset>
          <label className="control season-slider"><span>Season <b>{season.name}</b></span><input type="range" min="0" max="3" step="1" value={seasonIndex} aria-valuetext={season.name} onChange={(event) => setSeasonIndex(Number(event.target.value))} /></label>
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
