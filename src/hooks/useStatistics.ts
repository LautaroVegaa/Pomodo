
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    loadStatistics();
    
    // Actualizar estadísticas cada minuto para reflejar cambios en tiempo real
    const interval = setInterval(loadStatistics, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadStatistics = () => {
    setIsLoading(true);
    
    try {
      const today = new Date();
      const currentDate = today.toDateString();
      
      // Cargar datos reales del pomodoro de hoy
      const savedStats = localStorage.getItem('pomodoro-stats');
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
      
      // Generar datos históricos (últimos 30 días) con datos reales si existen
      const dailyData: DayData[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        if (dateString === currentDate) {
          dailyData.push(todayStats);
        } else {
          // Para días anteriores, generar datos mock
          const studyTime = Math.floor(Math.random() * 120) + 20;
          dailyData.push({
            date: dateString,
            studyTime,
            cycles: Math.floor(studyTime / 25) + Math.floor(Math.random() * 3),
            breaks: Math.floor(studyTime / 25) + Math.floor(Math.random() * 2)
          });
        }
      }

      // Calcular estadísticas semanales
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

      // Generar datos mensuales
      const monthlyData: MonthData[] = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        
        let totalStudyTime, totalCycles;
        if (i === 0) {
          // Mes actual: usar datos reales
          totalStudyTime = dailyData
            .filter(day => new Date(day.date).getMonth() === monthDate.getMonth())
            .reduce((sum, day) => sum + day.studyTime, 0);
          totalCycles = dailyData
            .filter(day => new Date(day.date).getMonth() === monthDate.getMonth())
            .reduce((sum, day) => sum + day.cycles, 0);
        } else {
          // Meses anteriores: datos mock
          totalStudyTime = Math.floor(Math.random() * 2000) + 500;
          totalCycles = Math.floor(Math.random() * 100) + 20;
        }
        
        monthlyData.push({
          month: monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          totalStudyTime,
          totalCycles,
          averagePerDay: Math.floor(totalStudyTime / 30),
          weeks: []
        });
      }

      // Generar datos anuales
      const yearlyData: YearData[] = [];
      for (let i = 2; i >= 0; i--) {
        const yearDate = new Date();
        yearDate.setFullYear(yearDate.getFullYear() - i);
        
        let totalStudyTime, totalCycles;
        if (i === 0) {
          // Año actual: usar datos reales del mes actual
          totalStudyTime = monthlyData.reduce((sum, month) => sum + month.totalStudyTime, 0);
          totalCycles = monthlyData.reduce((sum, month) => sum + month.totalCycles, 0);
        } else {
          // Años anteriores: datos mock
          totalStudyTime = Math.floor(Math.random() * 20000) + 5000;
          totalCycles = Math.floor(Math.random() * 1000) + 200;
        }
        
        yearlyData.push({
          year: yearDate.getFullYear().toString(),
          totalStudyTime,
          totalCycles,
          averagePerMonth: Math.floor(totalStudyTime / 12),
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
