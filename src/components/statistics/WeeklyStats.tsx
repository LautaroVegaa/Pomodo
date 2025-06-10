
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { WeekData } from "@/hooks/useStatistics";
import { TrendingUp, Calendar, Clock } from "lucide-react";

interface WeeklyStatsProps {
  data: WeekData[];
  isLoading: boolean;
}

export const WeeklyStats: React.FC<WeeklyStatsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data.map((week, index) => ({
    week: `S${index + 1}`,
    fullWeek: week.week,
    studyTime: week.totalStudyTime,
    cycles: week.totalCycles,
    hours: Math.floor(week.totalStudyTime / 60),
    minutes: week.totalStudyTime % 60
  }));

  const totalStudyTime = data.reduce((total, week) => total + week.totalStudyTime, 0);
  const totalCycles = data.reduce((total, week) => total + week.totalCycles, 0);
  const averageWeeklyStudyTime = Math.floor(totalStudyTime / data.length);

  const chartConfig = {
    studyTime: {
      label: "Tiempo de estudio (min)",
      color: "#10b981"
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen mensual */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="dark:bg-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total período</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Ciclos totales</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">{totalCycles}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-700 sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Promedio semanal</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {Math.floor(averageWeeklyStudyTime / 60)}h {averageWeeklyStudyTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de líneas */}
      <Card className="dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white text-base sm:text-lg">Evolución semanal</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="week" 
                  className="text-xs sm:text-sm" 
                  tick={{ fontSize: 10 }}
                />
                <YAxis 
                  className="text-xs sm:text-sm" 
                  tick={{ fontSize: 10 }}
                  width={30}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="studyTime" 
                  stroke="var(--color-studyTime)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-studyTime)", strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Lista detallada */}
      <Card className="dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white text-base sm:text-lg">Detalle por semana</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {data.map((week, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0">
                  <p className="font-semibold dark:text-white text-sm sm:text-base">Semana {index + 1}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {week.week} • {week.totalCycles} ciclos
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-green-600 dark:text-green-400 text-sm sm:text-base">
                    {Math.floor(week.totalStudyTime / 60)}h {week.totalStudyTime % 60}m
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {Math.floor(week.totalStudyTime / 7 / 60)}h {Math.floor(week.totalStudyTime / 7) % 60}m/día
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
