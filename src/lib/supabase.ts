import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type FocusMode = {
  id: string
  user_id: string
  blocked_apps: string[]
  block_notifications: boolean
  enabled: boolean
  created_at: string
}

export type PomodoroStats = {
  id: string
  user_id: string
  pomodoros_completed: number
  total_focus_time: number
  total_break_time: number
  last_updated: string
}

export type PomodoroSession = {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  duration: number
  type: 'focus' | 'break'
  completed: boolean
} 