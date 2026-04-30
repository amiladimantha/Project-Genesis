export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string | null
          icon?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'categories_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          name: string
          amount: number
          currency: string
          billing_cycle: 'monthly' | 'yearly' | 'weekly' | null
          next_payment_date: string
          category_id: string | null
          status: 'active' | 'cancelled' | 'paused'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          amount: number
          currency?: string
          billing_cycle?: 'monthly' | 'yearly' | 'weekly' | null
          next_payment_date: string
          category_id?: string | null
          status?: 'active' | 'cancelled' | 'paused'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          amount?: number
          currency?: string
          billing_cycle?: 'monthly' | 'yearly' | 'weekly' | null
          next_payment_date?: string
          category_id?: string | null
          status?: 'active' | 'cancelled' | 'paused'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subscriptions_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          subscription_id: string | null
          name: string
          amount: number
          category_id: string | null
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id?: string | null
          name: string
          amount: number
          category_id?: string | null
          date?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string | null
          name?: string
          amount?: number
          category_id?: string | null
          date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'transactions_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_subscription_id_fkey'
            columns: ['subscription_id']
            referencedRelation: 'subscriptions'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'transactions_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
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

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']

export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertCategory = Database['public']['Tables']['categories']['Insert']
export type InsertSubscription = Database['public']['Tables']['subscriptions']['Insert']
export type InsertTransaction = Database['public']['Tables']['transactions']['Insert']

export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateCategory = Database['public']['Tables']['categories']['Update']
export type UpdateSubscription = Database['public']['Tables']['subscriptions']['Update']
export type UpdateTransaction = Database['public']['Tables']['transactions']['Update']
