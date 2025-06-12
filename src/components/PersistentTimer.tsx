import { useEffect } from 'react'
import { usePersistentTimer } from '../hooks/usePersistentTimer'
import { useNotifications } from '../hooks/useNotifications'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { useToast } from '@/hooks/use-toast'

interface PersistentTimerProps {
  userId: string
  focusDuration: number
  breakDuration: number
}

export function PersistentTimer({ userId, focusDuration, breakDuration }: PersistentTimerProps) {
  const {
    timeLeft,
    isRunning,
    session,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer
  } = usePersistentTimer(userId)

  const { sendNotification, requestPermission } = useNotifications()
  const { toast } = useToast()

  useEffect(() => {
    if (timeLeft === 0 && session) {
      const message = session.type === 'focus'
        ? 'Time for a break!'
        : 'Break is over, back to work!'
      
      sendNotification('Pomodoro Timer', {
        body: message,
        requireInteraction: true
      })
    }
  }, [timeLeft, session, sendNotification])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleStart = async (type: 'focus' | 'break') => {
    const duration = type === 'focus' ? focusDuration : breakDuration
    const granted = await requestPermission()
    if (!granted) {
      toast({
        title: 'Permiso de notificaciones requerido',
        description: 'Activa las notificaciones del navegador para recibir alertas al finalizar el Pomodoro.',
      })
    }
    startTimer(duration, type)
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold">{formatTime(timeLeft)}</div>
          <div className="text-sm text-muted-foreground">
            {session?.type === 'focus' ? 'Focus Time' : 'Break Time'}
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {!session ? (
            <>
              <Button onClick={() => handleStart('focus')}>Start Focus</Button>
              <Button onClick={() => handleStart('break')}>Start Break</Button>
            </>
          ) : (
            <>
              {isRunning ? (
                <Button onClick={pauseTimer}>Pause</Button>
              ) : (
                <Button onClick={resumeTimer}>Resume</Button>
              )}
              <Button variant="destructive" onClick={stopTimer}>Stop</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
} 