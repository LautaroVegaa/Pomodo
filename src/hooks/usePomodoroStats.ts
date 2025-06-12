import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { PomodoroStats } from '../lib/supabase'

export const usePomodoroStats = (userId: string) => {
  const [stats, setStats] = useState<PomodoroStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('pomodoro_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Error fetching pomodoro stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStats = async (updates: Partial<PomodoroStats>) => {
    try {
      if (!stats) {
        const { data, error } = await supabase
          .from('pomodoro_stats')
          .insert([{
            user_id: userId,
            pomodoros_completed: 0,
            total_focus_time: 0,
            total_break_time: 0,
            ...updates
          }])
          .select()
          .single()

        if (error) throw error
        setStats(data)
      } else {
        const { data, error } = await supabase
          .from('pomodoro_stats')
          .update({
            ...updates,
            last_updated: new Date().toISOString()
          })
          .eq('id', stats.id)
          .select()
          .single()

        if (error) throw error
        setStats(data)
      }
    } catch (error) {
      console.error('Error updating pomodoro stats:', error)
    }
  }

  const recordPomodoroSession = async (duration: number, type: 'focus' | 'break') => {
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .insert([{
          user_id: userId,
          start_time: new Date().toISOString(),
          duration,
          type,
          completed: true
        }])

      if (error) throw error

      // Update stats
      if (type === 'focus') {
        await updateStats({
          pomodoros_completed: (stats?.pomodoros_completed || 0) + 1,
          total_focus_time: (stats?.total_focus_time || 0) + duration
        })
      } else {
        await updateStats({
          total_break_time: (stats?.total_break_time || 0) + duration
        })
      }
    } catch (error) {
      console.error('Error recording pomodoro session:', error)
    }
  }

  return {
    stats,
    loading,
    updateStats,
    recordPomodoroSession
  }
} 