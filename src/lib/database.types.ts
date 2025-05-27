export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Array<Json>

export interface Database {
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
          password: string
        }
        Insert: {
          id: string
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
          transaction_date: string
        }
        Insert: {
          id?: string
          created_at?: string
          spending_location_id: string
          amount: number
          transaction_date: string
        }
        Update: {
          id?: string
          created_at?: string
          spending_location_id?: string
          amount?: number
          transaction_date?: string
        }
      }
      uploads: {
        Row: {
          id: string
          created_at: string
          user_id: string
          file_name: string
          file_size: number
          status: 'processing' | 'completed' | 'failed'
          analysis_results: Json | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          file_name: string
          file_size: number
          status?: 'processing' | 'completed' | 'failed'
          analysis_results?: Json | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          file_name?: string
          file_size?: number
          status?: 'processing' | 'completed' | 'failed'
          analysis_results?: Json | null
          updated_at?: string | null
        }
      }
      extracted_transactions: {
        Row: {
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
        Insert: {
          id?: string
          upload_id: string
          user_id: string
          transaction_date: string
          merchant_name: string
          amount: number
          category?: string | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          raw_text: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          upload_id?: string
          user_id?: string
          transaction_date?: string
          merchant_name?: string
          amount?: number
          category?: string | null
          location_address?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          raw_text?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 