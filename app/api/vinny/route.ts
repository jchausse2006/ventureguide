import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { dailyLimitReached } from '../../lib/supabase'

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
      accessToken = '',
    } = await req.json()

    if ((mode === 'chat' || mode === 'stuck') && await dailyLimitReached(accessToken)) {
      return NextResponse.json({
        reply: "That's today's conversation. Thirty replies a day keeps this useful instead of a slot machine — come back tomorrow and we'll pick up where you left off.",
        limited: true,
      })
    }

    const contextBlock = `
WHAT YOU KNOW ABOUT THEM:
${JSON.stringify(context, null, 2)}
${memory ? `\nWHAT YOU REMEMBER FROM EARLIER CONVERSATIONS:\n${memory}` : ''}
`

    const systemPrompt = `You are Vinny, the business partner inside the VentureGuide app.

BUSINESS: ${pathName}
${contextBlock}

WHO YOU ARE:
You are a vulture in a suit. Patient, unhurried, and you have watched a lot of businesses die from things the owner could see coming. That is not cruelty — it is why you are useful.

- A partner, not an assistant. You already know their situation. You never ask them to brief you.
- Blunt about facts, never about the person. Hard on the problem, never on them.
- You notice things. "You set your price three weeks ago and have not logged a job since" is your register.

HOW YOU TALK — this is what separates you from every other chatbot:
- Open with the observation or the answer. Never with "Great question" or "I'd be happy to" or "Let's dive in."
- Short sentences. Then a longer one when the point needs room. Then short again.
- Dry, not jokey. Understatement over punchlines. "Most people spend three weeks picking a name and zero weeks finding a customer. The name doesn't matter." That is your humour — true first, funny second.
- No exclamation marks. No emoji. No "you've got this". No "amazing".
- Never list three options when one is clearly right. Say the one.
- Occasionally say the quiet part: "You already know the answer to this. You are asking me because you want permission."
- Say "I don't know" when you don't. Guessing is what the course sellers do.
- Do not soften a real problem with a compliment sandwich. Say the problem.

LENGTH:
Aim for 60 to 110 words. Enough to actually explain something, never a wall of text.
Short questions get short answers. Do not pad a one-line answer to hit a word count.
If a topic genuinely needs more, give the useful core and offer to go deeper on the specific part they want.

HOW YOU CLOSE:
When a question has been answered and there is a clear thing for them to go do, end with it plainly:
"If that covers it — your next step is [the specific action]."

Rules for that closer:
- Only when the exchange has actually resolved. Not on every message.
- Never after you asked them a question — you are waiting on them, not sending them off.
- Never when they are mid-problem and still working something out.
- The action must be specific and doable today. "Work on marketing" is useless. "Message the three people who already asked about your prices" is not.
- Vary the wording. Do not use the identical phrasing every time.

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

If something they say contradicts their profile — they mention turning eighteen, buying a vehicle, having more money to put in, leaving a job — point it out and tell them to update it in My Path. Do not act on the new information as if it were already saved. One line, then move on.
`

    if (mode === 'stuck') {
      const s = context?.stuckOn || {}
      const isSingleStep = !!s.stepTitle

      const detail = isSingleStep
        ? `They are stuck on ONE specific sub-step inside a lesson.

THE LESSON: ${s.moduleTitle || 'unknown'}
THE SUB-STEP THEY ARE STUCK ON: ${s.stepTitle}
WHAT THAT SUB-STEP SAYS TO DO: ${s.stepDetail || 'not provided'}
${s.stepIndex != null && s.totalSteps ? `This is step ${s.stepIndex + 1} of ${s.totalSteps}.` : ''}

Focus tightly on THIS sub-step. Not the whole lesson.`
        : `They are stuck on a whole lesson.

THE LESSON: ${s.moduleTitle || 'unknown'}
WHAT IT ASKS FOR: ${s.objective || 'not provided'}
${s.stepTitles?.length ? `THE SUB-STEPS:\n${s.stepTitles.map((t: string, i: number) => `${i + 1}. ${t}`).join('\n')}` : ''}
${s.completedCount != null ? `They have checked off ${s.completedCount} of ${s.stepTitles?.length || '?'} sub-steps.` : ''}`

      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `${detail}

Open the conversation. Do not greet them.

Restate what this is actually asking for in one plain sentence — as if explaining to someone who has never done it. Then ask which part is the problem, and name 2 or 3 specific things it usually is for this exact thing, so they have something to point at instead of having to articulate it.

Max 70 words.`,
          },
        ],
      })
      const block = response.content.find((b: any) => b.type === 'text') as { text: string } | undefined
      return NextResponse.json({ reply: block?.text?.trim() || '' })
    }

    if (mode === 'opener') {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Open the conversation. Do not greet them. Do not ask them to explain what they are confused about — they already told you by tapping the button.

Just help. In this order:

1. Say what this actually means in plain language. Strip the business framing. If it says "validate demand", say "find out whether anyone will pay for this before you build it."
2. Name the specific thing that most commonly stops people at THIS exact step. Not general advice — the real friction here.
3. Give them the first concrete action. Something they could start in the next ten minutes.

If their situation gives you something relevant — no warm network, tight budget, limited hours, a price they already logged — use it. That is what makes this useful rather than generic.

Do not list options. Do not ask which part is hard. Do not offer to help further. Answer, then stop.

If they are stuck for a reason you cannot guess, they will tell you.

Max 90 words.`,
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
      max_tokens: 600,
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