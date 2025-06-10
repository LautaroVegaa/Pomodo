
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { MonthData } from "@/hooks/useStatistics";
import { Calendar, TrendingUp, Clock } from "lucide-react";

interface MonthlyStatsProps {
  data: MonthData[];
  isLoading: boolean;
}

export const MonthlyStats: React.FC<MonthlyStatsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data.map(month => ({
    month: month.month.split(' ')[0].substring(0, 3),
    fullMonth: month.month,
    studyTime: month.totalStudyTime,
    cycles: month.totalCycles,
    hours: Math.floor(month.totalStudyTime / 60),
    minutes: month.totalStudyTime % 60
  }));

  const totalStudyTime = data.reduce((total, month) => total + month.totalStudyTime, 0);
  const totalCycles = data.reduce((total, month) => total + month.totalCycles, 0);
  const averageMonthlyStudyTime = Math.floor(totalStudyTime / data.length);

  const chartConfig = {
    studyTime: {
      label: "Tiempo de estudio (min)",
      color: "#8b5cf6"
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen semestral */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="dark:bg-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 flex-shrink-0" />
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
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Promedio mensual</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {Math.floor(averageMonthlyStudyTime / 60)}h {averageMonthlyStudyTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de barras */}
      <Card className="dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white text-base sm:text-lg">Tiempo de estudio por mes</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <XAxis 
                  dataKey="month" 
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
          <CardTitle className="dark:text-white text-base sm:text-lg">Detalle por mes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {data.map((month, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0">
                  <p className="font-semibold dark:text-white capitalize text-sm sm:text-base">{month.month}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {month.totalCycles} ciclos • {Math.floor(month.averagePerDay / 60)}h {month.averagePerDay % 60}m/día promedio
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-purple-600 dark:text-purple-400 text-sm sm:text-base">
                    {Math.floor(month.totalStudyTime / 60)}h {month.totalStudyTime % 60}m
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
