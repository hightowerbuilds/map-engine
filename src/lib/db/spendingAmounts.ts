import { supabase } from '../supabase'
import type { Database } from '../supabase'

export type SpendingAmount = Database['public']['Tables']['spending_amounts']['Row']

export const spendingAmounts = {
  async getByLocationId(locationId: string) {
    const { data, error } = await supabase
      .from('spending_amounts')
      .select('*')
      .eq('spending_location_id', locationId)
      .order('transaction_date', { ascending: false })

    if (error) throw error
    return data
  },

  async getTotalByLocationId(locationId: string) {
    const { data, error } = await supabase
      .from('spending_amounts')
      .select('amount')
      .eq('spending_location_id', locationId)

    if (error) throw error
    return data.reduce((sum, row) => sum + row.amount, 0)
  },

  async getAllTotalsByLocationIds(locationIds: Array<string>) {
    const { data, error } = await supabase
      .from('spending_amounts')
      .select('spending_location_id, amount')
      .in('spending_location_id', locationIds)

    if (error) throw error

    // Create a map of location ID to total amount
    const totals = new Map<string, number>()
    locationIds.forEach(id => totals.set(id, 0))
    
    data.forEach(row => {
      const current = totals.get(row.spending_location_id) || 0
      totals.set(row.spending_location_id, current + row.amount)
    })

    return totals
  }
} 