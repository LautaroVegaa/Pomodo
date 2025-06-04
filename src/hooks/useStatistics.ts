
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
  }, []);

  const loadStatistics = () => {
    setIsLoading(true);
    
    try {
      // Cargar datos del localStorage y generar estadísticas
      const savedStats = localStorage.getItem('pomodoro-stats');
      const today = new Date();
      const currentDate = today.toDateString();
      
      // Generar datos de ejemplo y cargar datos reales
      const mockData = generateMockData();
      
      // Si hay datos guardados para hoy, usarlos
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        if (parsedStats.date === currentDate) {
          mockData.today = {
            date: currentDate,
            studyTime: parsedStats.totalStudyTime || 0,
            cycles: parsedStats.totalCycles || 0,
            breaks: parsedStats.totalCycles || 0
          };
        }
      }
      
      setStats(mockData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockData = (): StatisticsData => {
    const today = new Date();
    const currentDate = today.toDateString();
    
    // Generar datos para los últimos 7 días
    const dailyData: DayData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dailyData.push({
        date: date.toDateString(),
        studyTime: Math.floor(Math.random() * 120) + 30, // 30-150 minutos
        cycles: Math.floor(Math.random() * 6) + 1, // 1-6 ciclos
        breaks: Math.floor(Math.random() * 6) + 1
      });
    }

    // Generar datos semanales (últimas 4 semanas)
    const weeklyData: WeekData[] = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekDays: DayData[] = [];
      let totalStudyTime = 0;
      let totalCycles = 0;
      
      for (let j = 0; j < 7; j++) {
        const dayDate = new Date(weekStart);
        dayDate.setDate(dayDate.getDate() + j);
        const studyTime = Math.floor(Math.random() * 120) + 20;
        const cycles = Math.floor(Math.random() * 5) + 1;
        
        weekDays.push({
          date: dayDate.toDateString(),
          studyTime,
          cycles,
          breaks: cycles
        });
        
        totalStudyTime += studyTime;
        totalCycles += cycles;
      }
      
      weeklyData.push({
        week: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`,
        totalStudyTime,
        totalCycles,
        days: weekDays
      });
    }

    // Generar datos mensuales (últimos 6 meses)
    const monthlyData: MonthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const totalStudyTime = Math.floor(Math.random() * 2000) + 500; // 500-2500 minutos
      const totalCycles = Math.floor(Math.random() * 100) + 20; // 20-120 ciclos
      
      monthlyData.push({
        month: monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
        totalStudyTime,
        totalCycles,
        averagePerDay: Math.floor(totalStudyTime / 30),
        weeks: []
      });
    }

    // Generar datos anuales (últimos 3 años)
    const yearlyData: YearData[] = [];
    for (let i = 2; i >= 0; i--) {
      const yearDate = new Date();
      yearDate.setFullYear(yearDate.getFullYear() - i);
      const totalStudyTime = Math.floor(Math.random() * 20000) + 5000; // 5000-25000 minutos
      const totalCycles = Math.floor(Math.random() * 1000) + 200; // 200-1200 ciclos
      
      yearlyData.push({
        year: yearDate.getFullYear().toString(),
        totalStudyTime,
        totalCycles,
        averagePerMonth: Math.floor(totalStudyTime / 12),
        months: []
      });
    }

    // Calcular totales actuales
    const currentWeek = weeklyData[weeklyData.length - 1];
    const currentMonth = monthlyData[monthlyData.length - 1];
    const currentYear = yearlyData[yearlyData.length - 1];
    
    return {
      today: dailyData[dailyData.length - 1],
      week: currentWeek,
      month: currentMonth,
      year: currentYear,
      daily: dailyData,
      weekly: weeklyData,
      monthly: monthlyData,
      yearly: yearlyData
    };
  };

  return {
    stats,
    isLoading,
    refreshStats: loadStatistics
  };
};
