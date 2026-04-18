const TABS = [
  { id: 'dashboard', label: '01 DASHBOARD' },
  { id: 'session',   label: '02 LIVE SESSION' },
  { id: 'offer',     label: '03 OFFER' },
  { id: 'analytics', label: '04 ANALYTICS' },
  { id: 'market',    label: '05 MARKET INTEL' },
]

export default function Navbar({ active, onChange }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      height: 52,
      background: 'rgba(8,15,30,0.95)',
      borderBottom: '1px solid var(--border)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 8, height: 8,
          background: 'var(--cyan)',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
        <span style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--cyan)',
          letterSpacing: '0.12em'
        }}>
          LOAN WIZARD
        </span>
        <span style={{
          fontFamily: 'DM Mono, monospace',
          fontSize: 9,
          color: 'var(--muted)',
          letterSpacing: '0.08em',
          marginLeft: 4
        }}>
          TENZORX 2026
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: 'none',
              background: active === tab.id ? 'rgba(0,212,255,0.1)' : 'transparent',
              color: active === tab.id ? 'var(--cyan)' : 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              fontSize: 10,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.06em',
              borderBottom: active === tab.id ? '2px solid var(--cyan)' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 6, height: 6, background: 'var(--green)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--muted)' }}>
          ALL SYSTEMS LIVE
        </span>
      </div>
    </nav>
  )
}