import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { FocusMode } from '../lib/supabase'

export const useFocusMode = (userId: string) => {
  const [focusMode, setFocusMode] = useState<FocusMode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFocusMode()
  }, [userId])

  const fetchFocusMode = async () => {
    try {
      const { data, error } = await supabase
        .from('focus_modes')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      setFocusMode(data)
    } catch (error) {
      console.error('Error fetching focus mode:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFocusMode = async (updates: Partial<FocusMode>) => {
    try {
      if (!focusMode) {
        const { data, error } = await supabase
          .from('focus_modes')
          .insert([{ user_id: userId, ...updates }])
          .select()
          .single()

        if (error) throw error
        setFocusMode(data)
      } else {
        const { data, error } = await supabase
          .from('focus_modes')
          .update(updates)
          .eq('id', focusMode.id)
          .select()
          .single()

        if (error) throw error
        setFocusMode(data)
      }
    } catch (error) {
      console.error('Error updating focus mode:', error)
    }
  }

  return {
    focusMode,
    loading,
    updateFocusMode
  }
} 