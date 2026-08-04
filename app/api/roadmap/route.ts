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
      mode = 'discovery',
    } = await req.json()

    const frame = PHASE_FRAME[phaseNum] || PHASE_FRAME[1]

    // Someone who wrote their own description already chose a niche.
    // A generic path name like "Pressure washing" has not.
    const nicheAlreadyStated = mode === 'scaling' || pathName.length > 40
    const alreadyOperating = !!priorContext?.alreadyOperating

    const contextBlock = alreadyOperating
      ? `
THEY ALREADY RUN THIS BUSINESS — THIS IS NOT A BEGINNER:
${JSON.stringify(priorContext, null, 2)}

They enter at Phase ${priorContext.enteredAtPhase} because they have already done the earlier work in the real world.

HARD RULES:
- Include NOTHING from Phases 1 through ${Math.max(1, priorContext.enteredAtPhase - 1)}. No naming the business, no first customer, no choosing a niche, no basic legal setup.
- Assume they already have customers, revenue, an offer, and working operations
- Write for the specific bottleneck their answers describe — not for a generic person at this stage
- If their answers name a blocker like pricing or hiring or systems, the modules should attack that directly
- Their revenue band tells you the scale to write for. Do not suggest tactics beneath it.
- Treat them as someone with real operating experience. Skip anything they would find obvious.
`
      : priorContext
      ? `
WHAT THEY HAVE ALREADY DONE:
${JSON.stringify(priorContext, null, 2)}

Use this. It is the whole point of generating this phase now instead of upfront.
- If they logged a price, a niche, a customer type, or an overhead figure, build on those exact numbers
- Do not re-teach anything they already completed
- If a decision they logged creates a constraint, respect it
- Reference their actual choices in module titles where it fits naturally
`
      : ''

    const quizBlock = quizAnswers && !alreadyOperating
      ? `
THEIR SITUATION (from the quiz):
${JSON.stringify(quizAnswers, null, 2)}

Respect their real constraints — hours available, budget, transport, network.
`
      : ''

    const nicheRule = phaseNum !== 1 || alreadyOperating
      ? ''
      : nicheAlreadyStated
      ? `
NICHE — ALREADY DECIDED:
This person described their own business, so their niche is set. Do NOT ask them to choose one — that would be the app ignoring what they told us.

Module 1 should help them SHARPEN or VALIDATE the niche they already named: narrowing the customer, defining the exact offer, or confirming demand is real.

Module 1 carries a "log" field with key "chosen_niche", type "text", capturing their niche in their own words. Set the placeholder to your best read of their niche from the description.
`
      : `
NICHE — MUST BE CHOSEN FIRST:
The FIRST module of Phase 1 must be about choosing a specific focus within "${pathName}".

It carries a "log" field with key "chosen_niche", type "choice", offering 3 to 4 options.

RULES FOR THOSE OPTIONS — DO NOT BREAK THESE:
1. Every option must be a customer segment with real budget and purchasing authority. No hobbyists, no volunteer or student organisations, no segment that typically cannot pay for this service.
2. Options must be roughly equal in difficulty for a beginner. If one requires licensing, regulatory compliance, or significantly more capital, either drop it or say so plainly in the option text.
3. No option should be obviously correct. If one is clearly best and the rest are traps, the choice is fake — rewrite so each is a genuine tradeoff.
4. Avoid the single most saturated segment in this industry unless you name the saturation in the option text.
5. Where the more useful decision is what SERVICE they offer rather than what INDUSTRY they serve, make the options about the service instead.

Each option is 3 to 7 words and immediately understandable.
`

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
Qualifies: a price set, a market range researched, monthly overhead calculated, a target customer committed to, a niche chosen or sharpened.
Does NOT qualify: confirming work happened, reflections, time spent.
At most TWO modules in this phase get a log field. Often only one.

Log shape when used:
{
  "key": "snake_case_stable_id",
  "label": "Short question. Max 8 words.",
  "type": "number" | "text" | "choice",
  "unit": "$ or /month or empty string",
  "placeholder": "example answer",
  "options": ["only for choice, 3-4 options"],
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

${phaseNum === 1 && !alreadyOperating ? 'Phase 1 gets 6 to 8 modules.' : 'This phase gets 4 to 6 modules.'}
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