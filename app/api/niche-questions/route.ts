import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { businessDescription } = await req.json()

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
    }

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are Vinny, a sharp business mentor inside the VentureGuide app. A user has typed in a custom business they want to build: "${businessDescription}"

Your job is to generate 4 to 6 follow-up questions that will help you understand exactly what they are building so you can create a highly specific roadmap for them.

Rules:
- Questions must be specific to THIS exact business — not generic business questions
- Each question should unlock information that genuinely changes what the roadmap looks like
- Questions should feel like they come from a smart mentor who has seen this business category before
- Each question gets 3 to 4 answer options — no free text, always multiple choice
- One option per question can always be a nuanced middle ground or it depends type answer
- Vinny tone: direct, honest, no fluff, slightly sharp but respectful
- Include a short vinny field — a one-line comment from Vinny that explains WHY this question matters

Return ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question text",
      "sub": "One sentence explaining why this matters for their specific business",
      "vinny": "Vinny one-liner about this question",
      "multi": false,
      "options": [
        { "val": "value", "title": "Option title", "desc": "Short description" }
      ]
    }
  ]
}

Business: ${businessDescription}`,
        },
      ],
    })

    const text = (message.content[0] as { text: string }).text
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Niche questions error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}