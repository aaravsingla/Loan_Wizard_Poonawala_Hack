const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

const APPLICANT_CONTEXT = `You are Loan Wizard, an agentic AI loan officer at Poonawalla Fincorp conducting a live RBI V-CIP compliant video session.

Applicant: Priya Sharma | Age: 23
Loan: ₹15 lakh Education Loan
Institute: IIT Bombay (NIRF Rank 1, 94% placement rate)
Drop-off point: Income Verification step
Prior attempt: Last Tuesday

Live verified signals:
- Geo: Chennai, India — VERIFIED
- CV Age estimate: ~23 yrs — MATCHES Aadhaar (Δ=0)
- Voice Stress Index: 1.2σ — NORMAL range
- Bureau score: 742 — STRONG
- Fraud combined score: 0.09 — CLEAR
- CUS score: 78 — Tier B

Your personality: warm, concise, professional. You surface math when relevant.
Always use ₹ symbol for rupees. Keep responses to 2-3 sentences max.
You are mid-session — identity is already verified, now confirming income details.`

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function askGemini(conversationHistory) {
  try {
    // Check if API key is loaded
    if (!API_KEY || API_KEY === '00') {
      console.warn('Gemini API key not configured')
      return { text: getFallback(conversationHistory), source: 'fallback' }
    }

    console.log('📡 Calling Gemini API with key:', API_KEY.slice(0, 10) + '...')

    const contents = conversationHistory.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }))

    const requestBody = {
      system_instruction: { parts: [{ text: APPLICANT_CONTEXT }] },
      contents,
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.7,
      }
    }

    console.log('📦 Request body:', requestBody)

    let retries = 3
    while (retries > 0) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        console.log('📬 API Response status:', response.status)

        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded. Retrying after delay...')
          retries--
          await delay(2000) // Wait for 2 seconds before retrying
          continue
        }

        if (!response.ok) {
          console.error('❌ API error:', response.status)
          const errorDetails = await response.json()
          console.error('❌ API error details:', errorDetails)
          return { text: getFallback(conversationHistory), source: 'fallback' }
        }

        const data = await response.json()
        console.log('✅ API Response data:', data)

        if (data && data.candidates && data.candidates.length > 0) {
          return { text: data.candidates[0].output, source: 'api' }
        } else {
          console.warn('⚠️ No candidates returned by API. Falling back.')
          return { text: getFallback(conversationHistory), source: 'fallback' }
        }
      } catch (error) {
        console.error('❌ Network or other error:', error)
        retries--
        if (retries === 0) {
          console.error('❌ All retries failed. Falling back.')
          return { text: getFallback(conversationHistory), source: 'fallback' }
        }
        console.warn('⚠️ Retrying after error...')
        await delay(2000) // Wait for 2 seconds before retrying
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return { text: getFallback(conversationHistory), source: 'fallback' }
  }
}

export async function generateOfferNarrative() {
  try {
    // Check if API key is loaded
    if (!API_KEY || API_KEY === '00') {
      console.warn('Gemini API key not configured')
      return { text: DEFAULT_NARRATIVE, source: 'fallback' }
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `Write exactly 2 warm professional sentences congratulating Priya Sharma on qualifying for a ₹15 lakh IIT Bombay education loan at 8.83% from Poonawalla Fincorp. Mention her bureau score of 742, IIT Bombay NIRF rank, and the live RBI repo rate of 6.5% contributed to this rate. Use ₹ symbol. No preamble, just the 2 sentences.` }]
        }],
        generationConfig: { maxOutputTokens: 120, temperature: 0.6 }
      })
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} ${response.statusText}`)
      const errorData = await response.json()
      console.error('API response:', errorData)
      return { text: DEFAULT_NARRATIVE, source: 'fallback' }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || DEFAULT_NARRATIVE
    console.log('✓ Using live Gemini API for offer narrative')
    return { text, source: text !== DEFAULT_NARRATIVE ? 'api' : 'fallback' }

  } catch (err) {
    console.error('Gemini offer narrative error:', err)
    return { text: DEFAULT_NARRATIVE, source: 'fallback' }
  }
}

const DEFAULT_NARRATIVE = `Congratulations Priya — your bureau score of 742, IIT Bombay's top NIRF ranking, and the current RBI repo rate of 6.5% have combined to qualify you for our best Tier B offer. This rate of 8.83% has been derived live from your exact profile, not a generic band.`

function getFallback(history) {
  const last = history[history.length - 1]?.text?.toLowerCase() || ''

  if (last.includes('income') || last.includes('salary') || last.includes('earn'))
    return `Thank you Priya. Your declared monthly income has been captured via STT. Cross-referencing with your IIT Bombay placement data now — average package for your batch is ₹18.4 LPA which aligns well.`

  if (last.includes('document') || last.includes('aadhaar') || last.includes('pan'))
    return `Your Aadhaar XML has been pulled via DigiLocker API successfully. PAN linkage confirmed. All three fraud modalities are reading clean — you're well within clearance thresholds.`

  if (last.includes('loan') || last.includes('amount') || last.includes('interest'))
    return `Based on your CUS score of 78 and IIT Bombay's 94% placement rate, you qualify for ₹15 lakh at 8.83%. The rate is derived live — repo 6.5% + NBFC spread 2.5% + risk 0.88% − CLV discount 0.75% − NIRF discount 0.30%.`

  if (last.includes('hello') || last.includes('hi') || last.includes('namaskar'))
    return `Namaskar Priya! I can see you applied for a ₹15L education loan last Tuesday and stopped at income verification. I've already verified your geo-location as Chennai and your Aadhaar age match is perfect. Let's complete this in under 8 minutes.`

  return `Your profile is looking strong, Priya. Bureau score of 742 puts you in the top quartile for education loan applicants. The fraud engine has cleared all three modalities — geo, age, and voice stress are all nominal.`
}