import { useState } from 'react'
import Navbar    from './components/Navbar'
import Dashboard from './views/Dashboard'
import Session   from './views/Session'
import Offer     from './views/Offer'
import Analytics from './views/Analytics'
import Market    from './views/Market'

export default function App() {
  const [view, setView] = useState('dashboard')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar active={view} onChange={setView} />
      {view === 'dashboard' && <Dashboard onStartSession={() => setView('session')} />}
      {view === 'session'   && <Session   onOfferReady={() => setView('offer')}     />}
      {view === 'offer'     && <Offer />}
      {view === 'analytics' && <Analytics />}
      {view === 'market'    && <Market />}
    </div>
  )
}