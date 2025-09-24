export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      matchmaking: {
        Row: {
          created_at: string | null
          has_video: boolean | null
          id: string
          matched_at: string | null
          matched_with: string | null
          room_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          has_video?: boolean | null
          id?: string
          matched_at?: string | null
          matched_with?: string | null
          room_id?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          has_video?: boolean | null
          id?: string
          matched_at?: string | null
          matched_with?: string | null
          room_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matchmaking_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string | null
          discord: string | null
          facebook: string | null
          id: string
          instagram: string | null
          is_vip: boolean | null
          snapchat: string | null
          subscription_date: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          discord?: string | null
          facebook?: string | null
          id: string
          instagram?: string | null
          is_vip?: boolean | null
          snapchat?: string | null
          subscription_date?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          discord?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          is_vip?: boolean | null
          snapchat?: string | null
          subscription_date?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string
          id: string
          target_user_id: string
          updated_at: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_user_id: string
          updated_at?: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          target_user_id?: string
          updated_at?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
