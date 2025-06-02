
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Settings, BarChart3 } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";

const Index = () => {
  const {
    timeLeft,
    isActive,
    isBreak,
    cycle,
    settings,
    stats,
    progress,
    formatTime,
    toggleTimer,
    resetTimer
  } = usePomodoro();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">StudyBoost</h1>
          <p className="text-gray-600">Técnica Pomodoro para estudiantes</p>
        </div>

        {/* Estado actual */}
        <div className="text-center">
          <Badge variant={isBreak ? "secondary" : "default"} className="text-lg px-4 py-2">
            {isBreak ? "Descanso" : "Enfoque"} - Ciclo {cycle}
          </Badge>
        </div>

        {/* Timer principal */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-mono text-gray-800">
              {formatTime(timeLeft)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ${
                  isBreak ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Controles */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={toggleTimer}
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  isBreak ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="w-20 h-20 rounded-full"
              >
                <RotateCcw className="w-8 h-8" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="w-5 h-5 mr-2" />
              Estadísticas de hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalCycles}</p>
                <p className="text-sm text-gray-600">Ciclos completados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m
                </p>
                <p className="text-sm text-gray-600">Tiempo estudiado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración rápida */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Settings className="w-5 h-5 mr-2" />
              Configuración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="font-semibold">{settings.workTime} min</p>
                <p className="text-gray-600">Trabajo</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-semibold">{settings.shortBreak} min</p>
                <p className="text-gray-600">Descanso</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivación */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold mb-2">¡Mantén el enfoque!</h3>
            <p className="text-sm opacity-90">
              Cada ciclo completado te acerca más a tus objetivos de estudio.
            </p>
          </CardContent>
        </Card>

        {/* Instrucciones PWA */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="text-center py-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>💡 Instalar aplicación</strong>
            </p>
            <p className="text-xs text-blue-600">
              Toca el menú de tu navegador y selecciona "Añadir a pantalla de inicio" para usar StudyBoost como una app nativa.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
