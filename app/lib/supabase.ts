import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vwnltdlmdndtmqcpgzlz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3bmx0ZGxtZG5kdG1xY3Bnemx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzNTY0NTYsImV4cCI6MjEwMDkzMjQ1Nn0.qzwLcl1HT0VgO4RsZht-V12nt_upswg0uEJ8Me-eS74'

// Scoped to one request's caller — reads/writes are constrained by that
// user's own RLS policies, same as the mobile app talking to Supabase directly.
export function supabaseForUser(accessToken?: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : {},
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

const DAILY_MESSAGE_LIMIT = 30

// Caps how many replies Vinny can generate for one person per day, across every
// path — the guard against a script hammering /api/vinny to burn API spend.
export async function dailyLimitReached(accessToken?: string): Promise<boolean> {
  if (!accessToken) return false

  const supabase = supabaseForUser(accessToken)
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  if (!user) return false

  const startOfDay = new Date()
  startOfDay.setUTCHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('role', 'assistant')
    .gte('created_at', startOfDay.toISOString())

  return (count || 0) >= DAILY_MESSAGE_LIMIT
}
