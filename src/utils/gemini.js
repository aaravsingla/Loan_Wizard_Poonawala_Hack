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
    if (!API_KEY || API_KEY === '00') {
      console.warn('Gemini API key not configured')
      return { text: getFallback(conversationHistory), source: 'fallback' }
    }

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

    let retries = 3
    while (retries > 0) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        })

        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded. Retrying after delay...')
          retries--
          await delay(2000)
          continue
        }

        if (!response.ok) {
          console.error('❌ API error:', response.status)
          return { text: getFallback(conversationHistory), source: 'fallback' }
        }

        const data = await response.json()

        // FIX 1: Correctly parse the Gemini API response structure
        if (data && data.candidates && data.candidates.length > 0) {
          return { text: data.candidates[0].content.parts[0].text, source: 'api' }
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
        await delay(2000)
      }
    }
    
    // FIX 2: Return the fallback if the while loop exits due to running out of retries (like on repeated 429s)
    return { text: getFallback(conversationHistory), source: 'fallback' }

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

  // Specific questions and their corresponding answers
  const questionAnswerMap = [
    {
      question: "What is my loan eligibility?",
      answer: "Based on your CUS score of 78 and IIT Bombay's 94% placement rate, you qualify for ₹15 lakh at 8.83%. The rate is derived live — repo 6.5% + NBFC spread 2.5% + risk 0.88% − CLV discount 0.75% − NIRF discount 0.30%."
    },
    {
      question: "What documents are required?",
      answer: "Your Aadhaar XML has been pulled via DigiLocker API successfully. PAN linkage confirmed. All three fraud modalities are reading clean — you're well within clearance thresholds."
    },
    {
      question: "What is the interest rate?",
      answer: "The interest rate for your loan is 8.83%, which is derived live based on your profile and the current RBI repo rate of 6.5%."
    },
    {
      question: "How is my income verified?",
      answer: "Your declared monthly income has been captured via STT. Cross-referencing with your IIT Bombay placement data now — average package for your batch is ₹18.4 LPA which aligns well."
    },
    {
      question: "What is my credit score?",
      answer: "Your bureau score is 742, which is considered strong. This has positively impacted your loan eligibility and interest rate."
    },
    {
      question: "What is the loan tenure?",
      answer: "The loan tenure for your ₹15 lakh education loan is up to 10 years, with flexible repayment options available."
    },
    {
      question: "What is the processing fee?",
      answer: "The processing fee for your loan is ₹10,000, which is a one-time charge. This fee is non-refundable."
    },
    {
      question: "Can I prepay my loan?",
      answer: "Yes, you can prepay your loan at any time without any prepayment charges. This allows you to save on interest costs."
    },
    {
      question: "What happens if I miss an EMI?",
      answer: "If you miss an EMI, a late payment fee of 2% of the overdue amount will be charged. We recommend setting up auto-debit to avoid this."
    },
    {
      question: "What is the disbursal process?",
      answer: "Once your loan is approved, the amount will be directly disbursed to IIT Bombay's account within 3 working days."
    },
    {
      question: "My salary is ₹85,000/month",
      answer: "Based on your CUS score of 78 and IIT Bombay's 94% placement rate, you qualify for ₹15 lakh at 8.83%. The rate is derived live — repo 6.5% + NBFC spread 2.5% + risk 0.88% − CLV discount 0.75% − NIRF discount 0.30%."
    },
    {
      question: "I have my Aadhaar ready",
      answer: "Your Aadhaar XML has been pulled via DigiLocker API successfully. PAN linkage confirmed. All three fraud modalities are reading clean — you're well within clearance thresholds."
    },
    {
      question: "What rate do I qualify for?",
      answer: "The interest rate for your loan is 8.83%, which is derived live based on your profile and the current RBI repo rate of 6.5%."
    }
  ];

  // Find the specific answer for the last question
  const matchedQA = questionAnswerMap.find(qa => last.includes(qa.question.toLowerCase()));
  if (matchedQA) {
    return matchedQA.answer;
  }

  // Default response if no match is found
  return "I'm sorry, I couldn't understand your question. Could you please rephrase?";
}

const SUGGESTED_QUESTIONS = [
  "What is my loan eligibility?",
  "What documents are required?",
  "What is the interest rate?"
];

export { SUGGESTED_QUESTIONS };