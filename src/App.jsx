import { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './views/Dashboard'

export default function App() {
  const [view, setView] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar active={view} onChange={setView} />

      {view === 'dashboard' && (
        <Dashboard onStartSession={() => setView('session')} />
      )}

      {view !== 'dashboard' && (
        <div style={{
          padding: 40,
          color: 'var(--cyan)',
          fontFamily: 'DM Mono, monospace',
          fontSize: 12
        }}>
          {view.toUpperCase()} VIEW — COMING IN NEXT STEP
        </div>
      )}
    </div>
  )
}