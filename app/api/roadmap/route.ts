import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

const PHASE_FRAME: Record<number, { label: string; goal: string }> = {
  1: { label: 'Launch', goal: 'Get the first paying customer' },
  2: { label: 'Build', goal: 'Make income consistent and repeatable' },
  3: { label: 'Establish', goal: 'Build reputation and recurring revenue' },
  4: { label: 'Operate', goal: 'Hire, delegate, stop doing everything' },
  5: { label: 'Own', goal: 'A business that runs without you' },
}

export async function POST(req: NextRequest) {
  try {
    const {
      pathName,
      phaseNum = 1,
      priorContext = null,
      quizAnswers = null,
    } = await req.json()

    const frame = PHASE_FRAME[phaseNum] || PHASE_FRAME[1]

    const contextBlock = priorContext
      ? `
WHAT THEY HAVE ALREADY DONE:
${JSON.stringify(priorContext, null, 2)}

Use this. It is the whole point of generating this phase now instead of upfront.
- If they logged a price, a niche, a customer type, or an overhead figure, build on those exact numbers
- Do not re-teach anything they already completed
- If a decision they logged creates a constraint, respect it
- Reference their actual choices in the module titles where it fits naturally
`
      : ''

    const quizBlock = quizAnswers
      ? `
THEIR SITUATION (from the quiz):
${JSON.stringify(quizAnswers, null, 2)}

Respect their real constraints — hours available, budget, transport, network.
`
      : ''

    const nicheRule = phaseNum === 1
      ? `
CRITICAL — PHASE 1 MUST START WITH NICHE:
The FIRST module of Phase 1 must be about choosing a specific focus within "${pathName}".
Residential vs commercial. One customer type vs another. One service vs a menu of them.
That module MUST carry a "log" field capturing their choice, with key "chosen_niche" and type "choice", offering 3-4 realistic options for this business.
Everything downstream depends on this decision, so it comes first.
`
      : ''

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are VentureGuide. Generate ONE phase of a business roadmap.

BUSINESS: ${pathName}
PHASE: ${phaseNum} — ${frame.label}
GOAL OF THIS PHASE: ${frame.goal}
${quizBlock}${contextBlock}${nicheRule}

MODULE TITLE RULES — MOST IMPORTANT PART:
- Every title MUST start with a present-tense action verb
- Maximum 6 words. Shorter is better.
- Titles are things a person does, not lessons they read
- No colons, no dashes, no explanatory clauses

WRONG: "Understanding how to price your services in a competitive market"
RIGHT: "Price your first three offers"

WRONG: "Learning the fundamentals of client acquisition"
RIGHT: "Send 20 cold outreach messages"

SPECIFICITY:
- Every title specific to "${pathName}" — never generic business advice
- Name real tools, platforms, or customer types where it helps
- NEVER invent company names, competitors, or apps
- If unsure a company exists, describe the category instead

LOGGED DECISIONS — BE SPARING:
A module gets a "log" field only if it produces a number or decision that constrains later phases.
Qualifies: a price set, a market range researched, monthly overhead calculated, a target customer committed to, a niche chosen.
Does NOT qualify: confirming work happened, reflections, time spent.
At most TWO modules in this phase get a log field. Often only one.

Log shape when used:
{
  "key": "snake_case_stable_id",
  "label": "Short question. Max 8 words.",
  "type": "number" | "text" | "choice",
  "unit": "$ or /month or empty string",
  "placeholder": "example answer",
  "options": ["only for choice, 3-4 short options"],
  "why": "Why this matters later. Max 15 words."
}

Module types: "foundation" (core skill), "action" (specific step), "milestone" (major checkpoint).

Return ONLY valid JSON, no markdown:
{
  "phase": ${phaseNum},
  "label": "${frame.label}",
  "description": "One short sentence goal, specific to this business. Under 12 words.",
  "modules": [
    { "id": 1, "title": "Verb-first, under 6 words", "type": "foundation", "preview": "One line under 10 words on what this involves", "log": null }
  ]
}

${phaseNum === 1 ? 'Phase 1 gets 6 to 8 modules.' : 'This phase gets 4 to 6 modules.'}
The final module should be the one that most clearly marks this phase as finished.`,
        },
      ],
    })

    const textBlock = message.content.find((b: any) => b.type === 'text') as { text: string } | undefined
    if (!textBlock?.text) {
      return NextResponse.json({ error: 'No text in model response' }, { status: 500 })
    }

    const clean = textBlock.text.replace(/```json|```/g, '').trim()
    const jsonMatch = clean.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'No JSON found' }, { status: 500 })
    }
    return NextResponse.json(JSON.parse(jsonMatch[0]))

  } catch (err: any) {
    console.error('Roadmap error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}