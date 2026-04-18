import { useEffect, useRef } from 'react'

const PSI_DATA = [
  { week: 'W1', psi: 0.04 },
  { week: 'W2', psi: 0.05 },
  { week: 'W3', psi: 0.07 },
  { week: 'W4', psi: 0.09 },
  { week: 'W5', psi: 0.11 },
  { week: 'W6', psi: 0.08 },
  { week: 'W7', psi: 0.06 },
  { week: 'W8', psi: 0.07 },
]

const THOMPSON_VARIANTS = [
  {
    label: 'A: "Tell me about your income"',
    alpha: 42, beta: 18,
    best: false,
  },
  {
    label: 'B: "What is your monthly take-home?"',
    alpha: 31, beta: 29,
    best: false,
  },
  {
    label: 'C: "Salary credited to your account?"',
    alpha: 55, beta: 12,
    best: true,
  },
]

const UNIT_ECONOMICS = [
  { label: 'Cost / Session',    human: '₹700–900',   ai: '₹20–30'    },
  { label: 'Sessions / Hour',   human: '4–6',         ai: '10,000+'   },
  { label: 'KYC Time',          human: '60–90 min',   ai: '6–8 min'   },
  { label: 'Conversion Rate',   human: '18–22%',      ai: '40–50%'    },
  { label: 'Fraud Detection',   human: '~65%',        ai: '>85%'      },
]

const INNOVATIONS = [
  { name: 'BIS Pre-session Score',    formula: 'BIS=σ(w₁·Δtclick+…)',          doc: true  },
  { name: 'Triangulated Fraud',       formula: 'Fcombined=1−∏(1−Fᵢ)',          doc: true  },
  { name: 'Thompson Sampling',        formula: 'θk∼Beta(αk,βk)',               doc: true  },
  { name: '7-Signal CUS',             formula: 'CUS=Σwᵢ·xᵢ across 7 signals', doc: true  },
  { name: 'Narrated Rate Pricing',    formula: 'r=rbase+rrisk−rCLV−rNIRF',    doc: true  },
  { name: 'GNN Fraud Ring',           formula: 'FraudRing(v)=|N(v)∩flagged|/|N(v)|', doc: true },
  { name: 'PSI Drift Monitor',        formula: 'PSI=Σ(Ai%−Ei%)·ln(Ai%/Ei%)', doc: true  },
  { name: 'Gemini AI Agent',          formula: 'Live API · Full context aware', doc: false },
  { name: 'Web Speech STT',           formula: 'SpeechRecognition · en-IN',    doc: false },
  { name: 'Real Camera KYC',          formula: 'getUserMedia · Liveness check', doc: false },
  { name: 'Browser Geolocation',      formula: 'GPS · IP subnet geo-fence',    doc: false },
  { name: 'Telegram Re-engagement',   formula: 'Bot API · Multi-channel fallback', doc: false },
]

/* ── PSI Chart ── */
function PSIChart() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const H = canvas.height
    const padL = 38, padB = 28, padT = 16, padR = 14
    const chartW = W - padL - padR
    const chartH = H - padB - padT

    ctx.clearRect(0, 0, W, H)

    const yScale = v => padT + chartH - (v / 0.3) * chartH
    const xScale = i => padL + (i / (PSI_DATA.length - 1)) * chartW

    /* Zone fills */
    ctx.fillStyle = 'rgba(0,255,136,0.04)'
    ctx.fillRect(padL, yScale(0.1), chartW, chartH - (yScale(0) - yScale(0.1)))

    ctx.fillStyle = 'rgba(245,197,24,0.04)'
    ctx.fillRect(padL, yScale(0.25), chartW, yScale(0.1) - yScale(0.25))

    ctx.fillStyle = 'rgba(255,51,102,0.04)'
    ctx.fillRect(padL, padT, chartW, yScale(0.25) - padT)

    /* Threshold lines */
    ;[
      { v: 0.1,  color: 'rgba(0,255,136,0.35)',   label: '0.10 stable' },
      { v: 0.25, color: 'rgba(245,197,24,0.35)',  label: '0.25 warning' },
    ].forEach(({ v, color, label }) => {
      const y = yScale(v)
      ctx.strokeStyle = color
      ctx.lineWidth = 0.8
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(padL, y)
      ctx.lineTo(W - padR, y)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.fillStyle = color
      ctx.font = '8px DM Mono, monospace'
      ctx.textAlign = 'left'
      ctx.fillText(label, padL + 3, y - 3)
    })

    /* Y axis labels */
    ctx.fillStyle = 'rgba(107,125,143,0.7)'
    ctx.font = '8px DM Mono, monospace'
    ctx.textAlign = 'right'
    ;[0, 0.1, 0.2, 0.3].forEach(v => {
      ctx.fillText(v.toFixed(2), padL - 4, yScale(v) + 3)
    })

    /* Line */
    ctx.strokeStyle = '#00d4ff'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.setLineDash([])
    ctx.beginPath()
    PSI_DATA.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.psi)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.stroke()

    /* Area fill under line */
    ctx.beginPath()
    PSI_DATA.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.psi)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.lineTo(xScale(PSI_DATA.length - 1), yScale(0))
    ctx.lineTo(xScale(0), yScale(0))
    ctx.closePath()
    ctx.fillStyle = 'rgba(0,212,255,0.06)'
    ctx.fill()

    /* Points */
    PSI_DATA.forEach((d, i) => {
      const x = xScale(i)
      const y = yScale(d.psi)
      const color = d.psi > 0.25 ? '#ff3366' : d.psi > 0.1 ? '#f5c518' : '#00d4ff'

      ctx.beginPath()
      ctx.arc(x, y, 4, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      /* Week labels */
      ctx.fillStyle = 'rgba(107,125,143,0.8)'
      ctx.font = '8px DM Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(d.week, x, H - 8)

      /* Value labels */
      ctx.fillStyle = color
      ctx.fillText(d.psi.toFixed(2), x, y - 8)
    })
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={190}
      style={{ width: '100%', height: 'auto' }}
    />
  )
}

/* ── GNN Graph with More Nodes ── */
function GNNGraph() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = 400 // Canvas width
    const H = 300 // Canvas height
    canvas.width = W
    canvas.height = H
    const cx = W / 2
    const cy = H / 2 + 10

    const nodes = [
      { x: cx,       y: cy,       label: 'Priya',   color: '#00d4ff', r: 10, flag: false, main: true, vx: 0, vy: 0, visible: false },
      { x: cx - 78,  y: cy - 55,  label: 'Device',  color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx + 80,  y: cy - 50,  label: 'IP',      color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx - 85,  y: cy + 45,  label: 'Phone',   color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx + 70,  y: cy + 52,  label: 'Address', color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx - 20,  y: cy - 100, label: 'Ghost A', color: '#ff3366', r: 7,  flag: true,  vx: 0, vy: 0, visible: false },
      { x: cx + 42,  y: cy - 82,  label: 'Ghost B', color: '#ff3366', r: 7,  flag: true,  vx: 0, vy: 0, visible: false },
      { x: cx - 120, y: cy - 20,  label: 'Email',   color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx + 110, y: cy + 30,  label: 'Bank',    color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx - 50,  y: cy + 90,  label: 'Social',  color: '#6b7d8f', r: 6,  flag: false, vx: 0, vy: 0, visible: false },
      { x: cx + 60,  y: cy - 110, label: 'Ghost C', color: '#ff3366', r: 7,  flag: true,  vx: 0, vy: 0, visible: false },
    ]

    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2],
      [6, 2], [6, 4],
      [0, 7], [0, 8], [0, 9],
      [10, 2], [10, 4],
    ]

    let glowPhase = 0

    const drawNode = (node) => {
      if (!node.visible) return

      // Pulsating glow
      const glowRadius = node.r + 5 + Math.sin(glowPhase) * 2
      ctx.beginPath()
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '22'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
      ctx.fillStyle = node.color + '88'
      ctx.fill()
      ctx.strokeStyle = node.color
      ctx.lineWidth = node.flag ? 2 : 1.5
      ctx.stroke()

      ctx.fillStyle = node.color
      ctx.font = `${node.flag ? '600 ' : ''}8px DM Mono, monospace`
      ctx.textAlign = 'center'
      ctx.fillText(node.label, node.x, node.y + node.r + 10)
    }

    const drawEdge = (n1, n2) => {
      if (!n1.visible || !n2.visible) return

      const isSuspect = n1.flag || n2.flag
      ctx.beginPath()
      ctx.moveTo(n1.x, n1.y)
      ctx.lineTo(n2.x, n2.y)
      ctx.strokeStyle = isSuspect
        ? 'rgba(255,51,102,0.45)'
        : 'rgba(0,212,255,0.18)'
      ctx.lineWidth = isSuspect ? 1.5 : 1
      if (isSuspect) ctx.setLineDash([3, 3])
      else ctx.setLineDash([])
      ctx.stroke()
      ctx.setLineDash([])
    }

    const applyForces = () => {
      const repulsion = 10000
      const attraction = 0.01

      nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
          if (i === j || !n1.visible || !n2.visible) return
          const dx = n2.x - n1.x
          const dy = n2.y - n1.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1

          // Repulsion
          const force = repulsion / (dist * dist)
          n1.vx -= (force * dx) / dist
          n1.vy -= (force * dy) / dist

          // Attraction for connected nodes
          if (edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) {
            const attractionForce = attraction * dist
            n1.vx += (attractionForce * dx) / dist
            n1.vy += (attractionForce * dy) / dist
          }
        })
      })
    }

    const updatePositions = () => {
      nodes.forEach((node) => {
        if (!node.visible) return
        node.x += node.vx
        node.y += node.vy
        node.vx *= 0.9 // Damping
        node.vy *= 0.9
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H)

      // Draw edges
      edges.forEach(([a, b]) => {
        const n1 = nodes[a]
        const n2 = nodes[b]
        drawEdge(n1, n2)
      })

      // Draw nodes
      nodes.forEach(drawNode)

      applyForces()
      updatePositions()

      glowPhase += 0.1
      requestAnimationFrame(animate)
    }

    let index = 0
    const interval = setInterval(() => {
      if (index < nodes.length) {
        nodes[index].visible = true
        edges.forEach(([a, b]) => {
          if (a === index || b === index) {
            // Gradually reveal edges connected to the current node
            nodes[a].visible = true
            nodes[b].visible = true
          }
        })
        index++
      } else {
        clearInterval(interval)
      }
    }, 500) // Adjust timing for node appearance

    animate()
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', maxWidth: '400px', maxHeight: '300px' }}
    />
  )
}

export default function Analytics() {
  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* ── Top row: PSI + GNN + Thompson ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* PSI */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.08em', marginBottom: 10,
          }}>
            PSI DRIFT MONITOR — 8-WEEK ROLLING
          </div>

          <PSIChart />

          <div style={{
            display: 'flex', gap: 10, marginTop: 8,
            flexWrap: 'wrap', fontSize: 9, fontFamily: 'DM Mono, monospace',
          }}>
            <span style={{ color: 'var(--green)'  }}>● Stable &lt;0.10</span>
            <span style={{ color: 'var(--gold)'   }}>● Warning 0.10–0.25</span>
            <span style={{ color: 'var(--red)'    }}>● Drift &gt;0.25</span>
          </div>

          <div style={{
            marginTop: 10, padding: 8,
            background: 'rgba(0,255,136,0.07)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 6,
            fontSize: 10, fontFamily: 'DM Mono, monospace',
            color: 'var(--green)',
          }}>
            Current PSI: 0.07 — STABLE · No retraining triggered
          </div>
        </div>

        {/* GNN */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.08em', marginBottom: 10,
          }}>
            GNN FRAUD RING DETECTION
          </div>

          <GNNGraph />

          <div style={{
            display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--cyan)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 8, height: 1.5, background: 'var(--cyan)', display: 'inline-block' }} />
              Clean link
            </span>
            <span style={{
              fontSize: 9, fontFamily: 'DM Mono, monospace', color: 'var(--red)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ width: 8, height: 1.5, background: 'var(--red)', display: 'inline-block' }} />
              Suspect link
            </span>
          </div>

          <div style={{
            marginTop: 10, padding: 8,
            background: 'rgba(255,51,102,0.06)',
            border: '1px solid rgba(255,51,102,0.2)',
            borderRadius: 6,
            fontSize: 10, fontFamily: 'DM Mono, monospace',
            color: 'var(--red)',
          }}>
            2 synthetic ghost nodes isolated · Applicant graph: UNLINKED
          </div>
        </div>

        {/* Thompson Sampling */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.08em', marginBottom: 14,
          }}>
            THOMPSON SAMPLING — LIVE VARIANTS
          </div>

          {THOMPSON_VARIANTS.map((v, i) => {
            const rate = v.alpha / (v.alpha + v.beta)
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 10, fontFamily: 'DM Mono, monospace', marginBottom: 4,
                }}>
                  <span style={{ color: v.best ? 'var(--green)' : 'var(--muted)' }}>
                    {v.best ? '★ ' : ''}{v.label}
                  </span>
                  <span style={{ color: v.best ? 'var(--green)' : 'var(--text)' }}>
                    {(rate * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: `${rate * 100}%`,
                      background: v.best ? 'var(--green)' : 'var(--muted)',
                      opacity: 0.8,
                    }}
                  />
                </div>

                <div style={{
                  fontSize: 9, color: 'var(--muted)',
                  fontFamily: 'DM Mono, monospace', marginTop: 3,
                }}>
                  Beta(α={v.alpha}, β={v.beta}) · n={v.alpha + v.beta} sessions
                </div>
              </div>
            )
          })}

          <div style={{
            padding: 8,
            background: 'rgba(0,212,255,0.07)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 10, fontFamily: 'DM Mono, monospace',
            color: 'var(--cyan)',
          }}>
            Serving Variant C · +18% acceptance lift · Grab precedent
          </div>
        </div>
      </div>

      {/* ── Unit economics ── */}
      <div className="card" style={{ padding: 20, marginBottom: 12 }}>
        <div style={{
          fontSize: 10, color: 'var(--muted)',
          fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.08em', marginBottom: 14,
        }}>
          UNIT ECONOMICS — LOAN WIZARD vs HUMAN AGENT
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${UNIT_ECONOMICS.length}, 1fr)`,
          gap: 10,
        }}>
          {UNIT_ECONOMICS.map(e => (
            <div
              key={e.label}
              style={{
                background: 'var(--bg3)',
                borderRadius: 8, padding: 14, textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: 9, fontFamily: 'DM Mono, monospace',
                color: 'var(--muted)', marginBottom: 8,
                letterSpacing: '0.04em',
              }}>
                {e.label}
              </div>
              <div style={{
                fontSize: 11, fontFamily: 'DM Mono, monospace',
                color: 'var(--red)',
                textDecoration: 'line-through',
                opacity: 0.6, marginBottom: 4,
              }}>
                {e.human}
              </div>
              <div style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 15, color: 'var(--green)', fontWeight: 700,
              }}>
                {e.ai}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Innovations grid ── */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{
          fontSize: 10, color: 'var(--muted)',
          fontFamily: 'DM Mono, monospace',
          letterSpacing: '0.08em', marginBottom: 14,
        }}>
          12 INNOVATIONS IMPLEMENTED
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 8,
        }}>
          {INNOVATIONS.map((x, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg3)',
                borderRadius: 8, padding: 11,
                borderLeft: `3px solid ${x.doc ? 'var(--cyan)' : 'var(--gold)'}`,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 5,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 600,
                  lineHeight: 1.3, color: 'var(--text)',
                  flex: 1,
                }}>
                  {x.name}
                </div>
                <span
                  className={`tag ${x.doc ? 'tag-c' : 'tag-y'}`}
                  style={{ fontSize: 8, marginLeft: 6, flexShrink: 0 }}
                >
                  {x.doc ? 'DOC' : 'NEW'}
                </span>
              </div>
              <div style={{
                fontSize: 9, fontFamily: 'DM Mono, monospace',
                color: 'var(--muted)', lineHeight: 1.5,
              }}>
                {x.formula}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex', gap: 12, marginTop: 14,
          fontSize: 10, fontFamily: 'DM Mono, monospace',
        }}>
          <span style={{ color: 'var(--cyan)' }}>
            ■ DOC — from problem statement
          </span>
          <span style={{ color: 'var(--gold)' }}>
            ■ NEW — added beyond spec
          </span>
        </div>
      </div>

    </div>
  )
}