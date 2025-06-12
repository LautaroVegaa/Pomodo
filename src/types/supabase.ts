export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      focus_modes: {
        Row: {
          id: string
          user_id: string
          blocked_apps: string[]
          block_notifications: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          blocked_apps: string[]
          block_notifications: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          blocked_apps?: string[]
          block_notifications?: boolean
          created_at?: string
        }
      }
      pomodoro_stats: {
        Row: {
          id: string
          user_id: string
          pomodoros_completed: number
          total_focus_time: number
          total_break_time: number
          last_updated: string
        }
        Insert: {
          id?: string
          user_id: string
          pomodoros_completed?: number
          total_focus_time?: number
          total_break_time?: number
          last_updated?: string
        }
        Update: {
          id?: string
          user_id?: string
          pomodoros_completed?: number
          total_focus_time?: number
          total_break_time?: number
          last_updated?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          start_time: string
          end_time: string | null
          duration: number
          type: 'focus' | 'break'
          completed: boolean
        }
        Insert: {
          id?: string
          user_id: string
          start_time: string
          end_time?: string | null
          duration: number
          type: 'focus' | 'break'
          completed?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          start_time?: string
          end_time?: string | null
          duration?: number
          type?: 'focus' | 'break'
          completed?: boolean
        }
      }
    }
  }
} 