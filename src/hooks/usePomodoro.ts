
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PomodoroSettings {
  workTime: number;
  shortBreak: number;
  longBreak: number;
  cyclesBeforeLongBreak: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  focusModeEnabled: boolean;
}

export interface PomodoroStats {
  totalCycles: number;
  totalStudyTime: number;
  totalBreakTime: number;
  date: string;
}

export interface PomodoroState {
  timeLeft: number;
  isActive: boolean;
  isBreak: boolean;
  cycle: number;
  currentSessionStartTime: number;
}

const defaultSettings: PomodoroSettings = {
  workTime: 25,
  shortBreak: 5,
  longBreak: 15,
  cyclesBeforeLongBreak: 4,
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: true,
  focusModeEnabled: false
};

const motivationalMessages = {
  work: [
    "¡Concentración total! Este es tu momento.",
    "Cada minuto cuenta. ¡Vamos por ese objetivo!",
    "Tu futuro se construye ahora. ¡Dale con todo!",
    "La disciplina de hoy es el éxito de mañana.",
    "¡Enfoque máximo! Estás más cerca de tu meta."
  ],
  break: [
    "¡Excelente trabajo! Te mereces este descanso.",
    "Relájate y recarga energías. ¡Lo estás haciendo genial!",
    "Un buen descanso es parte del éxito. ¡Disfrútalo!",
    "¡Increíble sesión! Ahora es momento de relajarse.",
    "Tu esfuerzo está dando frutos. ¡Descansa bien!"
  ]
};

export const usePomodoro = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings);
  const [stats, setStats] = useState<PomodoroStats>({
    totalCycles: 0,
    totalStudyTime: 0,
    totalBreakTime: 0,
    date: new Date().toDateString()
  });
  
  const [state, setState] = useState<PomodoroState>({
    timeLeft: 25 * 60,
    isActive: false,
    isBreak: false,
    cycle: 1,
    currentSessionStartTime: 0
  });

  const [motivationalMessage, setMotivationalMessage] = useState(motivationalMessages.work[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar configuraciones, estadísticas y estado del localStorage
  useEffect(() => {
    // Cargar configuraciones
    const savedSettings = localStorage.getItem('pomodoro-settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...defaultSettings, ...parsedSettings });
    }

    // Cargar estado del pomodoro
    const savedState = localStorage.getItem('pomodoro-state');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setState(parsedState);
    } else {
      const initialState = {
        timeLeft: (savedSettings ? JSON.parse(savedSettings).workTime : 25) * 60,
        isActive: false,
        isBreak: false,
        cycle: 1,
        currentSessionStartTime: 0
      };
      setState(initialState);
    }

    // Cargar estadísticas
    const savedStats = localStorage.getItem('pomodoro-stats');
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      const today = new Date().toDateString();
      
      if (parsedStats.date === today) {
        setStats(parsedStats);
      } else {
        const newStats = {
          totalCycles: 0,
          totalStudyTime: 0,
          totalBreakTime: 0,
          date: today
        };
        setStats(newStats);
        localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));
      }
    }

    // Crear elemento de audio para notificaciones
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAABACIA22YAABPIA4gBAAI=');
    
    // Solicitar permisos de notificación al cargar
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Guardar estado cuando cambie
  useEffect(() => {
    localStorage.setItem('pomodoro-state', JSON.stringify(state));
  }, [state]);

  // Cambiar mensaje motivacional cuando cambie el estado
  useEffect(() => {
    const messages = state.isBreak ? motivationalMessages.break : motivationalMessages.work;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  }, [state.isBreak, state.cycle]);

  // Timer principal
  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    } else if (state.timeLeft === 0 && state.isActive) {
      handleCycleComplete();
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.timeLeft]);

  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const triggerVibration = () => {
    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  const handleCycleComplete = useCallback(() => {
    setState(prev => ({ ...prev, isActive: false }));
    
    // Reproducir sonido y vibración
    playNotificationSound();
    triggerVibration();
    
    if (!state.isBreak) {
      // Completó un ciclo de trabajo
      const sessionTime = settings.workTime;
      const newStats = {
        ...stats,
        totalCycles: stats.totalCycles + 1,
        totalStudyTime: stats.totalStudyTime + sessionTime
      };
      
      setStats(newStats);
      localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));
      
      // Determinar tipo de descanso
      const isLongBreak = newStats.totalCycles % settings.cyclesBeforeLongBreak === 0;
      const breakTime = isLongBreak ? settings.longBreak : settings.shortBreak;
      
      setState(prev => ({
        ...prev,
        timeLeft: breakTime * 60,
        isBreak: true
      }));
      
      // Notificación del navegador
      if (settings.notificationsEnabled && Notification.permission === 'granted') {
        new Notification('¡Ciclo completado!', {
          body: `Tiempo de ${isLongBreak ? 'descanso largo' : 'descanso corto'}: ${breakTime} minutos`,
          icon: '/favicon.ico'
        });
      }
      
      toast({
        title: "¡Ciclo completado!",
        description: `Tiempo de ${isLongBreak ? 'descanso largo' : 'descanso corto'}: ${breakTime} minutos`,
      });
    } else {
      // Completó descanso
      const breakTime = state.timeLeft === settings.longBreak * 60 ? settings.longBreak : settings.shortBreak;
      const newStats = {
        ...stats,
        totalBreakTime: stats.totalBreakTime + breakTime
      };
      
      setStats(newStats);
      localStorage.setItem('pomodoro-stats', JSON.stringify(newStats));
      
      setState(prev => ({
        ...prev,
        timeLeft: settings.workTime * 60,
        isBreak: false,
        cycle: prev.cycle + 1
      }));
      
      if (settings.notificationsEnabled && Notification.permission === 'granted') {
        new Notification('¡Descanso terminado!', {
          body: `Comenzando ciclo ${state.cycle + 1}`,
          icon: '/favicon.ico'
        });
      }
      
      toast({
        title: "¡Descanso terminado!",
        description: `Comenzando ciclo ${state.cycle + 1}`,
      });
    }
  }, [state, settings, stats, toast]);

  const toggleTimer = () => {
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        isActive: true,
        currentSessionStartTime: Date.now()
      }));
      
      // Solicitar permisos de notificación
      if (settings.notificationsEnabled && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      setState(prev => ({ ...prev, isActive: false }));
    }
  };

  const resetTimer = () => {
    setState({
      timeLeft: settings.workTime * 60,
      isActive: false,
      isBreak: false,
      cycle: 1,
      currentSessionStartTime: 0
    });
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    localStorage.setItem('pomodoro-settings', JSON.stringify(newSettings));
    
    // Si no está corriendo, actualizar el tiempo actual
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        timeLeft: newSettings.workTime * 60
      }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentDuration = () => {
    return state.isBreak 
      ? (state.cycle % settings.cyclesBeforeLongBreak === 0 ? settings.longBreak : settings.shortBreak)
      : settings.workTime;
  };

  const progress = state.isBreak 
    ? ((getCurrentDuration() * 60 - state.timeLeft) / (getCurrentDuration() * 60)) * 100
    : ((settings.workTime * 60 - state.timeLeft) / (settings.workTime * 60)) * 100;

  return {
    timeLeft: state.timeLeft,
    isActive: state.isActive,
    isBreak: state.isBreak,
    cycle: state.cycle,
    settings,
    stats,
    progress,
    motivationalMessage,
    formatTime,
    toggleTimer,
    resetTimer,
    updateSettings
  };
};
