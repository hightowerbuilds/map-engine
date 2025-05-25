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

// Type definitions for our database tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          email: string
          first_name: string
          last_name: string
          bank: string
          current_balance: number
          address: string
        }
        Insert: {
          id?: string
          created_at?: string
          email: string
          first_name: string
          last_name: string
          bank: string
          current_balance: number
          address: string
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
    }
  }
}

// Helper functions for common database operations
export const db = {
  // User operations
  users: {
    create: async (userData: Omit<Database['public']['Tables']['users']['Insert'], 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          // Let Supabase handle id and created_at
        })
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
  }
} 