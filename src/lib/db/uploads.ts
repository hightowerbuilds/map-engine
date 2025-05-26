import { supabase } from '../supabase'
import type { Database } from '../supabase'

export type Upload = Database['public']['Tables']['uploads']['Row']

export interface Transaction {
  id: string
  upload_id: string
  user_id: string
  transaction_date: string
  merchant_name: string
  amount: number
  category: string | null
  location_address: string | null
  location_city: string | null
  location_state: string | null
  location_zip: string | null
  raw_text: string
  created_at: string
  updated_at: string
}

export const uploads = {
  async create(userId: string, fileName: string, fileSize: number) {
    const { data, error } = await supabase
      .from('uploads')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_size: fileSize,
        status: 'processing',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getByUserId(userId: string) {
    const { data, error } = await supabase
      .from('uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async updateStatus(uploadId: string, status: 'processing' | 'completed' | 'failed') {
    const { data, error } = await supabase
      .from('uploads')
      .update({ status })
      .eq('id', uploadId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async getTransactionsByUploadId(uploadId: string): Promise<Array<Transaction>> {
    const { data, error } = await supabase
      .from('extracted_transactions')
      .select('*')
      .eq('upload_id', uploadId)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }

    return data
  },

  async saveTransactions(uploadId: string, userId: string, transactions: Array<{
    transaction_date: string
    merchant_name: string
    amount: number
    category?: string | null
    location_address?: string | null
    location_city?: string | null
    location_state?: string | null
    location_zip?: string | null
    raw_text: string
  }>) {
    const { data, error } = await supabase
      .from('extracted_transactions')
      .insert(
        transactions.map(t => ({
          upload_id: uploadId,
          user_id: userId,
          ...t,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select()

    if (error) {
      console.error('Error saving transactions:', error)
      throw error
    }

    return data
  }
} 