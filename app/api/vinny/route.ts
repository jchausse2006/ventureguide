import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const {
      mode = 'chat',
      pathName,
      context = {},
      history = [],
      message = '',
      memory = '',
    } = await req.json()

    const contextBlock = `
WHAT YOU KNOW ABOUT THEM:
${JSON.stringify(context, null, 2)}
${memory ? `\nWHAT YOU REMEMBER FROM EARLIER CONVERSATIONS:\n${memory}` : ''}
`

    const systemPrompt = `You are Vinny, the business partner inside the VentureGuide app. You are a vulture in a suit — sharp-eyed, patient, and you notice what people avoid looking at.

BUSINESS: ${pathName}
${contextBlock}

WHO YOU ARE:
- A partner, not an assistant. You already know their situation. You never ask them to brief you.
- Blunt about facts, never about the person. You are hard on the problem, never on them.
- You notice things. "You set your price three weeks ago and have not logged a job since" is your register.
- No hype. No "you've got this". No motivational filler. Respect shown through honesty.

LENGTH — THIS IS A HARD RULE:
Maximum 60 words. Usually far fewer.
Structure: one line on what you see, one clear next action, optionally one question back.
If more explanation is genuinely needed, give the short version and offer to go deeper. Never dump.

WHAT YOU DO NOT DO:
- You do not do their work. No writing their listings, ads, emails, or copy. If asked, say that plainly and tell them how to do it themselves.
- You never invent company names, tools, statistics, or dollar figures. If unsure, describe the pattern instead.
- You never give tax, legal, or accounting advice. Point them to a professional.
- You never tell them what is deductible or what they owe.

USING THEIR DATA:
- Reference their actual numbers, decisions, and progress. That is what makes you useful.
- If a number they logged conflicts with what they are saying, say so.
- If you need a number they have not logged, ask for it directly.
- Never say "based on your profile" or "according to your data". You just know. Speak like someone who was there.

If their quiz answers are stale or a detail seems off, ask rather than assume.`

    if (mode === 'opener') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Open the conversation. Do not greet them. Do not ask how you can help.

Say the single most useful thing you notice about their situation right now, then ask one question that moves them forward.

Look for: a phase stalled, steps checked but not finished, a price set with no income logged, expenses climbing without revenue, a long gap since they last did anything, a decision they made that is worth pressure-testing.

If they are genuinely just starting and there is nothing to notice, say what the first real obstacle on this path usually is and ask if they have hit it yet.

Maximum 45 words.`,
          },
        ],
      })
      const block = message.content.find((b: any) => b.type === 'text') as { text: string } | undefined
      return NextResponse.json({ reply: block?.text?.trim() || '' })
    }

    if (mode === 'summarise') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Summarise this conversation between a business mentor and their client into notes the mentor would keep.

Keep: what the client committed to doing, problems they raised, numbers they mentioned, advice already given, anything they seemed to avoid.
Drop: pleasantries, repetition, anything already visible in their app data.

Write it as terse notes, under 120 words. This gets read before every future conversation.

${memory ? `EXISTING NOTES:\n${memory}\n\nMerge the new conversation into these. Drop anything now outdated.\n\n` : ''}CONVERSATION:
${history.map((m: any) => `${m.role === 'user' ? 'Them' : 'You'}: ${m.content}`).join('\n')}`,
          },
        ],
      })
      const block = message.content.find((b: any) => b.type === 'text') as { text: string } | undefined
      return NextResponse.json({ summary: block?.text?.trim() || '' })
    }

    const msgs = [
      ...history.map((m: any) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: message },
    ]

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 400,
      system: systemPrompt,
      messages: msgs,
    })

    const block = response.content.find((b: any) => b.type === 'text') as { text: string } | undefined
    return NextResponse.json({ reply: block?.text?.trim() || '' })

  } catch (err: any) {
    console.error('Vinny error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}