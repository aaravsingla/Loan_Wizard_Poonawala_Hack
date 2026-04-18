import { useState, useEffect } from 'react'
import { generateOfferNarrative } from '../utils/gemini'

const RATE_COMPONENTS = [
  {
    label: 'RBI Repo + NBFC Spread',
    sublabel: 'base rate fetched live',
    value: '+9.00%',
    color: 'var(--text)',
  },
  {
    label: 'Risk Premium',
    sublabel: 'CUS=78 → (0.22 × 4%)',
    value: '+0.88%',
    color: 'var(--red)',
  },
  {
    label: 'CLV Discount',
    sublabel: 'high lifetime value segment',
    value: '−0.75%',
    color: 'var(--green)',
  },
  {
    label: 'NIRF Discount',
    sublabel: 'IIT Bombay top-10 placement',
    value: '−0.30%',
    color: 'var(--green)',
  },
]

const KFS_ROWS = [
  ['Loan Amount',         '₹15,00,000'],
  ['Annual Percentage Rate', '8.83%'],
  ['Tenure',             '84 months'],
  ['Monthly EMI',        '₹15,432'],
  ['Processing Fee',     '0.50% + 18% GST'],
  ['Prepayment Charges', 'Nil after 6 months'],
  ['Cooling-off Period', '72 hours'],
  ['Disbursal Account',  'Verified via Penny Drop'],
]

const AUDIT_ROWS = [
  { label: 'BIS Score',      value: '0.78 — WARM',         color: 'var(--cyan)'  },
  { label: 'Geo Verified',   value: 'Chennai, India ✓',    color: 'var(--green)' },
  { label: 'Age Matched',    value: '23 = Aadhaar (Δ=0) ✓', color: 'var(--green)' },
  { label: 'Liveness',       value: 'Blink + head-turn ✓', color: 'var(--green)' },
  { label: 'VSI Baseline',   value: 'σF₀=1.2 NORMAL ✓',   color: 'var(--green)' },
  { label: 'GNN FraudRing',  value: '0.0 — CLEAR',         color: 'var(--green)' },
  { label: 'Fcombined',      value: '9.1% — CLEAR',        color: 'var(--green)' },
  { label: 'CUS Score',      value: '78 → Tier B',         color: 'var(--cyan)'  },
  { label: 'NIRF Rank',      value: 'IIT Bombay #1',       color: 'var(--gold)'  },
  { label: 'Bureau Score',   value: '742 — STRONG',        color: 'var(--cyan)'  },
]

const HERO_STATS = [
  { label: 'SANCTIONED AMOUNT', value: '₹15,00,000', color: 'var(--gold)'  },
  { label: 'INTEREST RATE p.a.', value: '8.83%',     color: 'var(--green)' },
  { label: 'TENURE',            value: '84 months',  color: 'var(--cyan)'  },
  { label: 'MONTHLY EMI',       value: '₹15,432',    color: 'var(--text)'  },
]

export default function Offer() {
  const [narrative,  setNarrative]  = useState({ text: '', source: null })
  const [signed,     setSigned]     = useState(false)
  const [signing,    setSigning]    = useState(false)
  const [showCooling, setShowCooling] = useState(false)
  const [revealed,   setRevealed]   = useState(false)

  useEffect(() => {
    /* Staggered reveal */
    const t = setTimeout(() => setRevealed(true), 300)

    /* Gemini narrative */
    generateOfferNarrative().then(setNarrative)

    return () => clearTimeout(t)
  }, [])

  function handleSign() {
    setSigning(true)
    setTimeout(() => {
      setSigning(false)
      setSigned(true)
      setShowCooling(true)
    }, 2200)
  }

  return (
    <div style={{ padding: '22px 24px', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Hero card ── */}
      <div
        className="card card-hi"
        style={{
          padding: 30, marginBottom: 14,
          position: 'relative', overflow: 'hidden',
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.6s ease',
        }}
      >
        {/* Subtle glow background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center top, rgba(0,212,255,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            color: 'var(--cyan)', letterSpacing: '0.15em', marginBottom: 4,
          }}>
            LOAN WIZARD — PERSONALISED OFFER
          </div>
          <div style={{
            fontFamily: 'DM Mono, monospace', fontSize: 10,
            color: 'var(--muted)',
          }}>
            PRIYA SHARMA · IIT BOMBAY · EDUCATION LOAN · SESSION #PFL-2026-0847
          </div>
        </div>

        {/* Stat tiles */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, marginBottom: narrative && narrative.text ? 22 : 0,
        }}>
          {HERO_STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? 'translateY(0)' : 'translateY(10px)',
                transition: `all 0.5s ease ${0.1 + i * 0.1}s`,
              }}
            >
              <div style={{
                fontSize: 9, fontFamily: 'DM Mono, monospace',
                color: 'var(--muted)', marginBottom: 6,
                letterSpacing: '0.06em',
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 22, fontWeight: 700, color: s.color,
              }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Gemini narrative */}
        {narrative && narrative.text && (
          <div style={{
            background: 'rgba(0,212,255,0.05)',
            border: '1px solid var(--border)',
            borderRadius: 8, padding: 14,
            fontSize: 13, lineHeight: 1.75,
            color: 'var(--text)', fontStyle: 'italic',
            animation: 'fadeUp 0.6s ease',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
              fontSize: 10
            }}>
              <span style={{
                color: 'var(--muted)',
                fontFamily: 'DM Mono, monospace',
                fontStyle: 'normal'
              }}>
                OFFER NARRATIVE
              </span>
              {narrative.source === 'api' && (
                <span style={{
                  background: 'rgba(0,255,136,0.2)',
                  color: 'var(--green)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  fontStyle: 'normal'
                }}>
                  ✓ LIVE API
                </span>
              )}
              {narrative.source === 'fallback' && (
                <span style={{
                  background: 'rgba(255,51,102,0.2)',
                  color: 'var(--red)',
                  padding: '2px 6px',
                  borderRadius: 3,
                  fontSize: 8,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  fontStyle: 'normal'
                }}>
                  ⚠ FALLBACK
                </span>
              )}
            </div>
            "{narrative.text}"
          </div>
        )}

        {!narrative || !narrative.text && (
          <div style={{
            padding: 14,
            fontFamily: 'DM Mono, monospace',
            fontSize: 11, color: 'var(--muted)',
            animation: 'pulse 1.5s infinite',
          }}>
            Generating personalised narrative via Gemini...
          </div>
        )}
      </div>

      {/* ── 3-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>

        {/* Col 1 — Rate derivation */}
        <div
          className="card"
          style={{
            padding: 20,
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.6s ease 0.3s',
          }}
        >
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.08em', marginBottom: 4,
          }}>
            RATE DERIVATION — LIVE
          </div>
          <div style={{
            fontSize: 9, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            marginBottom: 14, opacity: 0.7,
          }}>
            r = r_base + r_risk − r_CLV − r_NIRF
          </div>

          {RATE_COMPONENTS.map((c, i) => (
            <div
              key={i}
              style={{
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
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
                  fontSize: 13, fontWeight: 600, color: c.color,
                }}>
                  {c.value}
                </span>
              </div>
            </div>
          ))}

          {/* Final rate */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', paddingTop: 12, marginTop: 4,
          }}>
            <span style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: 12, color: 'var(--text)',
            }}>
              FINAL RATE
            </span>
            <span style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: 22, color: 'var(--green)', fontWeight: 700,
            }}>
              = 8.83%
            </span>
          </div>

          {/* Compliance badges */}
          <div style={{
            marginTop: 14, display: 'flex', gap: 5, flexWrap: 'wrap',
          }}>
            {['RBI DLG 2022', 'V-CIP', 'DPDP 2023', 'AA-Ready'].map(b => (
              <span key={b} className="tag tag-c" style={{ fontSize: 9 }}>{b}</span>
            ))}
          </div>
        </div>

        {/* Col 2 — KFS */}
        <div
          className="card"
          style={{
            padding: 20,
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.6s ease 0.45s',
          }}
        >
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.08em', marginBottom: 14,
          }}>
            KEY FACT STATEMENT (RBI DLG)
          </div>

          {KFS_ROWS.map(([k, v]) => (
            <div
              key={k}
              style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 11, fontFamily: 'DM Mono, monospace',
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ color: 'var(--text)', textAlign: 'right' }}>{v}</span>
            </div>
          ))}

          {/* Compliance strip */}
          <div style={{
            marginTop: 12, padding: 8,
            background: 'rgba(0,255,136,0.06)',
            border: '1px solid rgba(0,255,136,0.2)',
            borderRadius: 6,
            fontSize: 10, fontFamily: 'DM Mono, monospace',
            color: 'var(--green)', textAlign: 'center',
          }}>
            ✓ KFS auto-generated · Read aloud · Digitally signed
          </div>

          {/* Cooling off notice */}
          {showCooling && (
            <div style={{
              marginTop: 10, padding: 8,
              background: 'rgba(245,197,24,0.07)',
              border: '1px solid rgba(245,197,24,0.25)',
              borderRadius: 6,
              fontSize: 10, fontFamily: 'DM Mono, monospace',
              color: 'var(--gold)',
              animation: 'fadeUp 0.4s ease',
            }}>
              ⏱ 72-hour cooling-off period started · Cancellation available until{' '}
              {new Date(Date.now() + 72 * 3600000).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </div>
          )}
        </div>

        {/* Col 3 — XAI Audit + Sign */}
        <div
          className="card"
          style={{
            padding: 20, display: 'flex', flexDirection: 'column',
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.6s ease 0.6s',
          }}
        >
          <div style={{
            fontSize: 10, color: 'var(--muted)',
            fontFamily: 'DM Mono, monospace',
            letterSpacing: '0.08em', marginBottom: 12,
          }}>
            XAI DECISION AUDIT TRAIL
          </div>

          {AUDIT_ROWS.map(r => (
            <div
              key={r.label}
              style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
                padding: '5px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontSize: 11, fontFamily: 'DM Mono, monospace',
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{r.label}</span>
              <span style={{ color: r.color, textAlign: 'right', fontSize: 10 }}>
                {r.value}
              </span>
            </div>
          ))}

          <div style={{ flex: 1 }} />

          {/* Sign button */}
          {!signed ? (
            <button
              className="btn btn-p"
              onClick={handleSign}
              disabled={signing}
              style={{
                width: '100%', marginTop: 14, fontSize: 12,
                opacity: signing ? 0.7 : 1,
              }}
            >
              {signing ? '⟳ Generating eSign...' : '🖊 e-SIGN KFS WITH LEEGALITY'}
            </button>
          ) : (
            <div style={{
              marginTop: 14, padding: 10,
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.3)',
              borderRadius: 7, textAlign: 'center',
              animation: 'fadeUp 0.4s ease',
            }}>
              <div style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 11, color: 'var(--green)', marginBottom: 3,
              }}>
                ✓ KFS SIGNED
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
            className="btn btn-g"
            style={{ width: '100%', marginTop: 8, fontSize: 12 }}
          >
            ⬇ DOWNLOAD KFS PDF
          </button>

          {/* Session summary */}
          <div style={{
            marginTop: 12, padding: 8,
            background: 'var(--bg3)', borderRadius: 6,
            fontFamily: 'DM Mono, monospace', fontSize: 9,
            color: 'var(--muted)', lineHeight: 1.7,
          }}>
            Session: #PFL-2026-0847<br />
            Duration: 7m 42s · Cost: ₹24<br />
            Human equivalent: ₹800 · Saved: 97%<br />
            Audit log: Encrypted · S3 Mumbai
          </div>
        </div>

      </div>
    </div>
  )
}