import React, { createContext, useContext } from 'react'
import { usePersistentTimer } from '../hooks/usePersistentTimer'

const PomodoroTimerContext = createContext<ReturnType<typeof usePersistentTimer> | null>(null)

export const PomodoroTimerProvider = ({ userId, children }: { userId: string, children: React.ReactNode }) => {
  const timer = usePersistentTimer(userId)
  return (
    <PomodoroTimerContext.Provider value={timer}>
      {children}
    </PomodoroTimerContext.Provider>
  )
}

export const usePomodoroTimer = () => {
  const ctx = useContext(PomodoroTimerContext)
  if (!ctx) throw new Error('usePomodoroTimer must be used within PomodoroTimerProvider')
  return ctx
} 