import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const {
      pathName, moduleTitle, phaseLabel, phaseNumber,
      moduleLog = null, moduleLogGroup = null, regenReason = null,
    } = await req.json()

    const regenBlock = regenReason
      ? `
THIS IS A SECOND ATTEMPT. The first version was rejected.

WHY: ${regenReason}

Do not produce something similar. Address the complaint directly:
- "too generic" → name real tools, real scripts, real numbers. Impossible to apply elsewhere.
- "wrong for my business" → you misread the business. Write for what they actually do.
- "already done this" → skip the basics. Go deeper than the obvious version.
- "too advanced" → smaller pieces, no assumed knowledge.
`
      : ''

    let logDirective = `
LOGGED DECISIONS:
This module does not capture a decision. Every step gets "log": null and "logGroup": null.
`

    if (moduleLogGroup) {
      logDirective = `
REQUIRED FIELD GROUP — NOT OPTIONAL:
This module captures several parts of one decision. Attach EXACTLY this logGroup object to the ONE step where the person commits to that decision — usually the final step.

${JSON.stringify(moduleLogGroup, null, 2)}

Copy it exactly. Do not reword labels, change keys, alter placeholders, or add fields.
Every other step gets "log": null and "logGroup": null.
The step you attach it to should be the step that asks them to write the decision down.
`
    } else if (moduleLog) {
      logDirective = `
REQUIRED LOG FIELD — NOT OPTIONAL:
This module must capture a specific decision. Attach EXACTLY this log object to the ONE step where the person makes that decision — usually the last step, or the step where they commit to a choice.

${JSON.stringify(moduleLog, null, 2)}

Copy it exactly. Do not reword the label, change the key, or alter the options.
Every other step gets "log": null and "logGroup": null.
Do not add any additional log fields.
`
    }

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
1. "resourceTopic" — closest match from this list, or "":
   ein, business_structure, register_business, licenses_permits, business_insurance, business_bank_account, business_plan, funding, taxes_self_employed, hiring_employees, marketing_sales, contracts
2. "resourceQuery" — a real searchable phrase, 4 to 9 words

Use resourceTopic ONLY when genuinely about that topic. Always include resourceQuery as fallback. Typically 1 to 3 steps per lesson are complex. Do not flag everything.

BUSINESS TERMS — TAG THEM:
Someone new to business will hit words they do not know. When a step's detail text uses a real business or industry term that a beginner would not confidently define, wrap it in double brackets like this: [[LLC]], [[gross margin]], [[net 30]].

Rules:
- Tag the term exactly as it appears in the sentence, including plurals
- Tag a term only the FIRST time it appears in the whole lesson
- Maximum 4 tagged terms across all steps combined
- Only tag genuine jargon. Not "customer", "price", "website" — those need no explanation.
- Do not tag inside titles, only inside detail text

Then include a "glossary" object defining each tagged term:
"glossary": {
  "LLC": "A legal structure that separates your personal money from the business. If the business gets sued, your personal assets are generally protected.",
  "gross margin": "What is left from a sale after the direct costs of delivering it. Not profit — this is before rent, fuel, insurance."
}

Each definition: plain language, 15 to 35 words, no jargon inside the definition, and specific to how the term matters for ${pathName} where relevant. If no terms need tagging, return an empty object.
${logDirective}${regenBlock}
PURCHASES — FLAG STEPS THAT INVOLVE BUYING SOMETHING:
If a step requires the person to actually spend money on equipment, tools, materials, software, licences, or supplies, attach a "purchase" object to that step.

Only flag steps where money genuinely leaves their pocket to acquire a specific thing. Not steps that merely mention cost, not steps about pricing their own services, not steps about researching without buying.

Shape:
"purchase": {
  "item": "What they are buying. Max 6 words. e.g. 'Commercial pressure washer'",
  "researchNote": "One line on what to compare when researching. Max 20 words. e.g. 'Compare PSI, gas vs electric, and whether parts are locally available.'",
  "cheaperEntry": "How to start without buying it yet, if that is genuinely possible. Max 20 words. Empty string if there is no real alternative."
}

Rules for cheaperEntry:
- Only include if it is genuinely viable. Renting, borrowing, buying used, or starting with a smaller version.
- Never invent a workaround that does not exist. An empty string is fine and better than a fake option.
- This matters — most people on this path start with no money, and a real alternative is often the difference between starting and stalling.

DO NOT state prices yourself. You do not know what things cost in their area today. The person researches and enters the number.

At most TWO steps per lesson carry a purchase. Most lessons have zero.
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
     "log": null,
      "logGroup": null,
      "purchase": null
    }
  ],
  "mistakes": [
    "A specific mistake people make doing this in ${pathName}",
    "Another specific one"
  ],
  "doneWhen": "One sentence describing how they know this is actually finished",
  "glossary": {}
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