import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Plus, X, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useFocusMode } from '../hooks/useFocusMode'

interface FocusModeProps {
  userId: string
}

const DEFAULT_BLOCKED_SITES = [
  'instagram.com',
  'tiktok.com',
  'facebook.com',
  'twitter.com',
  'youtube.com',
  'twitch.tv',
  'reddit.com',
  'netflix.com'
];

export function FocusMode({ userId }: FocusModeProps) {
  const { focusMode, loading, updateFocusMode } = useFocusMode(userId)
  const [newApp, setNewApp] = useState('')
  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  const { toast } = useToast();

  // Cargar configuración del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('focus-mode-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setNotificationsBlocked(config.notificationsBlocked || false);
    }
  }, []);

  // Guardar configuración en localStorage
  useEffect(() => {
    const config = {
      notificationsBlocked
    };
    localStorage.setItem('focus-mode-config', JSON.stringify(config));
  }, [notificationsBlocked]);

  const handleToggleNotifications = async (checked: boolean) => {
    await updateFocusMode({ block_notifications: checked })
  }

  const handleAddApp = async () => {
    if (!newApp.trim()) return

    const updatedApps = [...(focusMode?.blocked_apps || []), newApp.trim()]
    await updateFocusMode({ blocked_apps: updatedApps })
    setNewApp('')
  }

  const handleRemoveApp = async (appToRemove: string) => {
    const updatedApps = (focusMode?.blocked_apps || []).filter(app => app !== appToRemove)
    await updateFocusMode({ blocked_apps: updatedApps })
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card className={`dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ${
      focusMode?.enabled ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : ''
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg dark:text-white">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Modo Enfoque
            {focusMode?.enabled && (
              <Badge className="ml-2 bg-red-500 text-white animate-pulse">ACTIVO</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 dark:text-gray-300"
          >
            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Switch principal */}
        <div className="flex items-center justify-between">
          <Label htmlFor="focus-mode" className="dark:text-white">
            Activar durante Pomodoros
          </Label>
          <Switch
            id="focus-mode"
            checked={focusMode?.enabled || false}
            onCheckedChange={(checked) => {
              updateFocusMode({ enabled: checked })
            }}
          />
        </div>

        {isExpanded && (
          <>
            {/* Configuración de notificaciones */}
            <div className="flex items-center justify-between">
              <Label htmlFor="block-notifications" className="dark:text-white text-sm">
                Bloquear cambio de pestañas
              </Label>
              <Switch
                id="block-notifications"
                checked={notificationsBlocked}
                onCheckedChange={handleToggleNotifications}
              />
            </div>

            {/* Lista de sitios bloqueados */}
            <div className="space-y-2">
              <Label className="dark:text-white text-sm font-medium">
                Sitios web bloqueados ({focusMode?.blocked_apps.length || 0})
              </Label>
              
              {/* Input para agregar sitios */}
              <div className="flex space-x-2">
                <Input
                  placeholder="ejemplo.com"
                  value={newApp}
                  onChange={(e) => setNewApp(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddApp();
                    }
                  }}
                  className="text-sm dark:bg-gray-700 dark:text-white"
                />
                <Button size="sm" onClick={handleAddApp} disabled={!newApp.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Lista de sitios */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {focusMode?.blocked_apps.map((app, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                  >
                    <span className="dark:text-white">{app}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveApp(app)}
                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {focusMode?.enabled && (
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <strong>💡 Consejo:</strong> El modo enfoque se activará automáticamente durante tus sesiones de trabajo Pomodoro. Los sitios bloqueados mostrarán una pantalla de bloqueo.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default FocusMode;
