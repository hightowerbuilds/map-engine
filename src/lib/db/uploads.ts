import { supabase } from '../supabase'
import type { Database } from '../supabase'

export type Upload = Database['public']['Tables']['uploads']['Row']

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
  }
} 