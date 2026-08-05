import { NextRequest, NextResponse } from 'next/server'

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ''
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent'

const INAPPROPRIATE_PATTERNS = [
  /\b(porn|xxx|nsfw|nude|sex\s*chat|adult\s*content)\b/i,
  /\b(hack\s*account|steal|phishing|malware\s*download)\b/i,
  /\b(buy\s*guns?|illegal\s*drugs?|how\s*to\s*kill)\b/i,
]

function isInappropriate(query: string): boolean {
  return INAPPROPRIATE_PATTERNS.some((pattern) => pattern.test(query))
}

const cache = new Map<string, { data: any; time: number }>()
const CACHE_TTL = 5 * 60 * 1000

function getCached(query: string) {
  const entry = cache.get(query)
  if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data
  return null
}

function setCached(query: string, data: any) {
  cache.set(query, { data, time: Date.now() })
  if (cache.size > 200) cache.delete(cache.keys().next().value!)
}

let lastGeminiCall = 0
const MIN_INTERVAL = 1500

async function callGemini(prompt: string): Promise<string | null> {
  const now = Date.now()
  const wait = MIN_INTERVAL - (now - lastGeminiCall)
  if (wait > 0) await new Promise(r => setTimeout(r, wait))

  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 1024 },
      }),
    })
    lastGeminiCall = Date.now()

    if (res.status === 429) return null
    if (!res.ok) return null

    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch {
    return null
  }
}

async function searchTavily(query: string) {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'advanced',
        include_answer: true,
        include_images: true,
        include_image_descriptions: true,
        max_results: 10,
      }),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function cleanContent(text: string): string {
  return text
    .replace(/\[edit\]|\[citation needed\]|\[\d+\]|\[dead link\]|\[\s*[a-z]+\s*\]/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/##\s*\w+/g, '')
    .trim()
}

function buildFallbackAnswer(query: string, searchResults: any[], tavilyAnswer: string): string {
  const parts: string[] = []

  if (tavilyAnswer && tavilyAnswer.length > 50) {
    parts.push(tavilyAnswer)
  }

  for (const r of searchResults.slice(0, 5)) {
    const text = cleanContent(r.content || r.snippet || '')
    if (text.length > 80) {
      parts.push(text)
      if (parts.length >= 3) break
    }
  }

  return parts.join('\n\n')
}

async function generateLongAnswer(query: string, searchResults: any[], country: string, tavilyAnswer: string): Promise<string> {
  const contextItems = searchResults.slice(0, 8).map((r: any) =>
    `Title: ${r.title}\nURL: ${r.url}\nContent: ${r.content?.substring(0, 800) || r.snippet || ''}`
  ).join('\n\n')

  const countryContext = country
    ? `The user is located in ${country}. If the question relates to locations, measurements, or comparisons, tailor the answer to be relevant from their perspective.`
    : ''

  const prompt = `You are a knowledgeable, conversational AI assistant. Answer the user's question in a **fairly long, detailed paragraph** — about 5-8 sentences. Be warm and engaging, like a smart friend explaining something interesting.

${countryContext}

Rules:
- NEVER start with "According to..." or "Based on..." — just answer directly.
- Write conversationally, not like an essay.
- Include specific facts, numbers, dates, and interesting context.
- End the paragraph naturally — no need for follow-up questions.

User's question: ${query}

Web search data:
${contextItems}

Your detailed answer:`

  const answer = await callGemini(prompt)
  if (answer) return answer

  return buildFallbackAnswer(query, searchResults, tavilyAnswer)
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') || ''
  if (!query.trim()) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  if (isInappropriate(query)) {
    return NextResponse.json({
      query,
      aiOverview: '',
      sources: [],
      results: { allResults: [], videoResults: [], imageResults: [], shoppingResults: [], mapResults: [] },
      isInappropriate: true,
    })
  }

  const cached = getCached(query)
  if (cached) return NextResponse.json(cached)

  const country = req.cookies.get('country')?.value || req.cookies.get('user-country')?.value || req.cookies.get('location')?.value || ''

  const tavilyData = await searchTavily(query)

  if (!tavilyData || !tavilyData.results || tavilyData.results.length === 0) {
    return NextResponse.json({
      query,
      aiOverview: '',
      sources: [],
      results: { allResults: [], videoResults: [], imageResults: [], shoppingResults: [], mapResults: [] },
      isInappropriate: false,
    })
  }

  const sources = tavilyData.results.slice(0, 5).map((r: any) => {
    let domain = r.source || ''
    if (!domain) {
      try { domain = new URL(r.url).hostname.replace('www.', '') } catch {}
    }
    return {
      title: r.title || '',
      url: r.url || '',
      domain,
      content: r.content?.substring(0, 200) || '',
    }
  })

  const allResults = tavilyData.results.map((r: any) => ({
    title: r.title || '',
    url: r.url || '',
    source: r.source || '',
    snippet: r.content?.substring(0, 300) || '',
  }))

  const images = tavilyData.images?.map((img: any) => ({
    title: img.description || img.url?.split('/').pop() || 'Image',
    url: img.url || '',
    source: img.source || '',
    snippet: img.description || '',
  })) || []

  const aiOverview = await generateLongAnswer(query, tavilyData.results, country, tavilyData.answer || '')

  const fallbackForTab = (prefix: string, count: number, baseUrl: string) => {
    const arr = []
    for (let i = 0; i < count; i++) {
      arr.push({
        title: `${query} - ${prefix} ${i + 1}`,
        url: baseUrl,
        source: prefix,
        snippet: `${prefix} results for ${query}`,
        ...(prefix === 'Shopping' ? { price: '$' + (Math.floor(Math.random() * 900) + 100) + '.' + String(Math.floor(Math.random() * 99)).padStart(2, '0') } : {}),
      })
    }
    return arr
  }

  const result = {
    query,
    aiOverview,
    sources,
    results: {
      allResults,
      videoResults: fallbackForTab('Video', 4, `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`),
      imageResults: images.length > 0 ? images : fallbackForTab('Image', 4, `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`),
      shoppingResults: fallbackForTab('Shopping', 4, `https://www.amazon.com/s?k=${encodeURIComponent(query)}`),
      mapResults: fallbackForTab('Map', 4, `https://www.google.com/maps/search/${encodeURIComponent(query)}`),
    },
    isInappropriate: false,
  }

  setCached(query, result)
  return NextResponse.json(result)
}