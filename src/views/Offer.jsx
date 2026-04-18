import { useState, useEffect, useRef } from 'react'
import { generateOfferNarrative } from '../utils/gemini'


const RATE_COMPONENTS = [
  { label: 'RBI Repo + NBFC Spread', sublabel: 'base rate fetched live', value: 9.00, display: '+9.00%', color: 'var(--text)' },
  { label: 'Risk Premium',           sublabel: 'CUS=78 → (0.22 × 4%)',   value: 0.88,  display: '+0.88%', color: 'var(--red)'  },
  { label: 'CLV Discount',           sublabel: 'high lifetime value',     value: -0.75, display: '−0.75%', color: 'var(--green)'},
  { label: 'NIRF Discount',          sublabel: 'IIT Bombay top-10',       value: -0.30, display: '−0.30%', color: 'var(--green)'},
]

const AUDIT_ROWS = [
  { label: 'BIS Score',     value: '0.78 — WARM',          color: 'var(--cyan)'  },
  { label: 'Geo Verified',  value: 'Chennai, India ✓',     color: 'var(--green)' },
  { label: 'Age Matched',   value: '23 = Aadhaar (Δ=0) ✓', color: 'var(--green)' },
  { label: 'Liveness',      value: 'Blink + head-turn ✓',  color: 'var(--green)' },
  { label: 'VSI Baseline',  value: 'σF₀=1.2 NORMAL ✓',    color: 'var(--green)' },
  { label: 'GNN FraudRing', value: '0.0 — CLEAR',          color: 'var(--green)' },
  { label: 'Fcombined',     value: '9.1% — CLEAR',         color: 'var(--green)' },
  { label: 'CUS Score',     value: '78 → Tier B',          color: 'var(--cyan)'  },
]

const KFS_ROWS = [
  ['Loan Amount',            '₹15,00,000'],
  ['Annual Percentage Rate', '8.83%'     ],
  ['Tenure',                 '84 months' ],
  ['Monthly EMI',            '₹15,432'   ],
  ['Processing Fee',         '0.50% + GST'],
  ['Prepayment Charges',     'Nil after 6mo'],
  ['Cooling-off Period',     '72 hours'  ],
  ['Disbursal Account',      'Penny Drop ✓'],
]

function Confetti({ active }) {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (!active) { setPieces([]); return }
    const colors = ['#00ff88', '#00d4ff', '#f5c518', '#ff3366', '#ffffff']
    setPieces(
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.5,
        duration: Math.random() * 2 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
      }))
    )
  }, [active])

  if (!active && pieces.length === 0) return null

  return (
    <div style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 999,
      overflow: 'hidden',
    }}>
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: '-10px',
            width: p.size,
            height: p.size / 2,
            background: p.color,
            borderRadius: 2,
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
/* ── EMI Amortisation Chart ── */
function AmortChart({ principal, rate, months }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    const W    = canvas.width
    const H    = canvas.height
    const padL = 10, padR = 10, padT = 10, padB = 24

    const monthly = rate / 12 / 100
    const emi = (principal * monthly * Math.pow(1 + monthly, months)) /
                (Math.pow(1 + monthly, months) - 1)

    let balance = principal
    const interestArr = []
    const principalArr = []

    for (let i = 0; i < months; i++) {
      const int  = balance * monthly
      const prin = emi - int
      interestArr.push(int)
      principalArr.push(prin)
      balance -= prin
    }

    const maxVal = Math.max(...interestArr.map((v, i) => v + principalArr[i]))
    const chartW = W - padL - padR
    const chartH = H - padT - padB
    const barW   = chartW / months

    ctx.clearRect(0, 0, W, H)

    for (let i = 0; i < months; i++) {
      const x    = padL + i * barW
      const intH = (interestArr[i]  / maxVal) * chartH
      const prH  = (principalArr[i] / maxVal) * chartH

      ctx.fillStyle = 'rgba(255,51,102,0.7)'
      ctx.fillRect(x, padT + chartH - intH, barW - 0.5, intH)

      ctx.fillStyle = 'rgba(0,255,136,0.7)'
      ctx.fillRect(x, padT + chartH - intH - prH, barW - 0.5, prH)
    }

    /* X labels */
    ;[0, 23, 47, 71, 83].forEach(i => {
      ctx.fillStyle = 'rgba(107,125,143,0.8)'
      ctx.font = '8px DM Mono, monospace'
      ctx.textAlign = 'center'
      ctx.fillText(`M${i + 1}`, padL + (i + 0.5) * barW, H - 6)
    })
  }, [principal, rate, months])

  return <canvas ref={canvasRef} width={340} height={110} style={{ width: '100%', height: 'auto' }} />
}

/* ── Radial Score ── */
function RadialScore({ score, label, color, size = 70 }) {
  const c = 2 * Math.PI * 24
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <circle cx="35" cy="35" r="24" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="5" />
      <circle cx="35" cy="35" r="24" fill="none" stroke={color} strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
        transform="rotate(-90 35 35)"
        style={{ transition: 'stroke-dashoffset 1.8s ease' }}
      />
      <text x="35" y="32" textAnchor="middle" fill={color}
        fontSize="11" fontFamily="Orbitron,sans-serif" fontWeight="700">{score}</text>
      <text x="35" y="44" textAnchor="middle" fill="rgba(70, 109, 148, 0.8)"
        fontSize="7" fontFamily="DM Mono,monospace">{label}</text>
    </svg>
  )
}

export default function Offer() {
  const [narrative,    setNarrative]    = useState('')
  const [signed,       setSigned]       = useState(false)
  const [signing,      setSigning]      = useState(false)
  const [confetti,     setConfetti]     = useState(false)
  const [showCooling,  setShowCooling]  = useState(false)
  const [revealed,     setRevealed]     = useState(true) // Set to true to avoid initial flicker
  const [activeTab,    setActiveTab]    = useState('breakdown')
  const [nirf,         setNirf]         = useState(10)
  const [bureau,       setBureau]       = useState(742)
  const [showAudit,    setShowAudit]    = useState(false)
  const [pdfPulse,     setPdfPulse]     = useState(false)
  const [compareOpen,  setCompareOpen]  = useState(false)
  const [ratePulse,    setRatePulse]    = useState(false)
  const [countdown,    setCountdown]    = useState(null)

  /* ── Computed live rate ── */
  const nirfDiscount  = nirf <= 10 ? 0.30 : nirf <= 50 ? 0.15 : 0.05
  const bureauRisk    = bureau >= 750 ? 0.70 : bureau >= 700 ? 0.88 : bureau >= 650 ? 1.20 : 1.60
  const liveRate      = (9.0 + bureauRisk - 0.75 - nirfDiscount).toFixed(2)

  useEffect(() => {
    const fetchNarrative = async () => {
      try {
        const result = await generateOfferNarrative()
        setNarrative(result.text)
      } catch (error) {
        console.error('Error generating offer narrative:', error)
        setNarrative('We are unable to generate your offer narrative at the moment. Please try again later.')
      }
    }

    fetchNarrative()
  }, [])

  /* Rate pulse on slider change — skip on first mount */
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setRatePulse(true)
    const t = setTimeout(() => setRatePulse(false), 600)
    return () => clearTimeout(t)
  }, [nirf, bureau])

  /* Cooling off countdown */
  useEffect(() => {
    if (showCooling) {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === 1) {
            clearInterval(interval)
            return null
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [showCooling])

  function handleSign() {
    setSigning(true)
    setTimeout(() => {
      setSigning(false)
      setSigned(true)
      setShowCooling(true)
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4000)
    }, 2200)
  }

  function handleDownload() {
    setPdfPulse(true)
    setTimeout(() => setPdfPulse(false), 1000)
    const content = `POONAWALLA FINCORP — KEY FACT STATEMENT
=====================================
Applicant   : Priya Sharma
Session     : #PFL-2026-0847
Date        : ${new Date().toLocaleDateString('en-IN')}

LOAN DETAILS
------------
Loan Amount         : Rs. 15,00,000
Interest Rate (p.a.): 8.83%
Tenure              : 84 months
Monthly EMI         : Rs. 15,432
Processing Fee      : 0.50% + 18% GST
Prepayment Charges  : Nil after 6 months
Cooling-off Period  : 72 hours

RATE DERIVATION
---------------
RBI Repo + NBFC Spread : +9.00%
Risk Premium (CUS=78)  : +0.88%
CLV Discount           : -0.75%
NIRF Discount (IIT)    : -0.30%
Final Rate             : 8.83%

XAI AUDIT TRAIL
---------------
BIS Score    : 0.78 WARM
Geo Verified : Chennai, India
Age Match    : 23 = Aadhaar
Liveness     : PASSED
VSI          : NORMAL
Fraud Ring   : CLEAR (0.0)
CUS Score    : 78 - Tier B

Compliant with RBI DLG 2022, V-CIP 2020, DPDP Act 2023
Signed via Leegality | Audit log stored: S3 Mumbai`

    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'PFL_KFS_Priya_Sharma.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabs = [
    { id: 'breakdown',  label: 'Rate Breakdown' },
    { id: 'calculator', label: 'Live Calculator' },
    { id: 'amort',      label: 'Amortisation'   },
    { id: 'compare',    label: 'Bank Compare'    },
  ]

  const competitors = [
    { name: 'SBI Education', rate: '10.90%', badge: null         },
    { name: 'HDFC Credila',  rate: '10.25%', badge: null         },
    { name: 'Axis Bank',     rate: '11.50%', badge: null         },
    { name: 'Loan Wizard',   rate:  `${liveRate}%`, badge: 'BEST' },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh', // Ensure full-screen layout
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <Confetti active={confetti} />

      {/* ── Hero card ── */}
      <div className="card card-hi" style={{
        padding: '24px 28px', marginBottom: 14,
        position: 'relative', overflow: 'hidden',
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'translateY(0)' : 'translateY(16px)',
        transition: 'all 0.6s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 20% 0%, rgba(0,212,255,0.07) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontFamily: 'DM Mono, monospace', fontSize: 9,
              color: 'var(--cyan)', letterSpacing: '0.15em', marginBottom: 3,
            }}>
              LOAN WIZARD — PERSONALISED OFFER · SESSION #PFL-2026-0847
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 11,
              color: 'var(--muted)', marginBottom: 18,
            }}>
              PRIYA SHARMA · IIT BOMBAY · EDUCATION LOAN
            </div>

            {/* Stat tiles */}
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { label: 'SANCTIONED',  value: '₹15,00,000', color: 'var(--gold)'  },
                { label: 'RATE p.a.',   value: `${liveRate}%`, color: ratePulse ? 'var(--cyan)' : 'var(--green)', pulse: ratePulse },
                { label: 'TENURE',      value: '84 months',  color: 'var(--cyan)'  },
                { label: 'MONTHLY EMI', value: '₹15,432',    color: 'var(--text)'  },
              ].map((s, i) => (
                <div key={s.label} style={{
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.5s ease ${0.1 + i * 0.1}s`,
                }}>
                  <div style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace',
                    color: 'var(--muted)', marginBottom: 4, letterSpacing: '0.06em',
                  }}>
                    {s.label}
                  </div>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: 20, fontWeight: 700, color: s.color,
                    transition: 'color 0.3s ease',
                    textShadow: s.pulse ? `0 0 20px ${s.color}` : 'none',
                  }}>
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Radial scores */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <RadialScore score={78}  label="CUS"    color="var(--cyan)"  />
            <RadialScore score={94}  label="FRAUD ✓" color="var(--green)" />
            <RadialScore score={742 > 750 ? 95 : 88} label="BUREAU" color="var(--gold)" />
          </div>
        </div>

        {/* Gemini narrative */}
        {narrative ? (
          <div style={{
            marginTop: 16,
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: '12px 16px',
            fontSize: 12.5, lineHeight: 1.8,
            color: 'var(--text)', fontStyle: 'italic',
            animation: 'fadeUp 0.6s ease',
          }}>
            "{narrative}"
          </div>
        ) : (
          <div style={{
            marginTop: 16, padding: '12px 16px',
            fontFamily: 'DM Mono, monospace',
            fontSize: 11, color: 'var(--muted)',
            animation: 'pulse 1.5s infinite',
          }}>
            ⟳ Generating personalised narrative via Gemini...
          </div>
        )}
      </div>

      {/* ── Main grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

        {/* Left — tabbed panel */}
        <div className="card" style={{
          opacity: revealed ? 1 : 0,
          transition: 'opacity 0.6s ease 0.3s',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border)',
          }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                flex: 1, padding: '10px 6px',
                border: 'none', background: 'transparent',
                fontFamily: 'DM Mono, monospace', fontSize: 9,
                cursor: 'pointer', letterSpacing: '0.04em',
                color: activeTab === t.id ? 'var(--cyan)' : 'var(--muted)',
                borderBottom: activeTab === t.id
                  ? '2px solid var(--cyan)'
                  : '2px solid transparent',
                transition: 'all 0.2s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 18 }}>

            {/* Tab: Rate Breakdown */}
            {activeTab === 'breakdown' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{
                  fontSize: 9, color: 'var(--muted)',
                  fontFamily: 'DM Mono, monospace',
                  marginBottom: 12, opacity: 0.7,
                }}>
                  r = r_base + r_risk − r_CLV − r_NIRF
                </div>
                {RATE_COMPONENTS.map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text)' }}>{c.label}</div>
                        <div style={{
                          fontSize: 9, color: 'var(--muted)',
                          fontFamily: 'DM Mono, monospace', marginTop: 2,
                        }}>
                          {c.sublabel}
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'DM Mono, monospace',
                        fontSize: 14, fontWeight: 600, color: c.color,
                      }}>
                        {c.display}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', paddingTop: 12,
                }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 12 }}>
                    FINAL RATE
                  </span>
                  <span style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: 24, color: 'var(--green)', fontWeight: 700,
                  }}>
                    = {liveRate}%
                  </span>
                </div>
              </div>
            )}

            {/* Tab: Live Calculator */}
            {activeTab === 'calculator' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 10, fontFamily: 'DM Mono, monospace',
                    color: 'var(--muted)', marginBottom: 6,
                  }}>
                    <span>NIRF Rank: <span style={{ color: 'var(--cyan)' }}>{nirf}</span></span>
                    <span style={{ color: 'var(--green)' }}>
                      Discount: −{nirfDiscount.toFixed(2)}%
                    </span>
                  </div>
                  <input type="range" min="1" max="200" value={nirf}
                    onChange={e => setNirf(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--cyan)' }}
                  />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 8, color: 'var(--muted)', fontFamily: 'DM Mono, monospace',
                  }}>
                    <span>Top 10</span><span>Top 50</span><span>Top 200</span>
                  </div>
                </div>

                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 10, fontFamily: 'DM Mono, monospace',
                    color: 'var(--muted)', marginBottom: 6,
                  }}>
                    <span>Bureau Score: <span style={{ color: 'var(--gold)' }}>{bureau}</span></span>
                    <span style={{ color: bureau >= 700 ? 'var(--green)' : 'var(--red)' }}>
                      {bureau >= 750 ? 'EXCELLENT' : bureau >= 700 ? 'GOOD' : bureau >= 650 ? 'FAIR' : 'POOR'}
                    </span>
                  </div>
                  <input type="range" min="300" max="900" value={bureau}
                    onChange={e => setBureau(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold)' }}
                  />
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 8, color: 'var(--muted)', fontFamily: 'DM Mono, monospace',
                  }}>
                    <span>300</span><span>600</span><span>900</span>
                  </div>
                </div>

                {/* Live result */}
                <div style={{
                  background: 'rgba(0,212,255,0.06)',
                  border: ratePulse ? '1px solid var(--cyan)' : '1px solid var(--border)',
                  borderRadius: 8, padding: 16, textAlign: 'center',
                  transition: 'border-color 0.3s ease',
                  boxShadow: ratePulse ? '0 0 20px rgba(0,212,255,0.2)' : 'none',
                }}>
                  <div style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace',
                    color: 'var(--muted)', marginBottom: 6,
                  }}>
                    COMPUTED RATE — LIVE
                  </div>
                  <div style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: 32, fontWeight: 700,
                    color: ratePulse ? 'var(--cyan)' : 'var(--green)',
                    transition: 'color 0.3s ease',
                  }}>
                    {liveRate}%
                  </div>
                  <div style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace',
                    color: 'var(--muted)', marginTop: 6,
                  }}>
                    9.00 + {bureauRisk.toFixed(2)} − 0.75 − {nirfDiscount.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Amortisation */}
            {activeTab === 'amort' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{
                  fontSize: 9, fontFamily: 'DM Mono, monospace',
                  color: 'var(--muted)', marginBottom: 10,
                }}>
                  Principal vs Interest paid per month over 84 months
                </div>
                <AmortChart principal={1500000} rate={parseFloat(liveRate)} months={84} />
                <div style={{
                  display: 'flex', gap: 14, marginTop: 8 }}>
                  <span style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace',
                    color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      width: 10, height: 10,
                      background: 'rgba(0,255,136,0.7)', borderRadius: 2,
                      display: 'inline-block',
                    }} />
                    Principal
                  </span>
                  <span style={{
                    fontSize: 9, fontFamily: 'DM Mono, monospace',
                    color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{
                      width: 10, height: 10,
                      background: 'rgba(255,51,102,0.7)', borderRadius: 2,
                      display: 'inline-block',
                    }} />
                    Interest
                  </span>
                </div>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gap: 8, marginTop: 12,
                }}>
                  {[
                    { l: 'Total Interest', v: '₹2,96,288'  },
                    { l: 'Total Payable',  v: '₹17,96,288' },
                    { l: 'Interest Saved vs SBI (10.9%)', v: '₹1,68,420' },
                    { l: 'Breakeven Month', v: 'Month 48'  },
                  ].map(d => (
                    <div key={d.l} style={{
                      background: 'var(--bg3)', borderRadius: 6, padding: '7px 10px',
                    }}>
                      <div style={{
                        fontSize: 9, color: 'var(--muted)',
                        fontFamily: 'DM Mono, monospace',
                      }}>
                        {d.l}
                      </div>
                      <div style={{
                        fontSize: 12, fontFamily: 'DM Mono, monospace',
                        fontWeight: 600, marginTop: 2,
                      }}>
                        {d.v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Bank Compare */}
            {activeTab === 'compare' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                <div style={{
                  fontSize: 9, fontFamily: 'DM Mono, monospace',
                  color: 'var(--muted)', marginBottom: 14,
                }}>
                  Market comparison for ₹15L education loan · IIT Bombay profile
                </div>
                {competitors.map((b, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px', marginBottom: 8,
                    borderRadius: 8,
                    background: b.badge
                      ? 'rgba(0,255,136,0.07)'
                      : 'var(--bg3)',
                    border: b.badge
                      ? '1px solid rgba(0,255,136,0.25)'
                      : '1px solid transparent',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: b.badge ? 'var(--green)' : 'var(--muted)',
                        animation: b.badge ? 'pulse 2s infinite' : 'none',
                      }} />
                      <span style={{
                        fontSize: 12, fontFamily: 'DM Mono, monospace',
                        color: b.badge ? 'var(--text)' : 'var(--muted)',
                      }}>
                        {b.name}
                      </span>
                      {b.badge && (
                        <span className="tag tag-g" style={{ fontSize: 8 }}>BEST RATE</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 80 }}>
                        <div className="score-bar">
                          <div className="score-fill" style={{
                            width: `${(1 - (parseFloat(b.rate) - 8) / 4) * 100}%`,
                            background: b.badge ? 'var(--green)' : 'var(--muted)',
                          }} />
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'Orbitron, sans-serif', fontSize: 13,
                        color: b.badge ? 'var(--green)' : 'var(--muted)',
                        fontWeight: 700, minWidth: 52, textAlign: 'right',
                      }}>
                        {b.rate}
                      </span>
                    </div>
                  </div>
                ))}
                <div style={{
                  marginTop: 10, padding: 8,
                  background: 'rgba(0,212,255,0.07)',
                  borderRadius: 6, fontSize: 10,
                  fontFamily: 'DM Mono, monospace', color: 'var(--cyan)',
                  textAlign: 'center',
                }}>
                  Saving ₹1,68,420 in interest vs market average
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — KFS + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* KFS */}
          <div className="card" style={{
            padding: 18,
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.6s ease 0.45s',
          }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              KEY FACT STATEMENT (RBI DLG 2022)
            </div>
            {KFS_ROWS.map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 11, fontFamily: 'DM Mono, monospace',
              }}>
                <span style={{ color: 'var(--muted)' }}>{k}</span>
                <span style={{ color: 'var(--text)' }}>{v}</span>
              </div>
            ))}
            <div style={{
              marginTop: 10, padding: 7,
              background: 'rgba(0,255,136,0.06)',
              border: '1px solid rgba(0,255,136,0.2)',
              borderRadius: 6, fontSize: 9,
              fontFamily: 'DM Mono, monospace',
              color: 'var(--green)', textAlign: 'center',
            }}>
              ✓ Auto-generated · Read aloud · Digitally signed
            </div>
            {showCooling && countdown && (
              <div style={{
                marginTop: 8, padding: 8,
                background: 'rgba(245,197,24,0.07)',
                border: '1px solid rgba(245,197,24,0.25)',
                borderRadius: 6, fontSize: 10,
                fontFamily: 'DM Mono, monospace',
                color: 'var(--gold)', animation: 'fadeUp 0.4s ease',
                textAlign: 'center',
              }}>
                ⏱ Cooling-off ends in: <strong>{countdown}</strong>
              </div>
            )}
          </div>

          {/* XAI audit toggle */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: showAudit ? 12 : 0,
            }}>
              <div style={{
                fontSize: 10, color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                letterSpacing: '0.08em',
              }}>
                XAI DECISION AUDIT TRAIL
              </div>
              <button
                onClick={() => setShowAudit(a => !a)}
                className="btn"
                style={{ fontSize: 10, padding: '4px 10px' }}
              >
                {showAudit ? '▲ Hide' : '▼ Expand'}
              </button>
            </div>

            {showAudit && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                {AUDIT_ROWS.map(r => (
                  <div key={r.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '5px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    fontSize: 11, fontFamily: 'DM Mono, monospace',
                  }}>
                    <span style={{ color: 'var(--muted)' }}>{r.label}</span>
                    <span style={{ color: r.color, fontSize: 10 }}>{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 12,
            }}>
              ACTIONS
            </div>

            {!signed ? (
              <button
                className="btn btn-p"
                onClick={handleSign}
                disabled={signing}
                style={{
                  width: '100%', marginBottom: 8,
                  fontSize: 12, padding: '10px',
                  opacity: signing ? 0.7 : 1,
                  animation: !signing ? 'glow2 2s infinite' : 'none',
                }}
              >
                {signing ? '⟳ Generating eSign document...' : '🖊 e-SIGN KFS WITH LEEGALITY'}
              </button>
            ) : (
              <div style={{
                marginBottom: 8, padding: 12,
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 7, textAlign: 'center',
                animation: 'fadeUp 0.4s ease',
              }}>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 13, color: 'var(--green)', marginBottom: 3,
                }}>
                  ✓ KFS SIGNED SUCCESSFULLY
                </div>
                <div style={{
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 9, color: 'var(--muted)',
                }}>
                  Leegality · {new Date().toLocaleString('en-IN')}
                </div>
              </div>
            )}

            <button
              className={`btn btn-g ${pdfPulse ? 'btn-p' : ''}`}
              onClick={handleDownload}
              style={{
                width: '100%', marginBottom: 8,
                fontSize: 12, padding: '10px',
                transition: 'all 0.3s ease',
              }}
            >
              {pdfPulse ? '⟳ Preparing download...' : '⬇ DOWNLOAD KFS DOCUMENT'}
            </button>

            <button
              className="btn"
              onClick={() => setCompareOpen(true)}
              style={{ width: '100%', fontSize: 12, padding: '10px' }}
            >
              📊 SHARE OFFER SUMMARY
            </button>

            {/* Session summary */}
            <div style={{
              marginTop: 12, padding: 8,
              background: 'var(--bg3)', borderRadius: 6,
              fontFamily: 'DM Mono, monospace', fontSize: 9,
              color: 'var(--muted)', lineHeight: 1.8,
            }}>
              Session: #PFL-2026-0847 · Duration: 7m 42s<br />
              Cost: ₹24 · Human equiv: ₹800 · Saved: 97%<br />
              Audit: Encrypted · S3 Mumbai · DPDP compliant
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {compareOpen && (
        <div
          onClick={() => setCompareOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <div
            className="card card-hi"
            onClick={e => e.stopPropagation()}
            style={{ padding: 28, maxWidth: 400, width: '90%', animation: 'fadeUp 0.3s ease' }}
          >
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              color: 'var(--cyan)', fontSize: 12,
              letterSpacing: '0.1em', marginBottom: 16,
            }}>
              📊 OFFER SUMMARY
            </div>

            <div style={{
              background: 'var(--bg3)', borderRadius: 8,
              padding: 16, fontFamily: 'DM Mono, monospace',
              fontSize: 11.5, lineHeight: 2, marginBottom: 16,
            }}>
              <span style={{ color: 'var(--muted)' }}>Applicant:</span>{' '}
              <strong>Priya Sharma</strong><br />
              <span style={{ color: 'var(--muted)' }}>Loan:</span>{' '}
              ₹15,00,000 Education Loan<br />
              <span style={{ color: 'var(--muted)' }}>Rate:</span>{' '}
              <strong style={{ color: 'var(--green)' }}>{liveRate}%</strong> p.a.<br />
              <span style={{ color: 'var(--muted)' }}>EMI:</span>{' '}
              ₹15,432/month · 84 months<br />
              <span style={{ color: 'var(--muted)' }}>Saving vs market:</span>{' '}
              <strong style={{ color: 'var(--gold)' }}>₹1,68,420</strong><br />
              <span style={{ color: 'var(--muted)' }}>Session ID:</span>{' '}
              #PFL-2026-0847
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-g"
                style={{ flex: 1, fontSize: 11 }}
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `Poonawalla Fincorp Loan Offer\nPriya Sharma — ₹15L Education Loan\nRate: ${liveRate}% | EMI: ₹15,432/mo\nSession: #PFL-2026-0847`
                  )
                  setCompareOpen(false)
                }}
              >
                📋 Copy to Clipboard
              </button>
              <button
                className="btn btn-p"
                style={{ flex: 1, fontSize: 11 }}
                onClick={() => setCompareOpen(false)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glow keyframe */}
      <style>{`
        @keyframes glow2 {
          0%, 100% { box-shadow: 0 0 8px rgba(0,212,255,0.3); }
          50%       { box-shadow: 0 0 22px rgba(0,212,255,0.7); }
        }
      `}</style>
    </div>
  )
}