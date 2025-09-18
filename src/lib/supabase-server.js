// lib/supabase-server.js (For server components)
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Server-side Supabase client
export function createServerComponentClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Service role client (for API routes)
export function createServiceClient() {
  return createServerClient(supabaseUrl, supabaseServiceKey, {
    cookies: {},
  })
}