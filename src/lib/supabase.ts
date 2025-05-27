// Import runtime dependencies first
import { createClient } from '@supabase/supabase-js'

// Import database modules
import { users } from './db/users'
import { uploads } from './db/uploads'
import { spendingLocations } from './db/spendingLocations'
import { spendingAmounts } from './db/spendingAmounts'

// Import types last
import type { Database } from './database.types'

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export auth for convenience
export const auth = supabase.auth

// Export database modules
export const db = {
  users,
  uploads,
  spendingLocations,
  spendingAmounts
}

// Export types
export type { Database } 