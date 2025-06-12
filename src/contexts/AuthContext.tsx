
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Configurar listener de cambios de autenticación primero
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;
        
        // Actualizar estado de sesión
        setSession(session);
        setUser(session?.user ?? null);
        
        // Solo marcar como no loading después de cualquier evento de auth
        setIsLoading(false);
        
        // Manejo específico de eventos
        if (event === 'SIGNED_IN') {
          console.log('Usuario autenticado exitosamente');
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuario deslogueado');
          // Limpiar todo el localStorage específico del usuario
          setTimeout(() => {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('pomodoro-') || key.startsWith('user-')) {
                localStorage.removeItem(key);
              }
            });
          }, 100);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refrescado automáticamente');
        }
      }
    );

    // Verificar sesión existente con mejor manejo de errores
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking session:', error);
          // En caso de error, limpiar estado y continuar
          if (mounted) {
            setSession(null);
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (mounted) {
          console.log('Initial session check:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in session initialization:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Error en login:', error);
        throw new Error(error.message);
      }

      console.log('Login exitoso para:', email);
      
      // La sesión se actualizará automáticamente por onAuthStateChange
    } catch (error) {
      console.error('Error en login:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    // Validación más estricta de contraseña
    if (password.length < 8) {
      setIsLoading(false);
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setIsLoading(false);
      throw new Error('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número');
    }

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name.trim(),
          }
        }
      });

      if (error) {
        console.error('Error en registro:', error);
        throw new Error(error.message);
      }

      console.log('Registro exitoso para:', email);
      
      // Si la confirmación de email está deshabilitada, el usuario se loguea automáticamente
      if (data.user && !data.user.email_confirmed_at) {
        console.log('Usuario registrado, esperando confirmación de email');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      
      // Limpiar datos específicos del usuario del localStorage
      if (user?.id) {
        const keysToRemove = [
          `pomodoro-stats-${user.id}`,
          `pomodoro-state-${user.id}`,
          `pomodoro-settings-${user.id}`,
          `pomodoro-historical-stats-${user.id}`
        ];
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
        });
      }
      
      // También limpiar claves generales por si acaso
      ['pomodoro-stats', 'pomodoro-state', 'pomodoro-settings', 'pomodoro-historical-stats'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error en logout:', error);
        throw new Error(error.message);
      }
      
      console.log('Usuario deslogueado exitosamente');
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
