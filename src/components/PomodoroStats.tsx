import { usePomodoroStats } from '../hooks/usePomodoroStats'
import { Card } from './ui/card'

interface PomodoroStatsProps {
  userId: string
}

export function PomodoroStats({ userId }: PomodoroStatsProps) {
  const { stats, loading } = usePomodoroStats(userId)

  if (loading) {
    return <div>Loading...</div>
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Progress</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats?.pomodoros_completed || 0}</div>
            <div className="text-sm text-muted-foreground">Pomodoros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatTime(stats?.total_focus_time || 0)}</div>
            <div className="text-sm text-muted-foreground">Focus Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{formatTime(stats?.total_break_time || 0)}</div>
            <div className="text-sm text-muted-foreground">Break Time</div>
          </div>
        </div>
      </div>
    </Card>
  )
} 