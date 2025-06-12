
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Plus, X, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FocusModeProps {
  isActive: boolean;
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

export const FocusMode: React.FC<FocusModeProps> = ({ isActive }) => {
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);
  const [blockedSites, setBlockedSites] = useState<string[]>(DEFAULT_BLOCKED_SITES);
  const [newSite, setNewSite] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [notificationsBlocked, setNotificationsBlocked] = useState(false);
  const { toast } = useToast();

  // Cargar configuración del localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('focus-mode-config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setFocusModeEnabled(config.enabled || false);
      setBlockedSites(config.blockedSites || DEFAULT_BLOCKED_SITES);
      setNotificationsBlocked(config.notificationsBlocked || false);
    }
  }, []);

  // Guardar configuración en localStorage
  useEffect(() => {
    const config = {
      enabled: focusModeEnabled,
      blockedSites,
      notificationsBlocked
    };
    localStorage.setItem('focus-mode-config', JSON.stringify(config));
  }, [focusModeEnabled, blockedSites, notificationsBlocked]);

  // Activar/desactivar modo enfoque automáticamente según el estado del Pomodoro
  useEffect(() => {
    if (isActive && focusModeEnabled) {
      activateFocusMode();
    } else {
      deactivateFocusMode();
    }
  }, [isActive, focusModeEnabled]);

  const activateFocusMode = async () => {
    try {
      // Bloquear notificaciones si está habilitado
      if (notificationsBlocked && 'Notification' in window) {
        // Crear una notificación invisible para bloquear las demás
        if (Notification.permission === 'granted') {
          // En navegadores modernos, podemos usar la Page Visibility API
          // para detectar cuando el usuario intenta cambiar de pestaña
          document.addEventListener('visibilitychange', handleVisibilityChange);
        }
      }

      // Inyectar script para bloquear sitios web
      injectSiteBlocker();
      
      toast({
        title: "🔒 Modo Enfoque Activado",
        description: `Bloqueando ${blockedSites.length} sitios web y ${notificationsBlocked ? 'notificaciones' : 'sin bloqueo de notificaciones'}.`,
      });
    } catch (error) {
      console.error('Error activating focus mode:', error);
    }
  };

  const deactivateFocusMode = () => {
    try {
      // Remover bloqueadores
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      removeSiteBlocker();
      
      if (isActive) {
        toast({
          title: "🔓 Modo Enfoque Desactivado",
          description: "Puedes acceder nuevamente a todos los sitios web.",
        });
      }
    } catch (error) {
      console.error('Error deactivating focus mode:', error);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden && isActive && focusModeEnabled) {
      // El usuario intentó cambiar de pestaña durante una sesión de enfoque
      setTimeout(() => {
        if (document.hidden) {
          window.focus();
          toast({
            title: "⚠️ Mantén el enfoque",
            description: "Estás en modo enfoque. ¡Concéntrate en tu Pomodoro!",
          });
        }
      }, 1000);
    }
  };

  const injectSiteBlocker = () => {
    // Crear un script que bloquee los sitios especificados
    const script = document.createElement('script');
    script.id = 'focus-mode-blocker';
    script.textContent = `
      (function() {
        const blockedSites = ${JSON.stringify(blockedSites)};
        const currentHost = window.location.hostname;
        
        const isBlocked = blockedSites.some(site => 
          currentHost.includes(site) || currentHost.endsWith(site)
        );
        
        if (isBlocked) {
          document.body.innerHTML = \`
            <div style="
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              z-index: 999999;
              font-family: 'Arial', sans-serif;
              color: white;
              text-align: center;
            ">
              <div style="max-width: 500px; padding: 40px;">
                <h1 style="font-size: 3em; margin-bottom: 20px;">🔒</h1>
                <h2 style="font-size: 2em; margin-bottom: 20px;">Sitio Bloqueado</h2>
                <p style="font-size: 1.2em; margin-bottom: 30px;">
                  Este sitio está bloqueado durante tu sesión de Pomodoro.
                </p>
                <p style="font-size: 1em; opacity: 0.8;">
                  ¡Mantén el enfoque y vuelve cuando termines tu ciclo de trabajo!
                </p>
                <div style="margin-top: 30px;">
                  <button onclick="window.close()" style="
                    background: rgba(255,255,255,0.2);
                    border: 2px solid white;
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1em;
                  ">Cerrar Pestaña</button>
                </div>
              </div>
            </div>
          \`;
          
          // Bloquear navegación
          window.addEventListener('beforeunload', function(e) {
            e.preventDefault();
            e.returnValue = '';
          });
        }
      })();
    `;
    
    // Intentar inyectar en todas las pestañas si es posible
    document.head.appendChild(script);
  };

  const removeSiteBlocker = () => {
    const script = document.getElementById('focus-mode-blocker');
    if (script) {
      script.remove();
    }
  };

  const addSite = () => {
    if (newSite.trim() && !blockedSites.includes(newSite.trim())) {
      setBlockedSites([...blockedSites, newSite.trim()]);
      setNewSite('');
      toast({
        title: "Sitio agregado",
        description: `${newSite.trim()} será bloqueado durante el modo enfoque.`,
      });
    }
  };

  const removeSite = (site: string) => {
    setBlockedSites(blockedSites.filter(s => s !== site));
    toast({
      title: "Sitio removido",
      description: `${site} ya no será bloqueado.`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSite();
    }
  };

  return (
    <Card className={`dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 ${
      isActive && focusModeEnabled ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' : ''
    }`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg dark:text-white">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Modo Enfoque
            {isActive && focusModeEnabled && (
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
            checked={focusModeEnabled}
            onCheckedChange={setFocusModeEnabled}
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
                onCheckedChange={setNotificationsBlocked}
              />
            </div>

            {/* Lista de sitios bloqueados */}
            <div className="space-y-2">
              <Label className="dark:text-white text-sm font-medium">
                Sitios web bloqueados ({blockedSites.length})
              </Label>
              
              {/* Input para agregar sitios */}
              <div className="flex space-x-2">
                <Input
                  placeholder="ejemplo.com"
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm dark:bg-gray-700 dark:text-white"
                />
                <Button size="sm" onClick={addSite} disabled={!newSite.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Lista de sitios */}
              <div className="max-h-32 overflow-y-auto space-y-1">
                {blockedSites.map((site, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm"
                  >
                    <span className="dark:text-white">{site}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSite(site)}
                      className="h-6 w-6 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {focusModeEnabled && (
              <div className="text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                <strong>💡 Consejo:</strong> El modo enfoque se activará automáticamente durante tus sesiones de trabajo Pomodoro. Los sitios bloqueados mostrarán una pantalla de bloqueo.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FocusMode;
