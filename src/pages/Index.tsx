
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, BarChart3, User, Clock, Coffee } from "lucide-react";
import { usePomodoro } from "@/hooks/usePomodoro";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "@/components/Settings";
import { TimeSlider } from "@/components/TimeSlider";
import { FocusMode } from "@/components/FocusMode";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const {
    timeLeft,
    isActive,
    isBreak,
    cycle,
    settings,
    stats,
    progress,
    motivationalMessage,
    formatTime,
    toggleTimer,
    resetTimer,
    updateSettings
  } = usePomodoro();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Get user name from user metadata or email
  const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';

  const handleWorkTimeChange = (newTime: number) => {
    updateSettings({
      ...settings,
      workTime: newTime
    });
  };

  const handleBreakTimeChange = (newTime: number) => {
    updateSettings({
      ...settings,
      shortBreak: newTime
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header con información del usuario - diseño mejorado para centrado perfecto */}
        <div className="text-center py-4">
          <div className="relative flex items-center justify-center mb-2">
            {/* Usuario a la izquierda - posición absoluta para no afectar el centrado */}
            <div className="absolute left-0 flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-700 dark:text-gray-200 max-w-[120px] truncate">
                  {userName}
                </span>
              </div>
            </div>
            
            {/* Título centrado perfectamente */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pomodō</h1>
            
            {/* Settings a la derecha - posición absoluta para no afectar el centrado */}
            <div className="absolute right-0">
              <Settings />
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300">Técnica Pomodoro para estudiantes</p>
        </div>

        {/* Estado actual */}
        <div className="text-center">
          <Badge variant={isBreak ? "secondary" : "default"} className="text-lg px-4 py-2">
            {isBreak ? "Descanso" : "Enfoque"} - Ciclo {cycle}
          </Badge>
        </div>

        {/* Timer principal */}
        <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-mono text-gray-800 dark:text-white">
              {formatTime(timeLeft)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
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
                className="w-20 h-20 rounded-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <RotateCcw className="w-8 h-8" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modo Enfoque */}
        <FocusMode isActive={isActive && !isBreak} />

        {/* Estadísticas rápidas */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg dark:text-white">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Estadísticas de hoy
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/statistics')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Ver más
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalCycles}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ciclos completados</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.floor(stats.totalStudyTime / 60)}h {stats.totalStudyTime % 60}m
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo estudiado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración personalizable con sliders */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg dark:text-white text-center">
              Personalizar Pomodoro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <TimeSlider
                label="Tiempo de trabajo"
                value={settings.workTime}
                maxValue={60}
                minValue={1}
                bgColor="bg-blue-50 dark:bg-blue-900/20"
                icon={<Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                onChange={handleWorkTimeChange}
              />
              <TimeSlider
                label="Tiempo de descanso"
                value={settings.shortBreak}
                maxValue={30}
                minValue={1}
                bgColor="bg-green-50 dark:bg-green-900/20"
                icon={<Coffee className="w-4 h-4 text-green-600 dark:text-green-400" />}
                onChange={handleBreakTimeChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tarjeta motivacional dinámica */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold mb-2">¡{userName}!</h3>
            <p className="text-sm opacity-90">
              {motivationalMessage}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
