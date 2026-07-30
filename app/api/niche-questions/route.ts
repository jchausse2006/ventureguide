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
          content: `You are Vinny, a sharp business mentor inside the VentureGuide app. A user has described their business as: "${businessDescription}"

Your job is to generate 4 to 6 follow-up questions that unlock the specific details needed to build a highly targeted roadmap for THIS exact business — not generic business questions.

Rules:
- Every question must be specific to the exact type of business described — not generic
- Questions should reveal information that would genuinely change what their roadmap looks like
- If they mentioned a technology, ask about their specific stack, tools, or platforms
- If they mentioned a specific customer type, ask about how they find and close them
- If they mentioned a pricing model, ask about their rates and positioning strategy
- If they mentioned a niche, ask about what makes them different within that niche
- Each question gets 3 to 4 answer options — no free text, always multiple choice
- One option per question can be a nuanced middle-ground answer
- Vinny tone: direct, honest, no fluff, slightly sharp but respectful
- Include a short vinny field — a one-line comment that explains WHY this question matters for their specific business

Return ONLY valid JSON, no markdown, no explanation:
{
  "questions": [
    {
      "id": "unique_id",
      "text": "Question text specific to their exact business",
      "sub": "One sentence on why this matters for their specific path",
      "vinny": "Vinny one-liner about why this question matters",
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