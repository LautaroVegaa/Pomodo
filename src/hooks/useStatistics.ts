import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface DayData {
  date: string;
  studyTime: number;
  cycles: number;
  breaks: number;
}

export interface WeekData {
  week: string;
  totalStudyTime: number;
  totalCycles: number;
  days: DayData[];
}

export interface MonthData {
  month: string;
  totalStudyTime: number;
  totalCycles: number;
  averagePerDay: number;
  weeks: WeekData[];
}

export interface YearData {
  year: string;
  totalStudyTime: number;
  totalCycles: number;
  averagePerMonth: number;
  months: MonthData[];
}

export interface StatisticsData {
  today: DayData;
  week: WeekData;
  month: MonthData;
  year: YearData;
  daily: DayData[];
  weekly: WeekData[];
  monthly: MonthData[];
  yearly: YearData[];
}

export const useStatistics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatisticsData>({
    today: { date: '', studyTime: 0, cycles: 0, breaks: 0 },
    week: { week: '', totalStudyTime: 0, totalCycles: 0, days: [] },
    month: { month: '', totalStudyTime: 0, totalCycles: 0, averagePerDay: 0, weeks: [] },
    year: { year: '', totalStudyTime: 0, totalCycles: 0, averagePerMonth: 0, months: [] },
    daily: [],
    weekly: [],
    monthly: [],
    yearly: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Función para generar claves de localStorage específicas del usuario
  const getUserStorageKey = (key: string) => {
    if (!user?.id) return key;
    return `${key}-${user.id}`;
  };

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    loadStatistics();
    
    // Actualizar estadísticas cada minuto para reflejar cambios en tiempo real
    const interval = setInterval(loadStatistics, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const loadStatistics = () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const today = new Date();
      const currentDate = today.toDateString();
      
      // Cargar datos reales del pomodoro de hoy específicos del usuario
      const savedStats = localStorage.getItem(getUserStorageKey('pomodoro-stats'));
      let todayStats = { date: currentDate, studyTime: 0, cycles: 0, breaks: 0 };
      
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        if (parsedStats.date === currentDate) {
          todayStats = {
            date: currentDate,
            studyTime: parsedStats.totalStudyTime || 0,
            cycles: parsedStats.totalCycles || 0,
            breaks: parsedStats.totalBreakTime ? Math.floor(parsedStats.totalBreakTime / 5) : parsedStats.totalCycles || 0
          };
        }
      }
      
      // Cargar datos históricos específicos del usuario
      const savedHistoricalStats = localStorage.getItem(getUserStorageKey('pomodoro-historical-stats'));
      let historicalStats = {};
      
      if (savedHistoricalStats) {
        historicalStats = JSON.parse(savedHistoricalStats);
      }
      
      // Generar datos para los últimos 30 días (solo con datos reales específicos del usuario)
      const dailyData: DayData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        if (dateString === currentDate) {
          dailyData.push(todayStats);
        } else {
          // Buscar datos históricos para este día
          const historicalData = historicalStats[dateString];
          if (historicalData) {
            dailyData.push({
              date: dateString,
              studyTime: historicalData.totalStudyTime || 0,
              cycles: historicalData.totalCycles || 0,
              breaks: historicalData.totalBreakTime ? Math.floor(historicalData.totalBreakTime / 5) : historicalData.totalCycles || 0
            });
          } else {
            // Si no hay datos históricos, crear entrada vacía
            dailyData.push({
              date: dateString,
              studyTime: 0,
              cycles: 0,
              breaks: 0
            });
          }
        }
      }

      // Calcular estadísticas semanales basadas en datos reales
      const weeklyData: WeekData[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekDays = dailyData.filter(day => {
          const dayDate = new Date(day.date);
          return dayDate >= weekStart && dayDate <= weekEnd;
        });
        
        const totalStudyTime = weekDays.reduce((sum, day) => sum + day.studyTime, 0);
        const totalCycles = weekDays.reduce((sum, day) => sum + day.cycles, 0);
        
        weeklyData.push({
          week: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
          totalStudyTime,
          totalCycles,
          days: weekDays
        });
      }

      // Generar datos mensuales basados en datos reales
      const monthlyData: MonthData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        
        const monthDays = dailyData.filter(day => {
          const dayDate = new Date(day.date);
          return dayDate.getMonth() === monthDate.getMonth() && dayDate.getFullYear() === monthDate.getFullYear();
        });
        
        const totalStudyTime = monthDays.reduce((sum, day) => sum + day.studyTime, 0);
        const totalCycles = monthDays.reduce((sum, day) => sum + day.cycles, 0);
        const averagePerDay = monthDays.length > 0 ? Math.floor(totalStudyTime / monthDays.length) : 0;
        
        monthlyData.push({
          month: monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          totalStudyTime,
          totalCycles,
          averagePerDay,
          weeks: []
        });
      }

      // Generar datos anuales basados en datos reales
      const yearlyData: YearData[] = [];
      for (let i = 2; i >= 0; i--) {
        const yearDate = new Date();
        yearDate.setFullYear(yearDate.getFullYear() - i);
        
        const yearMonths = monthlyData.filter(month => {
          return month.month.includes(yearDate.getFullYear().toString());
        });
        
        const totalStudyTime = yearMonths.reduce((sum, month) => sum + month.totalStudyTime, 0);
        const totalCycles = yearMonths.reduce((sum, month) => sum + month.totalCycles, 0);
        const averagePerMonth = yearMonths.length > 0 ? Math.floor(totalStudyTime / yearMonths.length) : 0;
        
        yearlyData.push({
          year: yearDate.getFullYear().toString(),
          totalStudyTime,
          totalCycles,
          averagePerMonth,
          months: []
        });
      }

      const currentWeek = weeklyData[weeklyData.length - 1];
      const currentMonth = monthlyData[monthlyData.length - 1];
      const currentYear = yearlyData[yearlyData.length - 1];
      
      setStats({
        today: todayStats,
        week: currentWeek,
        month: currentMonth,
        year: currentYear,
        daily: dailyData,
        weekly: weeklyData,
        monthly: monthlyData,
        yearly: yearlyData
      });
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    stats,
    isLoading,
    refreshStats: loadStatistics
  };
};
