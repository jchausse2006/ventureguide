import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { pathName, moduleTitle, phaseLabel, phaseNumber } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: `You are Vinny, a business mentor in the VentureGuide app. Write the lesson content for one step.

BUSINESS: ${pathName}
PHASE: ${phaseNumber} — ${phaseLabel}
THIS STEP: ${moduleTitle}

Write a lesson someone can actually follow today. Not theory. Not a summary of what they should learn. The actual thing they do.

TONE:
- Direct, honest, no hype. You are the opposite of a course seller.
- Never promise fast results or easy money
- Speak plainly. No corporate language, no motivational filler.
- Assume they are smart but new to this specific thing

ACCURACY — DO NOT BREAK THIS:
- Never invent company names, tools, apps, or statistics
- Only name a tool or platform if you are certain it exists and is widely used
- If you would cite a number you are not sure about, describe the pattern instead
- No made-up case studies or fake success stories

CONTENT RULES:
- Every part must be specific to "${pathName}" — a generic version of this lesson is a failure
- Steps are things they DO, in order, starting with a verb
- Each step needs enough detail to act on without guessing
- Mistakes must be real mistakes people make in this specific business

Return ONLY valid JSON, no markdown:
{
  "preview": "One line under 12 words describing what this covers",
  "timeEstimate": "e.g. 30 minutes or 2 hours",
  "objective": "One sentence: what they will have when this is done",
  "why": "2-3 sentences in Vinny's voice on why this matters for ${pathName} specifically",
  "steps": [
    {
      "title": "Verb-first step title, under 8 words",
      "detail": "2-4 sentences of specific instruction. Name tools, numbers, or scripts where useful."
    }
  ],
  "mistakes": [
    "A specific mistake people make doing this in ${pathName}",
    "Another specific one"
  ],
  "doneWhen": "One sentence describing how they know this is actually finished"
}

Give 3 to 6 steps and 2 to 3 mistakes.`,
        },
      ],
    })

    const textBlock = message.content.find((b: any) => b.type === 'text') as { text: string } | undefined
    if (!textBlock?.text) {
      console.error('Unexpected response shape:', JSON.stringify(message.content))
      return NextResponse.json({ error: 'No text in model response' }, { status: 500 })
    }

    const clean = textBlock.text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No JSON found' }, { status: 500 })
    }
    return NextResponse.json(JSON.parse(jsonMatch[0]))

  } catch (err: any) {
    console.error('Lesson error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}