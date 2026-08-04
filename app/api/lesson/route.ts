import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { pathName, moduleTitle, phaseLabel, phaseNumber, moduleLog = null } = await req.json()

    const logDirective = moduleLog
      ? `
REQUIRED LOG FIELD — NOT OPTIONAL:
This module must capture a specific decision. Attach EXACTLY this log object to the ONE step where the person actually makes that decision — usually the last step, or the step where they commit to a choice.

${JSON.stringify(moduleLog, null, 2)}

Copy it exactly as given. Do not reword the label, change the key, or alter the options.
Every other step in this lesson gets "log": null.
Do not add any additional log fields beyond this one.
`
      : `
LOGGED DECISIONS:
This module does not capture a decision. Every step gets "log": null.
`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `You are Vinny, a business mentor in the VentureGuide app. Write the lesson content for one step.

BUSINESS: ${pathName}
PHASE: ${phaseNumber} — ${phaseLabel}
THIS STEP: ${moduleTitle}

Write a lesson someone can actually follow today. Not theory. The actual thing they do.

TONE:
- Direct, honest, no hype. You are the opposite of a course seller.
- Never promise fast results or easy money
- Plain language. No corporate speak, no motivational filler.
- Assume they are smart but new to this specific thing

ACCURACY — DO NOT BREAK THIS:
- Never invent company names, tools, apps, or statistics
- Only name a tool if you are certain it exists and is widely used
- If you would cite a number you are unsure about, describe the pattern instead
- No made-up case studies or success stories

CONTENT RULES:
- Everything must be specific to "${pathName}" — a generic version is a failure
- Steps are things they DO, in order, starting with a verb
- Each step needs enough detail to act on without guessing
- Mistakes must be real mistakes people make in this specific business

COMPLEXITY FLAGGING:
For each step, decide whether it is genuinely complex — legal filings, technical setup, tax or financial structure, licensing, insurance, or a skill that takes real practice.

If complex, set "complex": true and provide BOTH:
1. "resourceTopic" — pick the closest match from this exact list, or "" if none fit:
   ein, business_structure, register_business, licenses_permits, business_insurance, business_bank_account, business_plan, funding, taxes_self_employed, hiring_employees, marketing_sales, contracts
2. "resourceQuery" — a real searchable phrase, 4 to 9 words

Rules: use resourceTopic ONLY when genuinely about that topic. Always include resourceQuery as a fallback. Typically 1 to 3 steps per lesson are complex. Do not flag everything.
${logDirective}
Return ONLY valid JSON, no markdown:
{
  "preview": "One line under 12 words describing what this covers",
  "timeEstimate": "e.g. 30 minutes or 2 hours",
  "objective": "One sentence: what they will have when this is done",
  "why": "2-3 sentences in Vinny's voice on why this matters for ${pathName} specifically",
  "steps": [
    {
      "title": "Verb-first step title, under 8 words",
      "detail": "2-4 sentences of specific instruction. Name tools, numbers, or scripts where useful.",
      "complex": false,
      "resourceTopic": "",
      "resourceQuery": "",
      "log": null
    }
  ],
  "mistakes": [
    "A specific mistake people make doing this in ${pathName}",
    "Another specific one"
  ],
  "doneWhen": "One sentence describing how they know this is actually finished"
}

Give 4 to 6 steps and 2 to 3 mistakes.`,
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
    console.error('Lesson error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}