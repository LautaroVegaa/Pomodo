import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { PomodoroSession } from '../lib/supabase'

const STORAGE_KEY = 'pomodoro_session'
const RUNNING_KEY = 'pomodoro_is_running'

export const usePersistentTimer = (userId: string) => {
  const [session, setSession] = useState<PomodoroSession | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Calcular el tiempo restante dinámicamente
  const timeLeft = (() => {
    if (!session) return 0
    const startTime = new Date(session.start_time).getTime()
    const elapsed = Math.floor((now - startTime) / 1000)
    return Math.max(0, session.duration - elapsed)
  })()

  // Load session and running state from storage on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(STORAGE_KEY)
    const storedRunning = localStorage.getItem(RUNNING_KEY)
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession)
      setSession(parsedSession)
      setIsRunning(storedRunning === 'true')
    }
  }, [])

  // Save session and running state to storage
  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      localStorage.setItem(RUNNING_KEY, isRunning ? 'true' : 'false')
    } else {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(RUNNING_KEY)
    }
  }, [session, isRunning])

  // Timer logic: actualizar 'now' cada segundo solo si está corriendo
  useEffect(() => {
    if (!isRunning || !session) return
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, session])

  // Escuchar cuando el usuario vuelve a la app (tab visible)
  useEffect(() => {
    const handleVisibility = () => {
      setNow(Date.now())
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Parar el timer si se termina
  useEffect(() => {
    if (isRunning && timeLeft === 0) {
      setIsRunning(false)
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
    setIsRunning(true)
    setNow(Date.now())
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
      setNow(Date.now())
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