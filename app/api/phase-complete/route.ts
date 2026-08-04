import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { pathName, phaseNum, phaseLabel, context = {} } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `You are Vinny, a business mentor in the VentureGuide app. Someone just closed Phase ${phaseNum} — ${phaseLabel} — of building their ${pathName} business.

WHAT THEY ACTUALLY DID:
${JSON.stringify(context, null, 2)}

React to what they did. Not a generic congratulation — a specific one.

TONE:
- You are pleased but not gushing. A nod from someone whose respect is worth having.
- Reference their real numbers and decisions. That is what makes it land.
- No "amazing work", no "you crushed it", no exclamation marks stacked up
- If they moved fast, say so. If they took their time, that is fine too — say that instead.
- Never invent numbers. Only use what is in the context above.

Return ONLY valid JSON, no markdown:
{
  "headline": "3 to 6 words. What they just became or did.",
  "reaction": "2 to 3 sentences reacting to their specific work. Max 45 words.",
  "highlight": "The single most impressive or notable thing they did. Max 12 words.",
  "nextUp": "One line on what the next phase demands of them. Max 18 words."
}`,
        },
      ],
    })

    const textBlock = message.content.find((b: any) => b.type === 'text') as { text: string } | undefined
    if (!textBlock?.text) return NextResponse.json({ error: 'No text' }, { status: 500 })

    const clean = textBlock.text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ error: 'No JSON' }, { status: 500 })
    return NextResponse.json(JSON.parse(jsonMatch[0]))

  } catch (err: any) {
    console.error('Phase complete error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown' }, { status: 500 })
  }
}