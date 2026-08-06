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

    const nicheAlreadyStated = mode === 'scaling' || pathName.length > 40
    const alreadyOperating = !!priorContext?.alreadyOperating

    const ageValue = quizAnswers?.age
    const isMinor = ageValue === '13-15' || ageValue === '16-17'

    const ageBlock = isMinor
      ? `
THEY ARE UNDER 18 — THIS CHANGES WHAT IS POSSIBLE:
Age bracket: ${ageValue}

Hard constraints you must respect:
- They generally cannot sign binding contracts without a parent or guardian
- They cannot register an LLC or corporation alone in most states
- They cannot open a business bank account alone — most banks require 18, some offer joint minor accounts
- Many payment platforms require 18. Some allow a parent-linked account.
- Some trades and licences have minimum age requirements

How to handle it:
- Do NOT drop the legal or financial steps. They still matter.
- Rewrite them so a parent or guardian is part of the step. "Sit down with a parent and open a joint business account" not "open a business account."
- Where a platform or licence has an age minimum, say so plainly in the module preview so they are not blindsided
- Never be condescending. They are running a business, not doing a school project.
- Favour work they can legally do now over work that requires waiting until 18
`
      : ''

    const contextBlock = alreadyOperating
      ? `
THEY ALREADY RUN THIS BUSINESS — NOT A BEGINNER:
${JSON.stringify(priorContext, null, 2)}

They enter at Phase ${priorContext.enteredAtPhase} because they already did the earlier work in the real world.

HARD RULES:
- Include NOTHING from Phases 1 through ${Math.max(1, priorContext.enteredAtPhase - 1)}. No naming the business, no first customer, no choosing a niche, no basic legal setup.
- Assume they already have customers, revenue, an offer, and working operations
- Write for the specific bottleneck their answers describe
- Their revenue band tells you the scale to write for. Do not suggest tactics beneath it.
- Skip anything an experienced operator would find obvious.
`
      : priorContext
      ? `
WHAT THEY HAVE ALREADY DONE:
${JSON.stringify(priorContext, null, 2)}

Use this. It is the whole point of generating this phase now instead of upfront.
- Build on their exact logged numbers and decisions
- Do not re-teach anything they completed
- Respect constraints their decisions created
- If they marked a module as not relevant or already handled, do not bring that topic back
- Reference their actual choices in module titles where it fits naturally
`
      : ''

    const quizBlock = quizAnswers && !alreadyOperating
      ? `
THEIR SITUATION (from the quiz):
${JSON.stringify(quizAnswers, null, 2)}

Respect their real constraints — hours, budget, transport, and what they actually have access to. If they said they have no computer, no printer, or no bank account, do not write steps that require those.
${ageBlock}`
      : ''

    const nicheRule = phaseNum !== 1 || alreadyOperating
      ? ''
      : nicheAlreadyStated
      ? `
NICHE — ALREADY DECIDED:
This person described their own business, so their niche is set. Do NOT ask them to choose one.

Module 1 should SHARPEN what they already named. Use a "logGroup" of 2 to 3 fields that pin down the parts of their description that are still vague. Pre-fill each placeholder with your best read from their description.
`
      : `
MODULE 1 MUST DEFINE WHAT THEY ARE ACTUALLY BUILDING.

Decide how much specification "${pathName}" needs. Default to HIGH — most paths need more definition than they appear to.

HIGH — use OPEN TEXT FIELDS. The path describes many different businesses. Someone reading only the path name cannot tell what the person sells, to whom, or for how much.
Always HIGH: software, SaaS, apps, web development, consulting of any kind, coaching, agencies, marketing, design, content creation, e-commerce, courses, freelance anything, AI or automation services, bookkeeping, virtual assistance, photography, writing.

LOW — use a CHOICE FIELD. Only for hands-on local services where the work itself is fixed and obvious, and the only real variable is who you serve.
Only LOW: lawn care, snow removal, house cleaning, dog walking, pressure washing, junk removal, window cleaning, moving help, car detailing, and similar physical labour services.

If the path is not clearly on the LOW list, it is HIGH. When unsure, choose HIGH — open fields never insult someone by offering options that miss.

IF HIGH:
Module 1 carries a "logGroup" of 2 to 4 open text fields, each capturing one part of the decision.
Typical parts: what exactly they build or deliver, who specifically pays for it, what problem it solves, what they charge.
Pick only the parts that genuinely matter for this path.

Every field needs:
- "type": "text" — never "choice"
- "label": a direct question, max 8 words
- "placeholder": a REAL, SPECIFIC example for this exact path. This is the most important part of the entire response. It teaches them what a good answer looks like.
  For SaaS: "Job scheduling for HVAC contractors" not "your product idea"
  For consulting: "Cutting no-show rates for dental clinics" not "your service"
  A vague placeholder produces a vague answer and the whole roadmap suffers.
- "why": what this changes downstream, max 15 words

IF LOW:
Module 1 carries a single "log" with key "chosen_niche", type "choice", 3 to 4 options.

RULES FOR CHOICE OPTIONS:
1. Every option must be a customer segment with real budget and purchasing authority. No hobbyists, no volunteer or student organisations.
2. Options roughly equal in difficulty for a beginner. If one needs licensing, compliance, or more capital, drop it or say so in the option text.
3. No option obviously correct. If one is clearly best and the rest are traps, rewrite them.
4. Avoid the most saturated segment unless you name the saturation in the text.

Each option is 3 to 7 words.
`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2200,
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

POSITIONING — DO NOT BREAK THIS:
Never advise competing on price or undercutting competitors. This app teaches people to charge what the work is worth. Pricing modules are about covering costs and matching value, never about being the cheapest.

LOGGED DECISIONS BEYOND MODULE 1 — BE SPARING:
A module gets a "log" only if it produces a number or decision that constrains later phases.
Qualifies: a price set, a market range researched, monthly overhead calculated.
Does NOT qualify: confirming work happened, reflections, time spent.
At most ONE module beyond module 1 gets a log field in this phase. Often zero.

SHAPES:
Single field — "log": { "key": "snake_case", "label": "Max 8 words", "type": "number"|"text"|"choice", "unit": "$ or /month or empty", "placeholder": "specific example", "options": ["only for choice"], "why": "Max 15 words" }
Field group — "logGroup": { "intro": "One line on why these matter, max 15 words", "fields": [ { "key": "snake_case", "label": "Max 8 words", "type": "text", "placeholder": "specific real example", "why": "Max 15 words" } ] }

A module has EITHER "log" OR "logGroup" — never both. Use null for neither.

Module types: "foundation" (core skill), "action" (specific step), "milestone" (major checkpoint).

Return ONLY valid JSON, no markdown:
{
  "phase": ${phaseNum},
  "label": "${frame.label}",
  "description": "One short sentence goal, specific to this business. Under 12 words.",
  "modules": [
    { "id": 1, "title": "Verb-first, under 6 words", "type": "foundation", "preview": "One line under 10 words", "log": null, "logGroup": null }
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