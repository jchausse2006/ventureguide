import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

// Every table keyed by user_id — everything a person has ever logged, chatted,
// or completed. shared_intros/shared_lessons/shared_phases are excluded on
// purpose: those are cached content shared across all users, not personal data.
const USER_TABLES = [
  'chat_memory',
  'chat_messages',
  'completed_modules',
  'completed_steps',
  'dismissed_modules',
  'money_entries',
  'personal_lessons',
  'phase_completions',
  'recurring_entries',
  'step_logs',
  'user_phases',
]

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json()
    if (!accessToken) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 401 })
    }

    const admin = supabaseAdmin()
    const { data: { user }, error: userErr } = await admin.auth.getUser(accessToken)
    if (userErr || !user) {
      console.error('Account delete auth check failed:', userErr?.message || 'no user returned')
      return NextResponse.json({ error: userErr?.message || 'Not signed in' }, { status: 401 })
    }

    for (const table of USER_TABLES) {
      const { error } = await admin.from(table).delete().eq('user_id', user.id)
      if (error) throw new Error(`Failed clearing ${table}: ${error.message}`)
    }

    const { error: profileErr } = await admin.from('profiles').delete().eq('id', user.id)
    if (profileErr) throw new Error(`Failed clearing profile: ${profileErr.message}`)

    const { error: authErr } = await admin.auth.admin.deleteUser(user.id)
    if (authErr) throw new Error(`Failed deleting auth user: ${authErr.message}`)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Account delete error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
  }
}
