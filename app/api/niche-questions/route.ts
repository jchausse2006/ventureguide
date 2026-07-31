import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { businessDescription } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are Vinny, a sharp business mentor inside the VentureGuide app. A user described their business as: "${businessDescription}"

Generate 4 to 6 follow-up questions that unlock the specific details needed to build a targeted roadmap for THIS exact business.

CRITICAL ACCURACY RULE — DO NOT BREAK THIS:
- NEVER invent or name companies, apps, products, or competitors
- If you are not completely certain a company exists and is well known, do not name it
- Describe the business model or category in plain language instead

WRONG: "Are you positioning against ThriftScan or ValueSnap?"
RIGHT: "Are you positioning against general resale marketplaces or specialist valuation tools?"

WRONG: "Similar to what GrooomPro does for mobile groomers"
RIGHT: "Similar to booking platforms built for mobile service providers"

Only name a company if it is genuinely famous and you are certain it exists — for example eBay, Shopify, Etsy, Uber, Instagram.

QUESTION RULES:
- Every question must be specific to the exact business described, not generic
- Each question should reveal something that genuinely changes their roadmap
- If they mentioned technology, ask about their stack or build approach
- If they mentioned a customer type, ask how they reach and close them
- If they mentioned pricing, ask about rates and positioning
- Each question gets 3 to 4 multiple choice options — never free text
- One option can be a nuanced middle-ground or "still deciding" answer
- Vinny tone: direct, honest, no fluff, sharp but respectful

Return ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question specific to their exact business",
      "sub": "One sentence on why this matters for their path",
      "vinny": "Vinny one-liner on why this question matters",
      "multi": false,
      "options": [
        { "val": "value", "title": "Option title", "desc": "Short description" }
      ]
    }
  ]
}

Business description: ${businessDescription}`,
        },
      ],
    })

    const text = (message.content[0] as { text: string }).text
    const clean = text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No JSON in response' }, { status: 500 })
    }
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Niche questions error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}