import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vwnltdlmdndtmqcpgzlz.supabase.co'

// Full-access client for operations RLS can never allow a user to do themselves —
// right now, just permanently deleting their own account. Never expose this
// client or its key to the mobile app; it only ever runs on the server.
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')

  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
