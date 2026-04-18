export default function BISRing({ score }) {
  const circumference = 2 * Math.PI * 28
  const color = score > 0.65 ? '#00ff88' : score > 0.35 ? '#f5c518' : '#ff3366'
  const label = score > 0.65 ? 'WARM' : score > 0.35 ? 'ASSIST' : 'COLD'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width="72" height="72" viewBox="0 0 72 72">
        {/* Track */}
        <circle
          cx="36" cy="36" r="28"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="6"
        />
        {/* Fill */}
        <circle
          cx="36" cy="36" r="28"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score)}
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
        {/* Score number */}
        <text
          x="36" y="33"
          textAnchor="middle"
          fill={color}
          fontSize="13"
          fontFamily="Orbitron, sans-serif"
          fontWeight="700"
        >
          {(score * 100).toFixed(0)}
        </text>
        {/* BIS label */}
        <text
          x="36" y="46"
          textAnchor="middle"
          fill="rgba(107,125,143,0.9)"
          fontSize="8"
          fontFamily="DM Mono, monospace"
        >
          BIS
        </text>
      </svg>
      <span style={{
        fontSize: 9,
        fontFamily: 'DM Mono, monospace',
        color,
        letterSpacing: '0.08em'
      }}>
        {label}
      </span>
    </div>
  )
}