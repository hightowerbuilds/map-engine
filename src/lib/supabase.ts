import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging
console.log('Supabase URL:', supabaseUrl ? 'Present' : 'Missing')
console.log('Supabase Anon Key:', supabaseAnonKey ? 'Present' : 'Missing')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file contains:\n' +
    'VITE_SUPABASE_URL=your_project_url\n' +
    'VITE_SUPABASE_ANON_KEY=your_anon_key'
  )
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Auth helper functions
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  }
}

// Type definitions for our database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string // This will be the same as the auth user's ID
          created_at: string
          email: string
          first_name: string
          last_name: string
          bank: string
          current_balance: number
          address: string
          password: string // Note: In production, we should remove this as it's handled by auth
        }
        Insert: {
          id: string // Make id required for insert
          created_at?: string
          email: string
          first_name: string
          last_name: string
          bank: string
          current_balance: number
          address: string
          password: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          first_name?: string
          last_name?: string
          bank?: string
          current_balance?: number
          address?: string
          password?: string
        }
      }
      spending_locations: {
        Row: {
          id: string
          created_at: string
          user_id: string
          name: string
          category: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          name: string
          category: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          name?: string
          category?: string
        }
      }
      spending_amounts: {
        Row: {
          id: string
          created_at: string
          spending_location_id: string
          amount: number
          date: string
          description: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          spending_location_id: string
          amount: number
          date?: string
          description?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          spending_location_id?: string
          amount?: number
          date?: string
          description?: string | null
        }
      }
    }
  }
}

// Helper functions for common database operations
export const db = {
  // User operations
  users: {
    create: async (userData: Database['public']['Tables']['users']['Insert']) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    
    findByEmail: async (email: string) => {
      const { data, error } = await supabase
        .from('users')
        .select()
        .eq('email', email)
        .single()
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Database['public']['Tables']['users']['Update']) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  // Spending locations operations
  spendingLocations: {
    create: async (locationData: Database['public']['Tables']['spending_locations']['Insert']) => {
      const { data, error } = await supabase
        .from('spending_locations')
        .insert(locationData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('spending_locations')
        .select()
        .eq('user_id', userId)
      
      if (error) throw error
      return data
    },
    
    update: async (id: string, updates: Database['public']['Tables']['spending_locations']['Update']) => {
      const { data, error } = await supabase
        .from('spending_locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  },
  
  spendingAmounts: {
    create: async (amountData: Database['public']['Tables']['spending_amounts']['Insert']) => {
      const { data, error } = await supabase
        .from('spending_amounts')
        .insert(amountData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    getByLocationId: async (locationId: string) => {
      const { data, error } = await supabase
        .from('spending_amounts')
        .select()
        .eq('spending_location_id', locationId)
        .order('date', { ascending: false })
      
      if (error) throw error
      return data
    },
    
    getTotalByLocationId: async (locationId: string) => {
      const { data, error } = await supabase
        .from('spending_amounts')
        .select('amount')
        .eq('spending_location_id', locationId)
      
      if (error) throw error
      return data.reduce((sum, record) => sum + record.amount, 0)
    },

    getAllTotalsByLocationIds: async (locationIds: Array<string>) => {
      const { data, error } = await supabase
        .from('spending_amounts')
        .select('spending_location_id, amount')
        .in('spending_location_id', locationIds)
      
      if (error) throw error
      
      // Group by location_id and sum amounts
      const totals = new Map<string, number>()
      for (const record of data) {
        const current = totals.get(record.spending_location_id) || 0
        totals.set(record.spending_location_id, current + record.amount)
      }
      
      return totals
    },
    
    update: async (id: string, updates: Database['public']['Tables']['spending_amounts']['Update']) => {
      const { data, error } = await supabase
        .from('spending_amounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    
    delete: async (id: string) => {
      const { error } = await supabase
        .from('spending_amounts')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    }
  }
} 