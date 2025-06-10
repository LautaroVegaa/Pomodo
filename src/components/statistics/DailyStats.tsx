
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { DayData } from "@/hooks/useStatistics";
import { Clock, Calendar } from "lucide-react";

interface DailyStatsProps {
  data: DayData[];
  isLoading: boolean;
}

export const DailyStats: React.FC<DailyStatsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data.map(day => ({
    day: new Date(day.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
    studyTime: day.studyTime,
    cycles: day.cycles,
    hours: Math.floor(day.studyTime / 60),
    minutes: day.studyTime % 60
  }));

  const totalWeekStudyTime = data.reduce((total, day) => total + day.studyTime, 0);
  const totalWeekCycles = data.reduce((total, day) => total + day.cycles, 0);
  const averageDailyStudyTime = Math.floor(totalWeekStudyTime / data.length);

  const chartConfig = {
    studyTime: {
      label: "Tiempo de estudio (min)",
      color: "#3b82f6"
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen semanal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="dark:bg-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total semanal</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {Math.floor(totalWeekStudyTime / 60)}h {totalWeekStudyTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Ciclos totales</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{totalWeekCycles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Promedio diario</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {Math.floor(averageDailyStudyTime / 60)}h {averageDailyStudyTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras */}
      <Card className="dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white text-base sm:text-lg">Tiempo de estudio por día</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="day" 
                  className="text-xs sm:text-sm" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <YAxis 
                  className="text-xs sm:text-sm" 
                  tick={{ fontSize: 10 }}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="studyTime" 
                  fill="var(--color-studyTime)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Lista detallada */}
      <Card className="dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white text-base sm:text-lg">Detalle por día</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {data.map((day, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0">
                  <p className="font-semibold dark:text-white text-sm sm:text-base">
                    {new Date(day.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      day: 'numeric',
                      month: 'long'
                    })}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {day.cycles} ciclos completados
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                    {Math.floor(day.studyTime / 60)}h {day.studyTime % 60}m
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
