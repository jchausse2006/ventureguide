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
    max_tokens: 2500,
    messages: [
      {
        role: 'user',
        content: `You are VentureGuide. Generate a highly specific 5-phase business roadmap for: "${pathName}"

${scalingContext}

CRITICAL RULES FOR SPECIFICITY:
- Every single module title must be specific to "${pathName}" — not generic business advice
- If the path mentions a specific niche, technology, platform, or audience — every module must reflect that
- Generic module titles like "Getting your first client" or "Building systems" are unacceptable
- Specific module titles like "Finding your first React Native client through cold outreach to funded startups" are correct
- Think about what someone actually needs to know to succeed in THIS exact business — not business in general
- If the path involves technology, name the specific tools, platforms, or languages
- If the path involves a specific market or customer type, name them explicitly in every relevant module
- Modules should feel like they were written by someone who has actually built this specific business before
- Phase descriptions should also be specific to this path — not generic milestones

Module types:
- "foundation" = a core skill or concept specific to this path
- "action" = a specific step someone takes in this exact business
- "milestone" = a major achievement checkpoint relevant to this path

Return ONLY valid JSON, no markdown, no explanation:
{
  "phases": [
    {
      "phase": 1,
      "label": "Launch",
      "description": "one sentence goal specific to ${pathName}",
      "modules": [
        { "id": 1, "title": "specific lesson title for ${pathName}", "type": "foundation|action|milestone" }
      ]
    }
  ]
}

Return exactly 5 phases. Phase 1 should have 6-8 modules. Phases 2-4 should have 4-5 modules. Phase 5 should have 3-4 modules.`,
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
}