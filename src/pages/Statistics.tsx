
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, BarChart3, Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DailyStats } from "@/components/statistics/DailyStats";
import { WeeklyStats } from "@/components/statistics/WeeklyStats";
import { MonthlyStats } from "@/components/statistics/MonthlyStats";
import { YearlyStats } from "@/components/statistics/YearlyStats";
import { useStatistics } from "@/hooks/useStatistics";

const Statistics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, isLoading } = useStatistics();
  const [activeTab, setActiveTab] = useState("daily");

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">Estadísticas</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Análisis de tu progreso de estudio</p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Resumen rápido responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Hoy</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white truncate">
                    {Math.floor(stats.today.studyTime / 60)}h {stats.today.studyTime % 60}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Esta semana</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white truncate">
                    {Math.floor(stats.week.totalStudyTime / 60)}h {stats.week.totalStudyTime % 60}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Ciclos hoy</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white">
                    {stats.today.cycles}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Promedio/día</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-800 dark:text-white truncate">
                    {Math.floor(stats.month.averagePerDay / 60)}h {stats.month.averagePerDay % 60}m
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs de estadísticas responsive */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white text-lg sm:text-xl">Análisis detallado</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                <TabsTrigger value="daily" className="text-xs sm:text-sm py-2">Diario</TabsTrigger>
                <TabsTrigger value="weekly" className="text-xs sm:text-sm py-2">Semanal</TabsTrigger>
                <TabsTrigger value="monthly" className="text-xs sm:text-sm py-2">Mensual</TabsTrigger>
                <TabsTrigger value="yearly" className="text-xs sm:text-sm py-2">Anual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily" className="mt-4 sm:mt-6">
                <DailyStats data={stats.daily} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="weekly" className="mt-4 sm:mt-6">
                <WeeklyStats data={stats.weekly} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-4 sm:mt-6">
                <MonthlyStats data={stats.monthly} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="yearly" className="mt-4 sm:mt-6">
                <YearlyStats data={stats.yearly} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
