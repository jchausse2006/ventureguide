import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const {
      pathName,
      phaseNum,
      phaseLabel,
      phaseGoal,
      rejectedModule,
      otherModules = [],
      regenReason,
      quizAnswers = null,
      decisions = null,
    } = await req.json()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `You are VentureGuide. Replace ONE module in a business roadmap phase.

BUSINESS: ${pathName}
PHASE: ${phaseNum} — ${phaseLabel}
GOAL OF THIS PHASE: ${phaseGoal}

THE MODULE THEY REJECTED:
${JSON.stringify(rejectedModule, null, 2)}

WHY THEY REJECTED IT: ${regenReason}

THE OTHER MODULES IN THIS PHASE — do not duplicate any of these:
${otherModules.map((m: any, i: number) => `${i + 1}. ${m.title}`).join('\n')}
${quizAnswers ? `\nTHEIR SITUATION:\n${JSON.stringify(quizAnswers, null, 2)}` : ''}
${decisions ? `\nDECISIONS THEY HAVE ALREADY LOGGED:\n${JSON.stringify(decisions, null, 2)}` : ''}

Write ONE replacement module that does a similar job in this phase but addresses their complaint.

Address the complaint directly:
- "too generic" → name real tools, real numbers, real customer types. Impossible to apply to a different business.
- "wrong for my business" → you misread what they do. Re-read the business and write for that.
- "already done this" → go further than the obvious version. Assume the basics are handled.
- "too advanced" → smaller and more concrete. Assume no prior knowledge and no existing assets.

MODULE TITLE RULES:
- Starts with a present-tense action verb
- Maximum 6 words
- A thing they do, not a lesson they read
- No colons, no dashes, no explanatory clauses

${rejectedModule?.log || rejectedModule?.logGroup
  ? 'The rejected module captured a decision. The replacement must capture an equivalent decision — keep the same log or logGroup shape and the same key, but you may reword the label and placeholder to fit the new module.'
  : 'This module does not capture a decision. Set both "log" and "logGroup" to null.'}

Return ONLY valid JSON, no markdown:
{
  "id": ${rejectedModule?.id || 1},
  "title": "Verb-first, under 6 words",
  "type": "${rejectedModule?.type || 'action'}",
  "preview": "One line under 10 words",
  "log": null,
  "logGroup": null
}`,
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
    console.error('Module swap error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}