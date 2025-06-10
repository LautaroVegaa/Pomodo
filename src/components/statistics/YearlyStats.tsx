
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { YearData } from "@/hooks/useStatistics";
import { TrendingUp, Calendar, Clock } from "lucide-react";

interface YearlyStatsProps {
  data: YearData[];
  isLoading: boolean;
}

export const YearlyStats: React.FC<YearlyStatsProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-48 sm:h-64 rounded-lg"></div>
      </div>
    );
  }

  const chartData = data.map(year => ({
    year: year.year,
    studyTime: year.totalStudyTime,
    cycles: year.totalCycles,
    hours: Math.floor(year.totalStudyTime / 60),
    minutes: year.totalStudyTime % 60
  }));

  const totalStudyTime = data.reduce((total, year) => total + year.totalStudyTime, 0);
  const totalCycles = data.reduce((total, year) => total + year.totalCycles, 0);
  const averageYearlyStudyTime = Math.floor(totalStudyTime / data.length);

  const chartConfig = {
    studyTime: {
      label: "Tiempo de estudio (min)",
      color: "#f59e0b"
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Resumen total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="dark:bg-gray-700">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 flex-shrink-0" />
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
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Promedio anual</p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                  {Math.floor(averageYearlyStudyTime / 60)}h {averageYearlyStudyTime % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de líneas */}
      <Card className="dark:bg-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white text-base sm:text-lg">Evolución anual</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64 lg:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                <XAxis 
                  dataKey="year" 
                  className="text-xs sm:text-sm" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  height={20}
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
          <CardTitle className="dark:text-white text-base sm:text-lg">Detalle por año</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            {data.map((year, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-gray-50 dark:bg-gray-600 rounded-lg space-y-2 sm:space-y-0">
                <div className="min-w-0">
                  <p className="font-semibold dark:text-white text-sm sm:text-base">{year.year}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {year.totalCycles} ciclos • {Math.floor(year.averagePerMonth / 60)}h {year.averagePerMonth % 60}m/mes promedio
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-orange-600 dark:text-orange-400 text-sm sm:text-base">
                    {Math.floor(year.totalStudyTime / 60)}h {year.totalStudyTime % 60}m
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {Math.floor(year.totalStudyTime / 365 / 60)}h {Math.floor(year.totalStudyTime / 365) % 60}m/día
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
