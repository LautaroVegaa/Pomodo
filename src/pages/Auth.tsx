
import React, { useState } from 'react';
import { LoginForm } from "@/components/LoginForm";
import { RegisterForm } from "@/components/RegisterForm";
import { ThemeToggle } from "@/components/ThemeToggle";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header con toggle de tema */}
        <div className="text-center py-4">
          <div className="flex justify-between items-center mb-2">
            <div className="w-10"></div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pomodō</h1>
            <ThemeToggle />
          </div>
          <p className="text-gray-600 dark:text-gray-300">Técnica Pomodoro para estudiantes</p>
        </div>

        {/* Formulario de autenticación */}
        {isLogin ? (
          <LoginForm onToggleMode={toggleMode} />
        ) : (
          <RegisterForm onToggleMode={toggleMode} />
        )}

        {/* Información adicional */}
        <div className="text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              <strong>🚀 Próximamente</strong>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Sistema de autenticación completo con Supabase para una experiencia más segura y sincronización en la nube.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
