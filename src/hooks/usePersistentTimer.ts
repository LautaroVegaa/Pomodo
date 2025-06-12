import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { PomodoroSession } from '../lib/supabase'

const STORAGE_KEY = 'pomodoro_session'

export const usePersistentTimer = (userId: string) => {
  const [session, setSession] = useState<PomodoroSession | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isRunning, setIsRunning] = useState(false)

  // Load session from storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(STORAGE_KEY)
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession)
      setSession(parsedSession)
      
      // Calculate time left
      const startTime = new Date(parsedSession.start_time).getTime()
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      const remaining = Math.max(0, parsedSession.duration - elapsed)
      
      setTimeLeft(remaining)
      setIsRunning(remaining > 0)
    }
  }, [])

  // Save session to storage
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [session])

  // Timer logic
  useEffect(() => {
    let interval: number | undefined

    if (isRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isRunning, timeLeft])

  const startTimer = useCallback(async (duration: number, type: 'focus' | 'break') => {
    const newSession: PomodoroSession = {
      id: crypto.randomUUID(),
      user_id: userId,
      start_time: new Date().toISOString(),
      end_time: null,
      duration,
      type,
      completed: false
    }

    setSession(newSession)
    setTimeLeft(duration)
    setIsRunning(true)

    // Save to Supabase
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .insert([newSession])

      if (error) throw error
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }, [userId])

  const stopTimer = useCallback(async () => {
    if (!session) return

    setIsRunning(false)
    const updatedSession = {
      ...session,
      end_time: new Date().toISOString(),
      completed: true
    }

    setSession(updatedSession)

    // Update in Supabase
    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .update(updatedSession)
        .eq('id', session.id)

      if (error) throw error
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }, [session])

  const pauseTimer = useCallback(() => {
    setIsRunning(false)
  }, [])

  const resumeTimer = useCallback(() => {
    if (timeLeft > 0) {
      setIsRunning(true)
    }
  }, [timeLeft])

  return {
    timeLeft,
    isRunning,
    session,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  }
} 