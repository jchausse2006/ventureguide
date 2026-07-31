import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { pathName, startPhase = 1, mode = 'discovery' } = await req.json()

    const scalingContext = startPhase > 1 ? `
STAGE CONTEXT: This person already runs this business and is starting at Phase ${startPhase}.
- Phases 1 through ${startPhase - 1} reflect foundational work they have already completed
- Phase ${startPhase} is where their real work begins right now
- Do NOT include beginner basics like "get your first client" in Phase ${startPhase} or beyond
- Focus on scaling, systems, hiring, and growth from Phase ${startPhase} onward
` : ''

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: `You are VentureGuide. Generate a 5-phase business roadmap for: "${pathName}"

${scalingContext}

MODULE TITLE RULES — THIS IS THE MOST IMPORTANT PART:
- Every module title MUST start with a present-tense action verb
- Maximum 6 words. Shorter is always better.
- Titles are action items a person does, not lessons they read
- No colons, no dashes, no explanatory clauses
- Each module also needs a "preview" — one line under 10 words describing what the step involves, written plainly

WRONG: "Understanding how to price your services in a competitive market"
RIGHT: "Price your first three offers"

WRONG: "Learning the fundamentals of client acquisition through cold outreach"
RIGHT: "Send 20 cold outreach messages"

WRONG: "Building a system for managing multiple client relationships at once"
RIGHT: "Build your client tracking system"

WRONG: "Setting up your business legally — entity type, licensing, and permits"
RIGHT: "Register your business entity"

SPECIFICITY RULES:
- Every title must be specific to "${pathName}" — never generic business advice
- Name real tools, platforms, or customer types where it helps
- NEVER invent company names, competitors, apps, or brands
- If you are not certain a company exists, describe the category instead of naming it

Module types:
- "foundation" = a core skill specific to this path
- "action" = a specific step in this exact business
- "milestone" = a major achievement checkpoint

Phase descriptions: one short sentence, under 12 words, specific to this path.

Return ONLY valid JSON, no markdown, no explanation:
{
  "phases": [
    {
      "phase": 1,
      "label": "Launch",
      "description": "short goal specific to this path",
      "modules": [
        { "id": 1, "title": "Verb-first action under 6 words", "type": "foundation", "preview": "One line under 10 words on what this involves" }
      ]
    }
  ]
}

Return exactly 5 phases with labels: Launch, Build, Establish, Operate, Own.
Phase 1 has 6-8 modules. Phases 2-4 have 4-5 modules. Phase 5 has 3-4 modules.`,
        },
      ],
    })

    const text = (message.content[0] as { text: string }).text
    const clean = text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No JSON found' }, { status: 500 })
    }
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)

  } catch (err: any) {
    console.error('Roadmap error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}