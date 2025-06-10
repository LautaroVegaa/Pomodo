
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, LogOut, Moon, Sun, Bell, BellOff, Focus, Volume2, VolumeX, Vibrate } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { usePomodoro } from "@/hooks/usePomodoro";

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { settings, updateSettings } = usePomodoro();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleNotifications = () => {
    updateSettings({
      ...settings,
      notificationsEnabled: !settings.notificationsEnabled
    });
  };

  const toggleSound = () => {
    updateSettings({
      ...settings,
      soundEnabled: !settings.soundEnabled
    });
  };

  const toggleVibration = () => {
    updateSettings({
      ...settings,
      vibrationEnabled: !settings.vibrationEnabled
    });
  };

  const toggleFocusMode = () => {
    updateSettings({
      ...settings,
      focusModeEnabled: !settings.focusModeEnabled
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 rounded-full"
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="sr-only">Configuración</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Configuración</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
            <span>Modo oscuro</span>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
          />
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings.notificationsEnabled ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
            <span>Notificaciones</span>
          </div>
          <Switch
            checked={settings.notificationsEnabled}
            onCheckedChange={toggleNotifications}
          />
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span>Sonido</span>
          </div>
          <Switch
            checked={settings.soundEnabled}
            onCheckedChange={toggleSound}
          />
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Vibrate className="w-4 h-4" />
            <span>Vibración</span>
          </div>
          <Switch
            checked={settings.vibrationEnabled}
            onCheckedChange={toggleVibration}
          />
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Focus className="w-4 h-4" />
            <div className="flex flex-col">
              <span className="text-sm">Modo Focus</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Bloquea apps y notificaciones mientras estás en un ciclo Pomodoro.
              </span>
            </div>
          </div>
          <Switch
            checked={settings.focusModeEnabled}
            onCheckedChange={toggleFocusMode}
          />
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
