
import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
  lastUpdateTime: number;
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
  const { user } = useAuth();
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
    currentSessionStartTime: 0,
    lastUpdateTime: Date.now()
  });

  const [motivationalMessage, setMotivationalMessage] = useState(motivationalMessages.work[0]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const notificationPermissionRef = useRef<boolean>(false);

  // Función para generar claves de localStorage específicas del usuario
  const getUserStorageKey = (key: string) => {
    if (!user?.id) return key;
    return `${key}-${user.id}`;
  };

  // Función para guardar estadísticas históricas específicas del usuario
  const saveHistoricalStats = (stats: PomodoroStats) => {
    const storageKey = getUserStorageKey('pomodoro-historical-stats');
    const savedHistoricalStats = localStorage.getItem(storageKey);
    let historicalStats = {};
    
    if (savedHistoricalStats) {
      historicalStats = JSON.parse(savedHistoricalStats);
    }
    
    historicalStats[stats.date] = stats;
    localStorage.setItem(storageKey, JSON.stringify(historicalStats));
  };

  // Solicitar permisos de notificación de forma persistente
  const requestNotificationPermission = async () => {
    if ('Notification' in window && settings.notificationsEnabled) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        notificationPermissionRef.current = permission === 'granted';
        console.log('Permiso de notificación:', permission);
        
        if (permission === 'granted') {
          toast({
            title: "✅ Notificaciones habilitadas",
            description: "Recibirás alertas cuando terminen los ciclos Pomodoro.",
          });
        }
      } else {
        notificationPermissionRef.current = Notification.permission === 'granted';
      }
    }
  };

  // Sincronizar tiempo cuando la app vuelve a estar visible - mejorado
  const syncTimeWhenVisible = useCallback(() => {
    if (!state.isActive || !user) return;

    const currentTime = Date.now();
    const timePassed = Math.floor((currentTime - state.lastUpdateTime) / 1000);
    
    if (timePassed > 0) {
      setState(prev => {
        const newTimeLeft = Math.max(0, prev.timeLeft - timePassed);
        console.log(`Sincronizando tiempo: ${timePassed}s transcurridos, tiempo restante: ${newTimeLeft}s`);
        
        return {
          ...prev,
          timeLeft: newTimeLeft,
          lastUpdateTime: currentTime
        };
      });
    }
  }, [state.isActive, state.lastUpdateTime, user]);

  // Cargar configuraciones, estadísticas y estado del localStorage - mejorado para persistencia
  useEffect(() => {
    if (!user) return;

    console.log('Cargando datos del usuario:', user.id);

    // Cargar configuraciones específicas del usuario
    const savedSettings = localStorage.getItem(getUserStorageKey('pomodoro-settings'));
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...defaultSettings, ...parsedSettings });
      console.log('Configuraciones cargadas:', parsedSettings);
    }

    // Cargar estado del pomodoro específico del usuario
    const savedState = localStorage.getItem(getUserStorageKey('pomodoro-state'));
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Agregar lastUpdateTime si no existe
      if (!parsedState.lastUpdateTime) {
        parsedState.lastUpdateTime = Date.now();
      }
      
      // Si hay una sesión activa, sincronizar el tiempo
      if (parsedState.isActive) {
        const currentTime = Date.now();
        const timePassed = Math.floor((currentTime - parsedState.lastUpdateTime) / 1000);
        parsedState.timeLeft = Math.max(0, parsedState.timeLeft - timePassed);
        parsedState.lastUpdateTime = currentTime;
        
        console.log('Sesión activa detectada, sincronizando tiempo:', {
          timePassed,
          newTimeLeft: parsedState.timeLeft
        });
      }
      
      setState(parsedState);
    } else {
      const workTime = savedSettings ? JSON.parse(savedSettings).workTime : 25;
      const initialState = {
        timeLeft: workTime * 60,
        isActive: false,
        isBreak: false,
        cycle: 1,
        currentSessionStartTime: 0,
        lastUpdateTime: Date.now()
      };
      setState(initialState);
    }

    // Cargar estadísticas del día actual específicas del usuario
    const savedStats = localStorage.getItem(getUserStorageKey('pomodoro-stats'));
    if (savedStats) {
      const parsedStats = JSON.parse(savedStats);
      const today = new Date().toDateString();
      
      if (parsedStats.date === today) {
        setStats(parsedStats);
      } else {
        // Si es un nuevo día, guardar las estadísticas del día anterior y resetear
        if (parsedStats.totalCycles > 0 || parsedStats.totalStudyTime > 0) {
          saveHistoricalStats(parsedStats);
        }
        
        const newStats = {
          totalCycles: 0,
          totalStudyTime: 0,
          totalBreakTime: 0,
          date: today
        };
        setStats(newStats);
        localStorage.setItem(getUserStorageKey('pomodoro-stats'), JSON.stringify(newStats));
      }
    } else {
      // Primera vez usando la app
      const newStats = {
        totalCycles: 0,
        totalStudyTime: 0,
        totalBreakTime: 0,
        date: new Date().toDateString()
      };
      setStats(newStats);
      localStorage.setItem(getUserStorageKey('pomodoro-stats'), JSON.stringify(newStats));
    }

    // Crear elemento de audio para notificaciones mejorado
    audioRef.current = new Audio();
    // Usar un tono más distintivo para notificaciones
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAABACIA22YAABPIA4gBAAIABAECA';
    audioRef.current.preload = 'auto';
    
    // Solicitar permisos de notificación al cargar
    requestNotificationPermission();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user]);

  // Guardar estado cuando cambie (solo si hay usuario) - mejorado
  useEffect(() => {
    if (user) {
      const stateToSave = {
        ...state,
        lastUpdateTime: Date.now()
      };
      localStorage.setItem(getUserStorageKey('pomodoro-state'), JSON.stringify(stateToSave));
      console.log('Estado guardado:', stateToSave);
    }
  }, [state, user]);

  // Cambiar mensaje motivacional cuando cambie el estado
  useEffect(() => {
    const messages = state.isBreak ? motivationalMessages.break : motivationalMessages.work;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMotivationalMessage(randomMessage);
  }, [state.isBreak, state.cycle]);

  // Timer principal con mejor manejo de visibilidad y persistencia - mejorado
  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1),
          lastUpdateTime: Date.now()
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

  // Detectar cuando la app vuelve a estar visible para sincronizar el estado - mejorado
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // La app volvió a estar visible, sincronizar tiempo
        console.log('App visible, sincronizando...');
        syncTimeWhenVisible();
      }
    };

    const handleFocus = () => {
      console.log('App focused, sincronizando...');
      syncTimeWhenVisible();
    };

    const handleBlur = () => {
      // Guardar estado cuando se pierde el foco
      if (user && state.isActive) {
        const stateToSave = {
          ...state,
          lastUpdateTime: Date.now()
        };
        localStorage.setItem(getUserStorageKey('pomodoro-state'), JSON.stringify(stateToSave));
        console.log('App blur, estado guardado');
      }
    };

    // Detectar cuando la app se reanuda en móviles
    const handleResume = () => {
      console.log('App resumed, sincronizando...');
      syncTimeWhenVisible();
    };

    // Manejar beforeunload para persistencia
    const handleBeforeUnload = () => {
      if (user && state.isActive) {
        const stateToSave = {
          ...state,
          lastUpdateTime: Date.now()
        };
        localStorage.setItem(getUserStorageKey('pomodoro-state'), JSON.stringify(stateToSave));
        console.log('Before unload, estado guardado');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pageshow', handleResume);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pageshow', handleResume);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [syncTimeWhenVisible, user, state]);

  const playNotificationSound = () => {
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
    }
  };

  const triggerVibration = () => {
    if (settings.vibrationEnabled && 'vibrate' in navigator) {
      // Patrón de vibración más fuerte para móviles
      navigator.vibrate([300, 100, 300, 100, 300]);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      // Cerrar notificaciones anteriores
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.getNotifications().then(notifications => {
            notifications.forEach(notification => notification.close());
          });
        });
      }

      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-notification',
        requireInteraction: true,
        silent: false,
        data: {
          timestamp: Date.now(),
          type: 'pomodoro'
        }
      });

      // Trigger vibration separately
      triggerVibration();

      // Auto cerrar después de 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Manejar click en notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  const handleCycleComplete = useCallback(() => {
    console.log('Ciclo completado');
    
    setState(prev => ({ 
      ...prev, 
      isActive: false,
      lastUpdateTime: Date.now()
    }));
    
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
      if (user) {
        localStorage.setItem(getUserStorageKey('pomodoro-stats'), JSON.stringify(newStats));
      }
      
      // Determinar tipo de descanso
      const isLongBreak = newStats.totalCycles % settings.cyclesBeforeLongBreak === 0;
      const breakTime = isLongBreak ? settings.longBreak : settings.shortBreak;
      
      setState(prev => ({
        ...prev,
        timeLeft: breakTime * 60,
        isBreak: true,
        lastUpdateTime: Date.now()
      }));
      
      const notificationTitle = '🎉 ¡Ciclo Completado!';
      const notificationBody = `Tiempo de ${isLongBreak ? 'descanso largo' : 'descanso corto'}: ${breakTime} minutos`;
      
      showNotification(notificationTitle, notificationBody);
      
      toast({
        title: notificationTitle,
        description: notificationBody,
      });
    } else {
      // Completó descanso
      const isLongBreak = state.cycle % settings.cyclesBeforeLongBreak === 0;
      const breakTime = isLongBreak ? settings.longBreak : settings.shortBreak;
      const newStats = {
        ...stats,
        totalBreakTime: stats.totalBreakTime + breakTime
      };
      
      setStats(newStats);
      if (user) {
        localStorage.setItem(getUserStorageKey('pomodoro-stats'), JSON.stringify(newStats));
      }
      
      setState(prev => ({
        ...prev,
        timeLeft: settings.workTime * 60,
        isBreak: false,
        cycle: prev.cycle + 1,
        lastUpdateTime: Date.now()
      }));
      
      const notificationTitle = '💪 ¡Descanso Terminado!';
      const notificationBody = `Comenzando ciclo ${state.cycle + 1}`;
      
      showNotification(notificationTitle, notificationBody);
      
      toast({
        title: notificationTitle,
        description: notificationBody,
      });
    }
  }, [state, settings, stats, toast, user]);

  const toggleTimer = () => {
    const currentTime = Date.now();
    
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        isActive: true,
        currentSessionStartTime: currentTime,
        lastUpdateTime: currentTime
      }));
      
      // Solicitar permisos de notificación si no los tenemos
      if (!notificationPermissionRef.current) {
        requestNotificationPermission();
      }
      
      console.log('Timer iniciado');
    } else {
      setState(prev => ({ 
        ...prev, 
        isActive: false,
        lastUpdateTime: currentTime
      }));
      
      console.log('Timer pausado');
    }
  };

  const resetTimer = () => {
    setState({
      timeLeft: settings.workTime * 60,
      isActive: false,
      isBreak: false,
      cycle: 1,
      currentSessionStartTime: 0,
      lastUpdateTime: Date.now()
    });
    
    console.log('Timer reseteado');
  };

  const updateSettings = (newSettings: PomodoroSettings) => {
    setSettings(newSettings);
    if (user) {
      localStorage.setItem(getUserStorageKey('pomodoro-settings'), JSON.stringify(newSettings));
    }
    
    // Si no está corriendo, actualizar el tiempo actual
    if (!state.isActive) {
      setState(prev => ({
        ...prev,
        timeLeft: newSettings.workTime * 60,
        lastUpdateTime: Date.now()
      }));
    }
    
    console.log('Configuraciones actualizadas:', newSettings);
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
