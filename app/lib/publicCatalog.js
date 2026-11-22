import { createClient } from '@supabase/supabase-js'

// Use the public key and RLS. A public catalog must never bypass publication rules.
export function createPublicCatalogClient({ revalidate } = {}) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (url, options) => fetch(url, revalidate
          ? { ...options, cache: 'force-cache', next: { revalidate } }
          : { ...options, cache: 'no-store' }) },
    }
  )
}
