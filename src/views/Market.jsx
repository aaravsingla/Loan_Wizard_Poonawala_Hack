import { useState, useEffect, useRef } from 'react'

/* ── India Map SVG ── */
function IndiaMap() {
  const cities = [
    { name: 'Mumbai',    x: 142, y: 285, apps: 8420, tier: 1 },
    { name: 'Delhi',     x: 182, y: 145, apps: 7830, tier: 1 },
    { name: 'Bangalore', x: 182, y: 345, apps: 6210, tier: 1 },
    { name: 'Chennai',   x: 205, y: 360, apps: 4180, tier: 1 },
    { name: 'Hyderabad', x: 192, y: 305, apps: 3920, tier: 1 },
    { name: 'Pune',      x: 150, y: 295, apps: 2840, tier: 2 },
    { name: 'Ahmedabad', x: 130, y: 230, apps: 2210, tier: 2 },
    { name: 'Kolkata',   x: 262, y: 220, apps: 2050, tier: 2 },
    { name: 'Jaipur',    x: 160, y: 180, apps: 1420, tier: 2 },
    { name: 'Lucknow',   x: 210, y: 175, apps: 1180, tier: 2 },
    { name: 'Patna',     x: 240, y: 190, apps:  890, tier: 3 },
    { name: 'Bhopal',    x: 175, y: 235, apps:  760, tier: 3 },
    { name: 'Indore',    x: 158, y: 245, apps:  680, tier: 3 },
    { name: 'Coimbatore',x: 188, y: 378, apps:  590, tier: 3 },
    { name: 'Nagpur',    x: 195, y: 255, apps:  510, tier: 3 },
  ]

  const [hovered, setHovered] = useState(null)
  const [pulse,   setPulse]   = useState(0)

  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % 3), 900)
    return () => clearInterval(id)
  }, [])

  const tierColor = t => t === 1 ? '#00d4ff' : t === 2 ? '#f5c518' : '#00ff88'
  const maxApps   = Math.max(...cities.map(c => c.apps))

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 380 460" width="100%" style={{ display: 'block' }}>
        {/* India outline — simplified path */}
        <path
          d="M155,40 L175,38 L200,42 L225,48 L245,58 L260,72 L275,88
             L285,108 L290,128 L292,150 L288,172 L282,192 L278,212
             L280,232 L276,252 L268,268 L258,282 L248,295 L238,312
             L228,328 L218,342 L210,358 L205,372 L200,385 L196,398
             L192,410 L188,398 L182,385 L178,372 L172,358 L162,342
             L150,325 L140,308 L132,290 L126,272 L122,252 L118,232
             L116,212 L114,192 L112,170 L114,150 L118,130 L124,110
             L132,92 L142,76 L150,60 Z"
          fill="rgba(0,212,255,0.06)"
          stroke="rgba(0,212,255,0.25)"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {[100, 150, 200, 250, 300, 350].map(y => (
          <line key={y} x1="80" y1={y} x2="320" y2={y}
            stroke="rgba(0,212,255,0.04)" strokeWidth="0.5" />
        ))}
        {[100, 150, 200, 250, 300].map(x => (
          <line key={x} x1={x} y1="40" x2={x} y2="420"
            stroke="rgba(0,212,255,0.04)" strokeWidth="0.5" />
        ))}

        {/* City circles */}
        {cities.map((c, i) => {
          const r    = 4 + (c.apps / maxApps) * 14
          const col  = tierColor(c.tier)
          const isH  = hovered === i
          const ring = (i % 3) === pulse

          return (
            <g key={c.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ring */}
              {ring && (
                <circle cx={c.x} cy={c.y} r={r + 6}
                  fill="none" stroke={col} strokeWidth="0.8"
                  opacity="0.35"
                />
              )}
              {/* Outer glow */}
              <circle cx={c.x} cy={c.y} r={r + 2}
                fill={col} opacity="0.08" />
              {/* Main dot */}
              <circle cx={c.x} cy={c.y} r={isH ? r + 2 : r}
                fill={col} opacity={isH ? 0.9 : 0.55}
                style={{ transition: 'all 0.2s ease' }}
              />
              {/* City label */}
              {(c.tier === 1 || isH) && (
                <text x={c.x + r + 4} y={c.y + 4}
                  fill={col} fontSize="7"
                  fontFamily="DM Mono, monospace"
                  opacity={isH ? 1 : 0.7}
                >
                  {c.name}
                </text>
              )}
            </g>
          )
        })}

        {/* Priya marker */}
        <g>
          <circle cx={205} cy={360} r={7}
            fill="none" stroke="#ffffff" strokeWidth="1.5"
            strokeDasharray="2 2" opacity="0.8"
          />
          <text x={218} y={357} fill="#ffffff"
            fontSize="7" fontFamily="DM Mono, monospace" opacity="0.9">
            PRIYA ← current session
          </text>
        </g>
      </svg>

      {/* Tooltip */}
      {hovered !== null && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: 'rgba(8,15,30,0.95)',
          border: `1px solid ${tierColor(cities[hovered].tier)}`,
          borderRadius: 8, padding: '10px 14px',
          fontFamily: 'DM Mono, monospace',
          animation: 'fadeUp 0.2s ease',
          minWidth: 140,
        }}>
          <div style={{
            fontSize: 12, fontWeight: 600,
            color: tierColor(cities[hovered].tier),
            marginBottom: 4,
          }}>
            {cities[hovered].name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>
            Applications: <span style={{ color: 'var(--text)' }}>
              {cities[hovered].apps.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>
            Tier: <span style={{ color: tierColor(cities[hovered].tier) }}>
              {cities[hovered].tier}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{
        display: 'flex', gap: 12, marginTop: 8,
        fontFamily: 'DM Mono, monospace', fontSize: 9,
      }}>
        {[
          { label: 'Tier 1 Metro',   color: '#00d4ff' },
          { label: 'Tier 2 City',    color: '#f5c518' },
          { label: 'Tier 3 Growth',  color: '#00ff88' },
        ].map(l => (
          <span key={l.label} style={{
            display: 'flex', alignItems: 'center', gap: 5, color: l.color,
          }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: l.color, display: 'inline-block',
            }} />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── CLV Cascade Chart ── */
function CLVCascade() {
  const canvasRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  const milestones = [
    { year: 'Y0',    product: 'Education Loan',  revenue: 48000,   cumulative: 48000,   color: '#00d4ff' },
    { year: 'Y1-2',  product: 'Top-up Loan',     revenue: 18000,   cumulative: 66000,   color: '#00d4ff' },
    { year: 'Y3',    product: 'Personal Loan',   revenue: 52000,   cumulative: 118000,  color: '#f5c518' },
    { year: 'Y4',    product: 'Credit Card',     revenue: 24000,   cumulative: 142000,  color: '#f5c518' },
    { year: 'Y5',    product: 'Car Loan',        revenue: 68000,   cumulative: 210000,  color: '#00ff88' },
    { year: 'Y6-7',  product: 'Insurance',       revenue: 28000,   cumulative: 238000,  color: '#00ff88' },
    { year: 'Y8',    product: 'Home Loan',       revenue: 38000,   cumulative: 276000,  color: '#ff3366' },
    { year: 'Y10+',  product: 'Wealth Mgmt',     revenue: 4000,    cumulative: 280000,  color: '#ff3366' },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    const W    = canvas.width
    const H    = canvas.height
    const padL = 48, padR = 16, padT = 16, padB = 32
    const chartW = W - padL - padR
    const chartH = H - padT - padB
    const maxVal = 300000
    const barW   = chartW / milestones.length

    ctx.clearRect(0, 0, W, H)

    /* Grid */
    ;[0, 100000, 200000, 300000].forEach(v => {
      const y = padT + chartH - (v / maxVal) * chartH
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth   = 0.5
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(W - padR, y)
      ctx.stroke()
      ctx.fillStyle = 'rgba(107,125,143,0.7)'
      ctx.font = '8px DM Mono, monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`₹${(v / 1000).toFixed(0)}K`, padL - 4, y + 3)
    })

    /* Bars */
    milestones.forEach((m, i) => {
      const x    = padL + i * barW + barW * 0.1
      const bw   = barW * 0.8
      const h    = (m.revenue / maxVal) * chartH
      const cumH = (m.cumulative / maxVal) * chartH
      const y    = padT + chartH - h
      const isH  = hovered === i

      /* Cumulative line marker */
      ctx.fillStyle = m.color + '20'
      ctx.fillRect(padL + i * barW, padT + chartH - cumH, barW, cumH)

      /* Bar */
      ctx.fillStyle = isH ? m.color : m.color + 'aa'
      ctx.fillRect(x, y, bw, h)

      /* Top line */
      ctx.fillStyle = m.color
      ctx.fillRect(x, y, bw, 2)

      /* X label */
      ctx.fillStyle = 'rgba(107,125,143,0.8)'
      ctx.font = '7px DM Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(m.year, padL + i * barW + barW / 2, H - 8)
    })

    /* Cumulative line */
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'
    ctx.lineWidth   = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    milestones.forEach((m, i) => {
      const x = padL + i * barW + barW / 2
      const y = padT + chartH - (m.cumulative / maxVal) * chartH
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])

    /* Total label */
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 9px DM Mono, monospace'
    ctx.textAlign = 'center'
    const lastX = padL + (milestones.length - 1) * barW + barW / 2
    const lastY = padT + chartH - (280000 / maxVal) * chartH
    ctx.fillText('₹2.8L CLV', lastX, lastY - 8)

  }, [hovered])

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={340} height={160}
        style={{ width: '100%', height: 'auto', cursor: 'crosshair' }}
        onMouseMove={e => {
          const rect  = e.currentTarget.getBoundingClientRect()
          const x     = (e.clientX - rect.left) / rect.width * 340
          const idx   = Math.floor((x - 48) / ((340 - 64) / 8))
          setHovered(idx >= 0 && idx < 8 ? idx : null)
        }}
        onMouseLeave={() => setHovered(null)}
      />

      {hovered !== null && (
        <div style={{
          background: 'var(--bg3)',
          border: `1px solid ${milestones[hovered]?.color}`,
          borderRadius: 6, padding: '6px 10px',
          fontFamily: 'DM Mono, monospace',
          fontSize: 10, marginTop: 4,
          animation: 'fadeUp 0.15s ease',
        }}>
          <span style={{ color: milestones[hovered]?.color }}>
            {milestones[hovered]?.product}
          </span>
          {' · '}
          <span style={{ color: 'var(--text)' }}>
            +₹{milestones[hovered]?.revenue.toLocaleString()} NIM
          </span>
          {' · '}
          <span style={{ color: 'var(--muted)' }}>
            Cumulative: ₹{milestones[hovered]?.cumulative.toLocaleString()}
          </span>
        </div>
      )}

      {/* Product timeline */}
      <div style={{
        display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap',
      }}>
        {milestones.map((m, i) => (
          <div key={i} style={{
            padding: '2px 7px', borderRadius: 4,
            background: m.color + '18',
            border: `1px solid ${m.color}44`,
            fontSize: 8, fontFamily: 'DM Mono, monospace',
            color: m.color,
          }}>
            {m.year} {m.product}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── NIM Recovery Calculator ── */
function NIMCalculator() {
  const [recovery, setRecovery] = useState(35)
  const [loanVal,  setLoanVal]  = useState(12)

  const dropoffs      = 32500
  const recovered     = Math.round(dropoffs * recovery / 100)
  const nimPerMonth   = recovered * loanVal * 100000 * 0.04 / 12
  const opSaving      = dropoffs * (800 - 25)
  const totalMonthly  = nimPerMonth + opSaving
  const annualBenefit = totalMonthly * 12
  const clvPipeline   = recovered * 280000

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, fontFamily: 'DM Mono, monospace',
          color: 'var(--muted)', marginBottom: 5,
        }}>
          <span>Drop-off Recovery Rate:
            <span style={{ color: 'var(--cyan)', marginLeft: 5 }}>{recovery}%</span>
          </span>
          <span style={{ color: 'var(--muted)' }}>
            {recovered.toLocaleString()} applicants/mo
          </span>
        </div>
        <input type="range" min="5" max="70" value={recovery}
          onChange={e => setRecovery(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--cyan)' }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          fontSize: 10, fontFamily: 'DM Mono, monospace',
          color: 'var(--muted)', marginBottom: 5,
        }}>
          <span>Avg Loan Value:
            <span style={{ color: 'var(--gold)', marginLeft: 5 }}>₹{loanVal}L</span>
          </span>
          <span style={{ color: 'var(--muted)' }}>NIM: 4% p.a.</span>
        </div>
        <input type="range" min="3" max="25" value={loanVal}
          onChange={e => setLoanVal(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--gold)' }}
        />
      </div>

      {/* Output tiles */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 8,
      }}>
        {[
          {
            label: 'Additional NIM / Month',
            value: `₹${(nimPerMonth / 10000000).toFixed(1)}Cr`,
            color: 'var(--cyan)',
            sub: `${recovered.toLocaleString()} × ₹${loanVal}L × 4%/12`,
          },
          {
            label: 'Op Cost Saving / Month',
            value: `₹${(opSaving / 10000000).toFixed(2)}Cr`,
            color: 'var(--green)',
            sub: `${dropoffs.toLocaleString()} × (₹800−₹25)`,
          },
          {
            label: 'Total Monthly Benefit',
            value: `₹${(totalMonthly / 10000000).toFixed(1)}Cr`,
            color: 'var(--gold)',
            sub: 'NIM + Op savings combined',
          },
          {
            label: 'Annual Benefit',
            value: `₹${(annualBenefit / 10000000).toFixed(0)}Cr`,
            color: 'var(--red)',
            sub: '× 12 months projection',
          },
        ].map(t => (
          <div key={t.label} style={{
            background: 'var(--bg3)',
            borderRadius: 7, padding: '10px 12px',
            borderLeft: `3px solid ${t.color}`,
          }}>
            <div style={{
              fontSize: 9, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace', marginBottom: 4,
            }}>
              {t.label}
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 17, fontWeight: 700, color: t.color,
            }}>
              {t.value}
            </div>
            <div style={{
              fontSize: 8, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace', marginTop: 3,
            }}>
              {t.sub}
            </div>
          </div>
        ))}
      </div>

      {/* CLV pipeline */}
      <div style={{
        marginTop: 10, padding: '10px 14px',
        background: 'rgba(245,197,24,0.07)',
        border: '1px solid rgba(245,197,24,0.25)',
        borderRadius: 7,
        fontFamily: 'DM Mono, monospace',
      }}>
        <div style={{ fontSize: 9, color: 'var(--muted)', marginBottom: 3 }}>
          15-YEAR CLV PIPELINE FROM RECOVERED APPLICANTS
        </div>
        <div style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: 20, color: 'var(--gold)', fontWeight: 700,
        }}>
          ₹{(clvPipeline / 10000000).toFixed(0)}Cr
        </div>
        <div style={{ fontSize: 9, color: 'var(--muted)', marginTop: 2 }}>
          {recovered.toLocaleString()} applicants × ₹2.8L CLV × 15 years
        </div>
      </div>
    </div>
  )
}

/* ── Market Donut ── */
function MarketDonut() {
  const canvasRef = useRef(null)
  const [hovered, setHovered] = useState(null)

  const segments = [
    { label: 'Education Loans',  share: 0.28, color: '#00d4ff', value: '$144B' },
    { label: 'Personal Loans',   share: 0.34, color: '#f5c518', value: '$175B' },
    { label: 'MSME Loans',       share: 0.22, color: '#00ff88', value: '$113B' },
    { label: 'Consumer Durable', share: 0.10, color: '#ff3366', value: '$52B'  },
    { label: 'Other',            share: 0.06, color: '#6b7d8f', value: '$31B'  },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2, r = 70, inner = 42

    ctx.clearRect(0, 0, W, H)

    let startAngle = -Math.PI / 2
    segments.forEach((s, i) => {
      const arc = s.share * 2 * Math.PI
      const isH = hovered === i
      const expand = isH ? 6 : 0

      const midA = startAngle + arc / 2
      const ox = Math.cos(midA) * expand
      const oy = Math.sin(midA) * expand

      ctx.beginPath()
      ctx.moveTo(cx + ox, cy + oy)
      ctx.arc(cx + ox, cy + oy, r + (isH ? 4 : 0), startAngle, startAngle + arc)
      ctx.arc(cx + ox, cy + oy, inner, startAngle + arc, startAngle, true)
      ctx.closePath()
      ctx.fillStyle = isH ? s.color : s.color + 'bb'
      ctx.fill()

      startAngle += arc
    })

    /* Center text */
    ctx.fillStyle = '#dde8f0'
    ctx.font = 'bold 13px Orbitron, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('$515B', cx, cy + 4)
    ctx.fillStyle = 'rgba(107,125,143,0.8)'
    ctx.font = '7px DM Mono, monospace'
    ctx.fillText('by 2030', cx, cy + 16)

  }, [hovered])

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        width={180} height={180}
        style={{ flexShrink: 0, cursor: 'pointer' }}
        onMouseMove={e => {
          const rect = e.currentTarget.getBoundingClientRect()
          const mx = (e.clientX - rect.left) / rect.width * 180 - 90
          const my = (e.clientY - rect.top)  / rect.height * 180 - 90
          const dist = Math.sqrt(mx * mx + my * my)
          if (dist < 42 || dist > 74) { setHovered(null); return }
          let angle = Math.atan2(my, mx) + Math.PI / 2
          if (angle < 0) angle += 2 * Math.PI
          let acc = 0
          for (let i = 0; i < segments.length; i++) {
            acc += segments[i].share * 2 * Math.PI
            if (angle < acc) { setHovered(i); return }
          }
        }}
        onMouseLeave={() => setHovered(null)}
      />

      <div style={{ flex: 1 }}>
        {segments.map((s, i) => (
          <div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '5px 8px',
              borderRadius: 5, marginBottom: 4,
              background: hovered === i ? s.color + '15' : 'transparent',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: s.color, display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10, fontFamily: 'DM Mono, monospace',
                color: hovered === i ? 'var(--text)' : 'var(--muted)',
              }}>
                {s.label}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{
                fontSize: 9, fontFamily: 'DM Mono, monospace',
                color: 'var(--muted)',
              }}>
                {(s.share * 100).toFixed(0)}%
              </span>
              <span style={{
                fontSize: 10, fontFamily: 'DM Mono, monospace',
                color: s.color, fontWeight: 600,
              }}>
                {s.value}
              </span>
            </div>
          </div>
        ))}

        <div style={{
          marginTop: 8, padding: '6px 8px',
          background: 'rgba(0,212,255,0.07)',
          border: '1px solid var(--border)',
          borderRadius: 5, fontSize: 9,
          fontFamily: 'DM Mono, monospace',
          color: 'var(--cyan)',
        }}>
          CAGR 31.5% · 2024→2030 · India DL market
        </div>
      </div>
    </div>
  )
}

/* ══════════ MAIN VIEW ══════════ */
export default function Market() {
  const [activeSection, setActiveSection] = useState('map')

  const sections = [
    { id: 'map',       label: '🗺 Geo Distribution' },
    { id: 'clv',       label: '📈 CLV Cascade'       },
    { id: 'nim',       label: '💰 NIM Calculator'    },
    { id: 'market',    label: '🥧 Market Share'       },
  ]

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: 14,
          color: 'var(--cyan)', letterSpacing: '0.1em', marginBottom: 4,
        }}>
          MARKET INTELLIGENCE & CLV ANALYSIS
        </div>
        <div style={{
          fontFamily: 'DM Mono, monospace', fontSize: 10,
          color: 'var(--muted)',
        }}>
          India Digital Lending · Poonawalla Scale · 15-Year Revenue Projection
        </div>
      </div>

      {/* Top KPI strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 8, marginBottom: 16,
      }}>
        {[
          { label: 'India DL Market 2030', value: '$515B',   color: 'var(--cyan)',  sub: 'CAGR 31.5%'         },
          { label: 'Drop-off Rate',         value: '65%',    color: 'var(--red)',   sub: '32,500 lost/mo'     },
          { label: 'Cost per Recovery',     value: '₹25',    color: 'var(--green)', sub: 'vs ₹800 human'      },
          { label: 'Priya CLV (15yr)',      value: '₹2.8L',  color: 'var(--gold)',  sub: 'across 6 products'  },
          { label: 'Annual Benefit',        value: '₹576Cr', color: 'var(--cyan)',  sub: 'at Poonawalla scale' },
        ].map(k => (
          <div key={k.label} className="card" style={{ padding: '12px 14px' }}>
            <div style={{
              fontSize: 8, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.06em', marginBottom: 5,
            }}>
              {k.label.toUpperCase()}
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 18, fontWeight: 700, color: k.color,
            }}>
              {k.value}
            </div>
            <div style={{
              fontSize: 8, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace', marginTop: 3,
            }}>
              {k.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Section tabs */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 14,
      }}>
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            style={{
              padding: '7px 16px', borderRadius: 7,
              border: activeSection === s.id
                ? '1px solid var(--border2)'
                : '1px solid var(--border)',
              background: activeSection === s.id
                ? 'rgba(0,212,255,0.1)'
                : 'transparent',
              color: activeSection === s.id ? 'var(--cyan)' : 'var(--muted)',
              fontFamily: 'DM Mono, monospace', fontSize: 10,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>

        {/* Left panel */}
        <div className="card card-hi" style={{ padding: 20 }}>

          {activeSection === 'map' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                fontSize: 10, color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em', marginBottom: 12,
              }}>
                APPLICATION HOTSPOT MAP — INDIA
              </div>
              <IndiaMap />
            </div>
          )}

          {activeSection === 'clv' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                fontSize: 10, color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em', marginBottom: 4,
              }}>
                15-YEAR CLV CASCADE — PRIYA SHARMA
              </div>
              <div style={{
                fontSize: 9, color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                marginBottom: 12, opacity: 0.7,
              }}>
                Hover bars · One education loan customer = ₹2.8L net revenue
              </div>
              <CLVCascade />
            </div>
          )}

          {activeSection === 'nim' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                fontSize: 10, color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em', marginBottom: 12,
              }}>
                DROP-OFF RECOVERY NIM CALCULATOR
              </div>
              <NIMCalculator />
            </div>
          )}

          {activeSection === 'market' && (
            <div style={{ animation: 'fadeUp 0.3s ease' }}>
              <div style={{
                fontSize: 10, color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em', marginBottom: 12,
              }}>
                INDIA DL MARKET SEGMENTS — $515B BY 2030
              </div>
              <MarketDonut />
            </div>
          )}
        </div>

        {/* Right panel — always visible insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Research citations */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              INDUSTRY PRECEDENTS
            </div>
            {[
              {
                company: 'Lemonade (US)',
                stat: '30% fraud reduction',
                detail: 'AI video claims · 4× lower fraud on single-take sessions',
                color: 'var(--cyan)',
              },
              {
                company: 'Nubank (Brazil)',
                stat: 'NPS 87 vs avg 18',
                detail: '100M+ users · zero branches · 22% lower default rate',
                color: 'var(--green)',
              },
              {
                company: 'Grab Financial (SEA)',
                stat: '+18% acceptance rate',
                detail: 'Thompson Sampling on loan variants · 90-day convergence',
                color: 'var(--gold)',
              },
              {
                company: 'ZestMoney (India)',
                stat: '+40% approval rate',
                detail: 'Video KYC + alt data · acquired ₹250Cr → proven exit',
                color: 'var(--cyan)',
              },
              {
                company: 'HDFC EVA (India)',
                stat: '3× rural engagement',
                detail: 'Hindi/Tamil/Bengali · validates our language switch feature',
                color: 'var(--gold)',
              },
              {
                company: 'Perfios (India)',
                stat: '34% misclassified',
                detail: 'Bureau alone fails thin-file · our 7-signal CUS fixes this',
                color: 'var(--red)',
              },
            ].map(p => (
              <div key={p.company} style={{
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 3, minHeight: 36, borderRadius: 2,
                  background: p.color, flexShrink: 0, marginTop: 2,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 2,
                  }}>
                    <span style={{
                      fontSize: 11, fontFamily: 'DM Mono, monospace',
                      color: 'var(--text)', fontWeight: 600,
                    }}>
                      {p.company}
                    </span>
                    <span style={{
                      fontSize: 10, fontFamily: 'DM Mono, monospace',
                      color: p.color,
                    }}>
                      {p.stat}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 9, color: 'var(--muted)',
                    fontFamily: 'DM Mono, monospace', lineHeight: 1.5,
                  }}>
                    {p.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Poonawalla scale breakdown */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              POONAWALLA SCALE MODEL
            </div>
            {[
              { label: 'Applications / Month',     value: '50,000',     color: 'var(--text)'  },
              { label: 'Drop-off Rate (65%)',       value: '32,500',     color: 'var(--red)'   },
              { label: 'Wizard Recovers (35%)',     value: '11,375',     color: 'var(--green)' },
              { label: 'NIM per Recovery / Year',  value: '₹4,800',     color: 'var(--cyan)'  },
              { label: 'Additional NIM / Year',    value: '₹54.6Cr',    color: 'var(--gold)'  },
              { label: 'Op Cost Saved / Year',     value: '₹30.2Cr',    color: 'var(--green)' },
              { label: 'Total Annual Benefit',     value: '₹576Cr',     color: 'var(--gold)'  },
              { label: 'ROI on Wizard Cost',       value: '96.9%',      color: 'var(--green)' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '5px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 11, fontFamily: 'DM Mono, monospace',
              }}>
                <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                <span style={{ color: r.color, fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}