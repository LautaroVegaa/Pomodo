
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
import { Settings as SettingsIcon, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
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
      <DropdownMenuContent align="end" className="w-56">
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
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
