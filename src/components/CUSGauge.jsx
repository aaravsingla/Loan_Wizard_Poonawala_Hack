export default function CUSGauge({ score }) {
  const radius = 46
  const cx = 60
  const cy = 60
  const circumference = 2 * Math.PI * radius
  const trackLength = circumference * 0.75
  const filledLength = trackLength * (score / 100)

  const color = score >= 80 ? '#00ff88'
    : score >= 60 ? '#00d4ff'
    : score >= 40 ? '#f5c518'
    : '#ff3366'

  const tier = score >= 80 ? 'TIER A'
    : score >= 60 ? 'TIER B'
    : score >= 40 ? 'TIER C'
    : 'COMPUTING'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {/* Track arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${trackLength} ${circumference - trackLength}`}
          transform={`rotate(135 ${cx} ${cy})`}
        />
        {/* Filled arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${circumference - filledLength}`}
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        {/* Score */}
        <text
          x={cx} y={cy - 4}
          textAnchor="middle"
          fill={color}
          fontSize="24"
          fontFamily="Orbitron, sans-serif"
          fontWeight="700"
        >
          {score}
        </text>
        {/* Label */}
        <text
          x={cx} y={cy + 14}
          textAnchor="middle"
          fill="rgba(107,125,143,0.85)"
          fontSize="9"
          fontFamily="DM Mono, monospace"
        >
          CUS SCORE
        </text>
      </svg>
      <span style={{
        fontSize: 10,
        fontFamily: 'DM Mono, monospace',
        color,
        letterSpacing: '0.1em'
      }}>
        {tier}
      </span>
    </div>
  )
}