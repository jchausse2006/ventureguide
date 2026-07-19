import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { pathName, startPhase = 1, mode = 'discovery' } = await req.json()

  const scalingContext = startPhase > 1 ? `
IMPORTANT: This person already runs a ${pathName} business and is starting at Phase ${startPhase}.
- Phases 1 through ${startPhase - 1} should reflect foundational work they have already completed
- Phase ${startPhase} is where their real work begins — make it specific to what someone at this stage actually needs
- Do NOT include beginner basics like "get your first client" or "set up a bank account" in Phase ${startPhase} or beyond
- Focus on scaling, systems, hiring, and growth from Phase ${startPhase} onward
` : ''

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `You are VentureGuide. Generate an honest, specific 5-phase business roadmap for someone running a "${pathName}" business.
${scalingContext}
Each phase has a label, a one-sentence goal, and 4-8 modules. Each module has a title and a type.

Module types:
- "foundation" = business skill applied to this path
- "action" = specific step for this exact path and stage
- "milestone" = a major achievement checkpoint

Write each module title as the NAME of a lesson — not a literal instruction. It should hint at what they will learn without fully explaining it.

WRONG: "Register an LLC and get a dealer license"
RIGHT: "Setting up your business legally — entity type, licensing, and what you actually need"

Make modules SPECIFIC to ${pathName} and appropriate for someone starting at Phase ${startPhase}.

JSON only, no markdown:
{
  "phases": [
    {
      "phase": 1,
      "label": "Launch",
      "description": "one sentence goal",
      "modules": [
        { "id": 1, "title": "lesson name specific to ${pathName}", "type": "foundation|action|milestone" }
      ]
    }
  ]
}

Return exactly 5 phases. Phase 1 should have 6-8 modules. Phases 2-4 should have 4-5 modules. Phase 5 should have 3-4 modules.`,
      },
    ],
  })

  const text = (message.content[0] as { text: string }).text
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())

  return NextResponse.json(parsed)
}
