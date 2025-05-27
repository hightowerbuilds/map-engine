import { supabase } from '../supabase'
import type { Database } from '../supabase'

export type User = Database['public']['Tables']['users']['Row']

export const users = {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(userData: {
    id: string
    email: string
    first_name: string
    last_name: string
    bank: string
    current_balance: number
    address: string
    password: string
  }) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 