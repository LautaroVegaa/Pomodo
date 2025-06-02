
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PomodoroSettings {
  workTime: number;
  shortBreak: number;
  longBreak: number;
  cyclesBeforeLongBreak: number;
}

export interface PomodoroStats {
  totalCycles: number;
  totalStudyTime: number;
  date: string;
}

const defaultSettings: PomodoroSettings = {
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesBeforeLongBreak: 4
};

export const usePomodoro = () => {
  const { toast } = useToast();
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycle, setCycle] = useState(1);
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [stats, setStats] = useState<PomodoroStats>({
    totalCycles: 0,
    totalStudyTime: 0,
    date: new Date().toDateString()
  });

  // Cargar configuraciones y estadísticas del localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      setTimeLeft(parsedSettings.workTime * 60);
    }

    const savedStats = localStorage.getItem('pomodoro-stats');
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      const today = new Date().toDateString();
      
      if (parsedStats.date === today) {
        setStats(parsedStats);
      } else {
        // Nueva fecha, resetear estadísticas
        const newStats = {
          totalCycles: 0,
          totalStudyTime: 0,
          date: today
        };
        setStats(newStats);
        localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));
      }
    }
  }, []);

  // Timer principal
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleCycleComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isBreak, settings, stats]);

  const handleCycleComplete = useCallback(() => {
    setIsActive(false);
    
    if (!isBreak) {
      // Completó un ciclo de trabajo
      const newStats = {
        ...stats,
        totalCycles: stats.totalCycles + 1,
        totalStudyTime: stats.totalStudyTime + settings.workTime
      };
      
      setStats(newStats);
      localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));
      
      // Determinar tipo de descanso
      const isLongBreak = newStats.totalCycles % settings.cyclesBeforeLongBreak === 0;
      const breakTime = isLongBreak ? settings.longBreak : settings.shortBreak;
      
      setTimeLeft(breakTime * 60);
      setIsBreak(true);
      
      // Notificación del navegador
      if (Notification.permission === 'granted') {
        new Notification('¡Ciclo completado!', {
          body: `Tiempo de ${isLongBreak ? 'descanso largo' : 'descanso corto'}: ${breakTime} minutos`,
          icon: '/manifest.json'
        });
      }
      
      toast({
        title: "¡Ciclo completado!",
        description: `Tiempo de ${isLongBreak ? 'descanso largo' : 'descanso corto'}: ${breakTime} minutos`,
      });
    } else {
      // Completó descanso
      setTimeLeft(settings.workTime * 60);
      setIsBreak(false);
      setCycle(cycle + 1);
      
      if (Notification.permission === 'granted') {
        new Notification('¡Descanso terminado!', {
          body: `Comenzando ciclo ${cycle + 1}`,
          icon: '/manifest.json'
        });
      }
      
      toast({
        title: "¡Descanso terminado!",
        description: `Comenzando ciclo ${cycle + 1}`,
      });
    }
  }, [isBreak, settings, stats, cycle, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    
    // Solicitar permisos de notificación
    if (!isActive && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(settings.workTime * 60);
    setIsBreak(false);
    setCycle(1);
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
    
    // Si no está corriendo, actualizar el tiempo actual
    if (!isActive) {
      setTimeLeft(newSettings.workTime * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = isBreak 
    ? ((settings.shortBreak * 60 - timeLeft) / (settings.shortBreak * 60)) * 100
    : ((settings.workTime * 60 - timeLeft) / (settings.workTime * 60)) * 100;

  return {
    timeLeft,
    isActive,
    isBreak,
    cycle,
    settings,
    stats,
    progress,
    formatTime,
    toggleTimer,
    resetTimer,
    updateSettings
  };
};
