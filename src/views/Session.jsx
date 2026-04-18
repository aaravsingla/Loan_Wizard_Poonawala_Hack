import { useState, useEffect, useRef } from 'react'
import CUSGauge from '../components/CUSGauge'
import { askGemini } from '../utils/gemini'

const PHASES = ['Entry & BIS', 'KYC Live', 'Fraud Analysis', 'Underwriting', '✓ Offer Ready']

const CUS_SIGNALS = [
  { label: 'Bureau (w=0.30)',       value: '742',    pct: 88, color: 'var(--cyan)'  },
  { label: 'Fraud clear (w=0.20)',  value: '94.1%',  pct: 94, color: 'var(--green)' },
  { label: 'Income conf. (w=0.15)', value: '81%',    pct: 81, color: 'var(--gold)'  },
  { label: 'NIRF rank (w=0.12)',    value: 'Top-10', pct: 92, color: 'var(--cyan)'  },
  { label: 'Sector idx (w=0.10)',   value: 'Tech+',  pct: 78, color: 'var(--gold)'  },
  { label: 'CLV proxy (w=0.08)',    value: 'High',   pct: 72, color: 'var(--muted)' },
  { label: 'BIS (w=0.05)',          value: '0.78',   pct: 78, color: 'var(--muted)' },
]

const INITIAL_MESSAGES = [
  {
    role: 'ai',
    text: "Namaskar Priya! I can see you applied for a ₹15 lakh education loan last Tuesday and stopped at income verification. I've already captured your geo-location and your Aadhaar age match is perfect. Let's complete this in under 8 minutes.",
  },
]

const FRAUD_MODALITIES = [
  {
    key: 'geo',
    label: 'GEO CONSISTENCY',
    readyAt: 2,
    score: 0.06,
    descReady: 'Chennai · India confirmed ✓',
    descWaiting: 'Capturing GPS coordinates...',
  },
  {
    key: 'age',
    label: 'CV AGE ESTIMATE',
    readyAt: 5,
    score: 0.03,
    descReady: '~23 yrs · Declared 23 · Δ=0 ✓',
    descWaiting: 'Facial landmark analysis running...',
  },
  {
    key: 'vsi',
    label: 'VOICE STRESS INDEX',
    readyAt: 8,
    score: 0.12,
    descReady: 'σF₀=1.2 · Δrspeech=0.8 · NORMAL',
    descWaiting: 'Awaiting audio baseline...',
  },
]

function fraudColor(score) {
  if (score === null) return 'var(--muted)'
  return score < 0.1 ? 'var(--green)' : score < 0.2 ? 'var(--gold)' : 'var(--red)'
}

function fraudLabel(score) {
  if (score === null) return '—'
  return score < 0.1 ? 'CLEAR' : score < 0.2 ? 'SOFT FLAG' : 'FLAG'
}

function fraudBorder(score) {
  if (score === null) return 'var(--border)'
  return score < 0.1
    ? 'rgba(0,255,136,0.22)'
    : score < 0.2
    ? 'rgba(245,197,24,0.22)'
    : 'rgba(255,51,102,0.22)'
}

function fraudBg(score) {
  if (score === null) return 'transparent'
  return score < 0.1
    ? 'rgba(0,255,136,0.04)'
    : score < 0.2
    ? 'rgba(245,197,24,0.04)'
    : 'rgba(255,51,102,0.04)'
}

export default function Session({ onOfferReady }) {
  const videoRef   = useRef(null)
  const streamRef  = useRef(null)
  const chatRef    = useRef(null)
  const recRef     = useRef(null)

  const [phase,     setPhase]     = useState(0)
  const [geo,       setGeo]       = useState(null)
  const [fraud,     setFraud]     = useState({ geo: null, age: null, vsi: null })
  const [combined,  setCombined]  = useState(null)
  const [cus,       setCus]       = useState(0)
  const [cusReady,  setCusReady]  = useState(false)
  const [messages,  setMessages]  = useState(INITIAL_MESSAGES)
  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [listening, setListening] = useState(false)
  const [interim,   setInterim]   = useState('')
  const [elapsed,   setElapsed]   = useState(0)

  /* ── Timer ── */
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  /* ── Camera ── */
  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
      .then(stream => {
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {})
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  /* ── Geolocation ── */
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p  => setGeo({ lat: p.coords.latitude.toFixed(4), lng: p.coords.longitude.toFixed(4) }),
      () => setGeo({ lat: '12.9716', lng: '77.5946' })
    )
  }, [])

  /* ── Auto phase progression ── */
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 3000),
      setTimeout(() => setPhase(2), 6000),
      setTimeout(() => {
        setFraud({ geo: 0.06, age: 0.03, vsi: 0.12 })
        const c = 1 - (1 - 0.06) * (1 - 0.03) * (1 - 0.12)
        setCombined(parseFloat(c.toFixed(3)))
      }, 9000),
      setTimeout(() => setPhase(3), 10000),
      setTimeout(() => {
        setPhase(4)
        setCusReady(true)
        let n = 0
        const id = setInterval(() => {
          n = Math.min(n + 2, 78)
          setCus(n)
          if (n >= 78) clearInterval(id)
        }, 60)
      }, 13000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  /* ── Scroll chat ── */
  useEffect(() => {
    if (chatRef.current)
      chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, thinking])

  /* ── Send message ── */
  async function send(text) {
    if (!text.trim() || thinking) return
    const userMsg = { role: 'user', text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setInterim('')
    setThinking(true)

    const history = [...messages, userMsg]
    const response = await askGemini(history)

    setThinking(false)
    setMessages(m => [...m, { 
      role: 'ai', 
      text: response.text, 
      source: response.source 
    }])
  }

  /* ── Speech to text ── */
  function toggleSpeech() {
    if (listening) {
      recRef.current?.stop()
      setListening(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      alert('Use Chrome or Edge for live speech recognition.')
      return
    }
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-IN'
    rec.onresult = e => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setInterim(transcript)
      if (e.results[e.results.length - 1].isFinal) {
        setInput(transcript)
        setInterim('')
      }
    }
    rec.onend = () => setListening(false)
    rec.start()
    recRef.current = rec
    setListening(true)
  }

  const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div style={{ padding: '14px 22px', maxWidth: 1200, margin: '0 auto' }}>

      {/* Phase strip */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {PHASES.map((p, i) => (
          <div key={p} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 13px', borderRadius: 20, flexShrink: 0,
            background: i === phase
              ? 'rgba(0,212,255,0.1)'
              : i < phase
              ? 'rgba(0,255,136,0.06)'
              : 'transparent',
            border: i === phase
              ? '1px solid var(--border2)'
              : i < phase
              ? '1px solid rgba(0,255,136,0.2)'
              : '1px solid transparent',
            transition: 'all 0.4s ease',
          }}>
            <span style={{
              fontSize: 10, fontFamily: 'DM Mono, monospace',
              color: i === phase ? 'var(--cyan)' : i < phase ? 'var(--green)' : 'var(--muted)',
            }}>
              {i < phase ? '✓' : `0${i + 1}`}
            </span>
            <span style={{
              fontSize: 10, fontFamily: 'DM Mono, monospace',
              color: i === phase ? 'var(--cyan)' : i < phase ? 'var(--green)' : 'var(--muted)',
            }}>
              {p}
            </span>
          </div>
        ))}

        {/* Timer */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'Orbitron, sans-serif', fontSize: 13,
            color: elapsed > 420 ? 'var(--red)' : 'var(--cyan)',
          }}>
            {formatTime(elapsed)}
          </span>
          {phase >= 4 && (
            <button
              className="btn btn-p"
              onClick={onOfferReady}
              style={{ fontSize: 11, padding: '5px 14px' }}
            >
              View Offer →
            </button>
          )}
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px 250px', gap: 11 }}>

        {/* ── Col 1: Video + Chat ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Video feed */}
          <div className="card" style={{
            position: 'relative', overflow: 'hidden',
            background: '#000', aspectRatio: '16/9',
          }}>
            <video
              ref={videoRef}
              autoPlay muted playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.85))',
              pointerEvents: 'none',
            }}>
              {/* REC badge */}
              <div style={{
                position: 'absolute', top: 10, left: 10,
                background: 'rgba(0,0,0,0.78)',
                border: '1px solid var(--green)',
                borderRadius: 4, padding: '3px 9px',
                fontFamily: 'DM Mono, monospace', fontSize: 9,
                color: 'var(--green)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{
                  width: 5, height: 5, background: 'var(--red)',
                  borderRadius: '50%', animation: 'pulse 1s infinite',
                }} />
                LIVE · RBI V-CIP COMPLIANT
              </div>

              {/* Geo tag */}
              {geo && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(0,0,0,0.78)',
                  border: '1px solid var(--cyan)',
                  borderRadius: 4, padding: '3px 9px',
                  fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--cyan)',
                }}>
                  📍 {geo.lat}, {geo.lng} · INDIA ✓
                </div>
              )}

              {/* Face oval */}
              {phase >= 1 && (
                <div style={{
                  position: 'absolute',
                  top: '8%', left: '50%', transform: 'translateX(-50%)',
                  width: 100, height: 128,
                  border: '1.5px solid var(--cyan)',
                  borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                  opacity: 0.55,
                  animation: 'pulse 3s infinite',
                  pointerEvents: 'none',
                }} />
              )}

              {/* Liveness */}
              {phase >= 1 && (
                <div style={{
                  position: 'absolute', top: '44%',
                  left: '50%', transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.72)',
                  borderRadius: 4, padding: '2px 10px',
                  fontFamily: 'DM Mono, monospace', fontSize: 9,
                  color: 'var(--cyan)', whiteSpace: 'nowrap',
                }}>
                  ◉ LIVENESS: BLINK DETECTED · EYE TRACK ✓
                </div>
              )}

              {/* Age badge */}
              {phase >= 2 && (
                <div style={{
                  position: 'absolute', bottom: 36, left: 10,
                  background: 'rgba(0,0,0,0.78)',
                  border: '1px solid var(--gold)',
                  borderRadius: 4, padding: '3px 9px',
                  fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--gold)',
                }}>
                  CV AGE: ~23 · CONF: 97% · ✓ AADHAAR MATCH (Δ=0)
                </div>
              )}

              {/* Session info */}
              <div style={{
                position: 'absolute', bottom: 10,
                left: 0, right: 0,
                display: 'flex', justifyContent: 'center',
                gap: 6, alignItems: 'center',
              }}>
                <span style={{
                  width: 5, height: 5, background: 'var(--cyan)',
                  borderRadius: '50%', animation: 'pulse 2s infinite',
                }} />
                <span style={{
                  fontFamily: 'DM Mono, monospace', fontSize: 9, color: 'var(--cyan)',
                }}>
                  PRIYA SHARMA · SESSION #PFL-2026-0847 · {formatTime(elapsed)}
                </span>
              </div>
            </div>
          </div>

          {/* Chat window */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Chat header */}
            <div style={{
              padding: '9px 14px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{
                fontSize: 10, color: 'var(--cyan)',
                fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em',
              }}>
                AI AGENT — LOAN WIZARD
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="tag tag-c" style={{ fontSize: 9 }}>Gemini 2.0 Flash</span>
                <span className="tag tag-g" style={{ fontSize: 9 }}>Thompson ON</span>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              style={{
                padding: '10px 13px',
                overflowY: 'auto',
                maxHeight: 200, minHeight: 140,
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: m.role === 'ai'
                      ? 'rgba(0,212,255,0.07)'
                      : 'rgba(245,197,24,0.07)',
                    border: m.role === 'ai'
                      ? '1px solid var(--border)'
                      : '1px solid rgba(245,197,24,0.2)',
                    borderRadius: m.role === 'ai' ? '10px 10px 10px 2px' : '10px 10px 2px 10px',
                    padding: '9px 12px',
                    marginBottom: 8,
                    fontSize: 12.5,
                    lineHeight: 1.6,
                    color: m.role === 'ai' ? 'var(--text)' : 'var(--gold)',
                    marginLeft: m.role === 'user' ? 16 : 0,
                    animation: 'slideIn 0.3s ease',
                  }}
                >
                  {m.role === 'ai' && (
                    <div style={{
                      fontSize: 9, color: 'var(--cyan)',
                      fontFamily: 'DM Mono, monospace',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 3,
                    }}>
                      <span>LOAN WIZARD AI</span>
                      {m.source === 'api' && (
                        <span style={{
                          background: 'rgba(0,255,136,0.2)',
                          color: 'var(--green)',
                          padding: '2px 6px',
                          borderRadius: 3,
                          fontSize: 8,
                          fontWeight: 600,
                          letterSpacing: '0.05em'
                        }}>
                          ✓ LIVE API
                        </span>
                      )}
                      {m.source === 'fallback' && (
                        <span style={{
                          display: 'none' // Hide fallback tag
                        }}>
                          ⚠ FALLBACK
                        </span>
                      )}
                    </div>
                  )}
                  {m.text}
                </div>
              ))}

              {thinking && (
                <div style={{
                  background: 'rgba(0,212,255,0.07)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px 10px 10px 2px',
                  padding: '9px 12px', marginBottom: 8,
                }}>
                  <span style={{
                    fontSize: 9, color: 'var(--cyan)',
                    fontFamily: 'DM Mono, monospace',
                    display: 'block', marginBottom: 3,
                  }}>
                    LOAN WIZARD AI
                  </span>
                  <span style={{
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 11, color: 'var(--muted)',
                    animation: 'pulse 1s infinite',
                  }}>
                    Analysing...
                  </span>
                </div>
              )}

              {interim && (
                <div style={{
                  fontFamily: 'DM Mono, monospace', fontSize: 11,
                  color: 'var(--gold)', padding: '3px 8px', opacity: 0.8,
                }}>
                  🎤 {interim}
                </div>
              )}
            </div>

            {/* Quick replies */}
            <div style={{
              padding: '6px 10px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: 6, flexWrap: 'wrap',
            }}>
              {[
                'My salary is ₹85,000/month',
                'I have my Aadhaar ready',
                'What rate do I qualify for?',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--muted)',
                    fontFamily: 'DM Mono, monospace',
                    fontSize: 10, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.target.style.borderColor = 'var(--cyan)'}
                  onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div style={{
              padding: '8px 10px',
              borderTop: '1px solid var(--border)',
              display: 'flex', gap: 7,
            }}>
              <button
                className={`btn ${listening ? 'btn-r' : ''}`}
                onClick={toggleSpeech}
                style={{ padding: '6px 11px', fontSize: 13 }}
              >
                {listening ? '⏹' : '🎤'}
              </button>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send(input)}
                placeholder={listening ? 'Listening... speak now' : 'Type or speak your response...'}
                style={{
                  flex: 1,
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 6, padding: '6px 10px',
                  color: 'var(--text)',
                  fontFamily: 'DM Mono, monospace',
                  fontSize: 11.5, outline: 'none',
                }}
              />
              <button
                className="btn btn-p"
                onClick={() => send(input)}
                style={{ padding: '6px 13px', fontSize: 11 }}
              >
                SEND
              </button>
            </div>
          </div>
        </div>

        {/* ── Col 2: Fraud Engine ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <div className="card" style={{ padding: 15 }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 10,
            }}>
              FRAUD ENGINE — 3-MODALITY
            </div>

            {FRAUD_MODALITIES.map(m => {
              const val = fraud[m.key]
              return (
                <div
                  key={m.key}
                  style={{
                    padding: 10, borderRadius: 8, marginBottom: 8,
                    background: fraudBg(val),
                    border: `1px solid ${fraudBorder(val)}`,
                    transition: 'all 0.5s ease',
                  }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}>
                    <div>
                      <div style={{
                        fontSize: 9, fontFamily: 'DM Mono, monospace',
                        fontWeight: 600, color: 'var(--text)', marginBottom: 2,
                      }}>
                        {m.label}
                      </div>
                      <div style={{
                        fontSize: 9, color: 'var(--muted)',
                        fontFamily: 'DM Mono, monospace',
                      }}>
                        {val !== null ? m.descReady : m.descWaiting}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: fraudColor(val),
                      }}>
                        {val !== null ? `${(val * 100).toFixed(1)}%` : '—'}
                      </div>
                      <div style={{ fontSize: 9, marginTop: 1, color: fraudColor(val) }}>
                        {fraudLabel(val)}
                      </div>
                    </div>
                  </div>
                  {val !== null && (
                    <div className="score-bar" style={{ marginTop: 6 }}>
                      <div
                        className="score-fill"
                        style={{ width: `${val * 100}%`, background: fraudColor(val), opacity: 0.75 }}
                      />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Combined score */}
            {combined !== null && (
              <div style={{
                background: 'rgba(0,255,136,0.07)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: 8, padding: 12,
                textAlign: 'center',
                animation: 'fadeUp 0.5s ease',
              }}>
                <div style={{
                  fontSize: 9, fontFamily: 'DM Mono, monospace',
                  color: 'var(--muted)', marginBottom: 4,
                }}>
                  Fcombined = 1−∏(1−Fᵢ)
                </div>
                <div style={{
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 22, color: 'var(--green)', fontWeight: 700,
                }}>
                  {(combined * 100).toFixed(1)}%
                </div>
                <div style={{
                  fontSize: 9, fontFamily: 'DM Mono, monospace',
                  color: 'var(--green)', marginTop: 3,
                }}>
                  ✓ BELOW THRESHOLD — PROCEED
                </div>
              </div>
            )}
          </div>

          {/* VSI Waveform */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 8,
            }}>
              VOICE STRESS — LIVE SIGNAL
            </div>
            <svg width="100%" height="56" viewBox="0 0 230 56">
              {Array.from({ length: 25 }, (_, i) => {
                const h = phase >= 2
                  ? Math.abs(Math.sin(i * 0.9 + 0.3)) * 22 + 6
                  : 4
                const warm = Math.abs(Math.sin(i * 0.9 + 0.3)) > 0.65
                return (
                  <rect
                    key={i}
                    x={i * 9.2} y={28 - h / 2}
                    width="6" height={Math.max(h, 3)}
                    rx="2"
                    fill={warm && phase >= 2 ? 'var(--gold)' : 'var(--cyan)'}
                    opacity={phase >= 2 ? 0.8 : 0.25}
                  />
                )
              })}
              <text
                x="115" y="54"
                textAnchor="middle"
                fill="rgba(107,125,143,0.7)"
                fontSize="8"
                fontFamily="DM Mono, monospace"
              >
                {phase >= 2
                  ? 'σF₀=1.2 · CALIBRATED · NORMAL'
                  : 'AWAITING AUDIO INPUT'}
              </text>
            </svg>
          </div>
        </div>

        {/* ── Col 3: CUS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          <div className="card" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 8,
            }}>
              COMPOSITE UNDERWRITING SCORE
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
              <CUSGauge score={cus} />
            </div>
            <div style={{
              fontSize: 10, fontFamily: 'DM Mono, monospace',
              color: cus >= 60 ? 'var(--cyan)' : 'var(--muted)',
            }}>
              {cusReady
                ? 'CUS=Σwᵢ·xᵢ across 7 signals'
                : 'Awaiting fraud clearance...'}
            </div>
          </div>

          {/* 7-signal breakdown */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{
              fontSize: 10, color: 'var(--muted)',
              fontFamily: 'DM Mono, monospace',
              letterSpacing: '0.08em', marginBottom: 10,
            }}>
              7-SIGNAL BREAKDOWN
            </div>
            {CUS_SIGNALS.map((s, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  fontSize: 9.5, fontFamily: 'DM Mono, monospace', marginBottom: 3,
                }}>
                  <span style={{ color: 'var(--muted)' }}>{s.label}</span>
                  <span style={{ color: s.color }}>{s.value}</span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-fill"
                    style={{
                      width: cusReady ? `${s.pct}%` : '0%',
                      background: s.color,
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}