import { useState } from 'react'
import BISRing from '../components/BISRing'
import Counter from '../components/Counter'

const APPLICANTS = [
  {
    name: 'Priya Sharma',
    loan: '₹15L Education',
    step: 'Income Verification',
    bis: 0.78,
    institute: 'IIT Bombay',
    bureau: 742,
    time: '2h ago',
    phone: '+91 98765 43210',
  },
  {
    name: 'Rahul Mehta',
    loan: '₹8L Personal',
    step: 'Document Upload',
    bis: 0.52,
    institute: 'BITS Pilani',
    bureau: 698,
    time: '4h ago',
    phone: '+91 87654 32109',
  },
  {
    name: 'Ananya Iyer',
    loan: '₹22L Education',
    step: 'KYC Init',
    bis: 0.31,
    institute: 'VIT Vellore',
    bureau: 621,
    time: '1d ago',
    phone: '+91 76543 21098',
  },
]

const TELEGRAM_MSG = (a) => `🏦 *Poonawalla Fincorp — Loan Wizard*

Hi ${a.name.split(' ')[0]}! Your *${a.loan}* application is pre-qualified.

You stopped at: _${a.step}_

Complete your loan in *8 minutes* via secure AI video call — no branch visit needed.

🔗 loanwizard.pfl.in/r?id=PFL${Math.random().toString(36).substr(2,8).toUpperCase()}

_RBI V\\-CIP compliant · Link valid 24h_`

export default function Dashboard({ onStartSession }) {
  const [sending, setSending] = useState(null)
  const [sent, setSent] = useState({})
  const [modal, setModal] = useState(null)

  function dispatch(index) {
    setSending(index)
    setTimeout(() => {
      setSending(null)
      setSent(s => ({ ...s, [index]: true }))
      setModal(APPLICANTS[index])
    }, 1800)
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
        marginBottom: 20
      }}>
        {[
          { label: 'ACTIVE SESSIONS',   value: 247,  color: 'var(--cyan)',  decimals: 0 },
          { label: 'RECOVERED TODAY',   value: 43,   color: 'var(--green)', decimals: 0 },
          { label: 'FRAUD FLAGS',       value: 7,    color: 'var(--red)',   decimals: 0 },
          { label: 'AVG CUS SCORE',     value: 71.4, color: 'var(--gold)',  decimals: 1 },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.1em',
              marginBottom: 6
            }}>
              {stat.label}
            </div>
            <div style={{
              fontSize: 30,
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              color: stat.color
            }}>
              <Counter value={stat.value} decimals={stat.decimals} duration={1200} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 14 }}>

        {/* Left — Applicant Queue */}
        <div>
          <div style={{
            fontSize: 9,
            color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.12em',
            marginBottom: 10
          }}>
            ► DROP-OFF QUEUE — RANKED BY BIS SCORE
          </div>

          {APPLICANTS.map((a, i) => (
            <div
              key={i}
              className={`card ${i === 0 ? 'card-hi' : ''}`}
              style={{
                padding: 18,
                marginBottom: 10,
                animation: `fadeUp 0.4s ease ${i * 0.1}s both`
              }}
            >
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

                <BISRing score={a.bis} />

                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{a.name}</div>
                      <div style={{
                        fontSize: 11,
                        color: 'var(--muted)',
                        fontFamily: 'DM Mono, monospace',
                        marginTop: 2
                      }}>
                        {a.loan} · Dropped @ {a.step}
                      </div>
                    </div>
                    <span className={`tag ${a.bis > 0.65 ? 'tag-g' : a.bis > 0.35 ? 'tag-y' : 'tag-r'}`}>
                      {a.bis > 0.65 ? 'WARM OPEN' : a.bis > 0.35 ? 'ASSIST MODE' : 'COLD — INCENTIVE'}
                    </span>
                  </div>

                  {/* Data chips */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 7,
                    marginBottom: 12
                  }}>
                    {[
                      { k: 'Institute', v: a.institute },
                      { k: 'Bureau',    v: a.bureau },
                      { k: 'Phone',     v: a.phone },
                      { k: 'Last seen', v: a.time },
                    ].map(d => (
                      <div key={d.k} style={{
                        background: 'var(--bg3)',
                        borderRadius: 6,
                        padding: '6px 10px'
                      }}>
                        <div style={{
                          fontSize: 9,
                          color: 'var(--muted)',
                          fontFamily: 'DM Mono, monospace'
                        }}>
                          {d.k}
                        </div>
                        <div style={{
                          fontSize: 11,
                          fontFamily: 'DM Mono, monospace',
                          fontWeight: 500,
                          marginTop: 2
                        }}>
                          {d.v}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* BIS formula */}
                  <div style={{
                    background: 'var(--bg3)',
                    borderRadius: 6,
                    padding: '7px 10px',
                    marginBottom: 12,
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 9.5,
                    color: 'var(--muted)',
                    borderLeft: '2px solid var(--cyan)'
                  }}>
                    BIS = σ(w₁·Δtclick + w₂·s_abandoned + w₃·n_attempts + w₄·d_score + w₅·t_day)
                    <span style={{ color: 'var(--cyan)', marginLeft: 8 }}>
                      = {a.bis.toFixed(2)} →
                      {a.bis > 0.65 ? ' Warm direct opening' : a.bis > 0.35 ? ' Offer assistance hook' : ' Surface incentive + escalate'}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {i === 0 && (
                      <button
                        className="btn btn-p"
                        onClick={onStartSession}
                        style={{ fontSize: 11, padding: '7px 16px' }}
                      >
                        ▶ START AI VIDEO SESSION
                      </button>
                    )}
                    <button
                      className={`btn ${sent[i] ? 'btn-g' : ''}`}
                      onClick={() => !sent[i] && dispatch(i)}
                      style={{ fontSize: 11, padding: '7px 14px' }}
                    >
                      {sending === i
                        ? '⟳ Dispatching...'
                        : sent[i]
                        ? '✓ Sent via Telegram'
                        : '📨 Send Re-engagement'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* System Health */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.1em',
              marginBottom: 12
            }}>
              SYSTEM HEALTH
            </div>
            {[
              ['API Gateway',         'LIVE',    'var(--green)'],
              ['Fraud Engine (3-mod)','LIVE',    'var(--green)'],
              ['Bureau Cache',        'LIVE',    'var(--green)'],
              ['Sarvam AI STT',       'LIVE',    'var(--green)'],
              ['PSI Monitor',         'NOMINAL', 'var(--cyan)'],
              ['GNN Fraud Ring',      'ACTIVE',  'var(--cyan)'],
              ['Thompson Sampling',   'LEARNING','var(--gold)'],
            ].map(([label, status, color]) => (
              <div key={label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{label}</span>
                <span style={{
                  fontSize: 9,
                  fontFamily: 'DM Mono, monospace',
                  color,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5
                }}>
                  <span style={{
                    width: 5, height: 5,
                    background: color,
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                  {status}
                </span>
              </div>
            ))}
          </div>

          {/* Platform Integrations */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{
              fontSize: 9,
              color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.1em',
              marginBottom: 12
            }}>
              PLATFORM INTEGRATIONS
            </div>
            {[
              { icon: '📨', label: 'Telegram Bot',    sub: 'Re-engagement active' },
              { icon: '💬', label: 'WhatsApp',         sub: 'Fallback channel' },
              { icon: '📱', label: 'SMS Gateway',      sub: '2FA + link delivery' },
              { icon: '🏦', label: 'CIBIL / Experian', sub: 'Bureau live' },
              { icon: '🆔', label: 'DigiLocker API',   sub: 'Aadhaar XML pull' },
              { icon: '✍️', label: 'Leegality eSign',  sub: 'KFS signing' },
            ].map(p => (
              <div key={p.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}>
                <span style={{ fontSize: 15 }}>{p.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontFamily: 'DM Mono, monospace' }}>{p.label}</div>
                  <div style={{
                    fontSize: 9,
                    color: 'var(--muted)',
                    fontFamily: 'DM Mono, monospace'
                  }}>
                    {p.sub}
                  </div>
                </div>
                <span className="tag tag-g" style={{ fontSize: 9 }}>LIVE</span>
              </div>
            ))}
          </div>

          {/* Market stat */}
          <div className="card" style={{ padding: 18, textAlign: 'center' }}>
            <div style={{
              fontSize: 9, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.1em', marginBottom: 8
            }}>
              INDIA DL MARKET BY 2030
            </div>
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 26, fontWeight: 900,
              color: 'var(--gold)'
            }}>
              $515B
            </div>
            <div style={{
              fontSize: 9, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace', marginTop: 4
            }}>
              CAGR 31.5% · 60–70% drop-off rate
            </div>
            <div style={{
              marginTop: 10,
              padding: '7px 10px',
              background: 'rgba(0,255,136,0.07)',
              borderRadius: 6,
              fontSize: 10,
              fontFamily: 'DM Mono, monospace',
              color: 'var(--green)'
            }}>
              96.9% cost reduction per session
            </div>
          </div>

        </div>
      </div>

      {/* Telegram Modal */}
      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 200
          }}
          onClick={() => setModal(null)}
        >
          <div
            className="card card-hi"
            style={{
              padding: 28, maxWidth: 480, width: '92%',
              animation: 'fadeUp 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              fontFamily: 'Orbitron, sans-serif',
              color: 'var(--cyan)', fontSize: 12,
              marginBottom: 4, letterSpacing: '0.08em'
            }}>
              📨 TELEGRAM RE-ENGAGEMENT DISPATCHED
            </div>
            <div style={{
              fontSize: 9, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace', marginBottom: 16
            }}>
              Via Bot API · WhatsApp & SMS fallback queued · Delivered in &lt;200ms
            </div>

            {/* Message preview */}
            <div style={{
              background: 'var(--bg3)',
              borderRadius: 8, padding: 14,
              marginBottom: 14,
              fontFamily: 'DM Mono, monospace',
              fontSize: 11.5, lineHeight: 1.85,
              whiteSpace: 'pre-wrap',
              borderLeft: '3px solid var(--cyan)'
            }}>
              {TELEGRAM_MSG(modal)}
            </div>

            {/* Meta chips */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: 8, marginBottom: 16
            }}>
              {[
                ['Cost',        '₹0.04  vs  ₹800 human'],
                ['Delivery',    '< 200ms via Bot API'],
                ['Channels',    'Telegram → WA → SMS'],
                ['BIS Routing', `${modal.bis > 0.65 ? 'Warm path' : modal.bis > 0.35 ? 'Assist path' : 'Incentive path'} opened`],
              ].map(([k, v]) => (
                <div key={k} style={{
                  background: 'var(--bg)',
                  borderRadius: 6, padding: '7px 10px'
                }}>
                  <div style={{
                    fontSize: 9, color: 'var(--muted)',
                    fontFamily: 'DM Mono, monospace'
                  }}>
                    {k}
                  </div>
                  <div style={{
                    fontSize: 11,
                    fontFamily: 'DM Mono, monospace',
                    marginTop: 2
                  }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-p"
              onClick={() => setModal(null)}
              style={{ width: '100%' }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}