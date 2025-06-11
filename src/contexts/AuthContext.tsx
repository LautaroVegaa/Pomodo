
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
    // Configurar listener de cambios de autenticación primero
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Refrescar la página en caso de login/logout para asegurar sincronización
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          // Pequeño delay para permitir que el estado se actualice
          setTimeout(() => {
            if (event === 'SIGNED_OUT') {
              // Limpiar todo el localStorage al hacer logout
              Object.keys(localStorage).forEach(key => {
                if (key.startsWith('pomodoro-') || key.startsWith('user-')) {
                  localStorage.removeItem(key);
                }
              });
            }
          }, 100);
        }
      }
    );

    // Luego verificar sesión existente
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error);
        } else {
          console.log('Initial session check:', session?.user?.email || 'No session');
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in session check:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    return () => subscription.unsubscribe();
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
