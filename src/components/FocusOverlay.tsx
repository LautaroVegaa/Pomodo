import { useEffect, useState } from 'react'
import { useFocusMode } from '../hooks/useFocusMode'
import { Card } from './ui/card'

interface FocusOverlayProps {
  userId: string
  isActive: boolean
}

const FOCUS_MESSAGES = [
  'Stay focused! You\'re doing great!',
  'Keep going, you\'ve got this!',
  'One step at a time, stay in the zone!',
  'Focus on the present moment!',
  'You\'re making progress, keep it up!'
]

export function FocusOverlay({ userId, isActive }: FocusOverlayProps) {
  const { focusMode } = useFocusMode(userId)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isActive && focusMode?.block_notifications) {
      const interval = setInterval(() => {
        const randomMessage = FOCUS_MESSAGES[Math.floor(Math.random() * FOCUS_MESSAGES.length)]
        setMessage(randomMessage)
      }, 30000) // Change message every 30 seconds

      return () => clearInterval(interval)
    }
  }, [isActive, focusMode?.block_notifications])

  if (!isActive || !focusMode?.block_notifications) {
    return null
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute bottom-4 right-4">
        <Card className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="text-sm text-muted-foreground">
            {message}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Focus mode is active
            {focusMode.blocked_apps.length > 0 && (
              <div>
                Blocked apps: {focusMode.blocked_apps.join(', ')}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
} 