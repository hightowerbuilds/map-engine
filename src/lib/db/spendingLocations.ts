import { supabase } from '../supabase'
import type { Database } from '../supabase'

export type SpendingLocation = Database['public']['Tables']['spending_locations']['Row']

export const spendingLocations = {
  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('spending_locations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async create(locationData: {
    user_id: string
    name: string
    category: string
  }) {
    const { data, error } = await supabase
      .from('spending_locations')
      .insert(locationData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: Partial<SpendingLocation>) {
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