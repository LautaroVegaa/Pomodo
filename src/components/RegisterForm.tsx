
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, isLoading } = useAuth();

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('al menos 8 caracteres');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('una letra minúscula');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('una letra mayúscula');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('un número');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(`La contraseña debe contener ${passwordErrors.join(', ')}`);
      return;
    }

    try {
      await register(email, password, name);
      setSuccess('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta.');
    } catch (error: any) {
      console.error('Error en registro:', error);
      // Handle different types of registration errors
      if (error.message.includes('User already registered')) {
        setError('Este email ya está registrado. Intenta iniciar sesión');
      } else if (error.message.includes('Invalid email')) {
        setError('Por favor ingresa un email válido');
      } else if (error.message.includes('Password should be at least')) {
        setError('La contraseña debe tener al menos 8 caracteres');
      } else {
        setError(error.message || 'Error al crear la cuenta. Intenta de nuevo');
      }
    }
  };

  const passwordErrors = password ? validatePassword(password) : [];

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-800 dark:text-white">
          Crear Cuenta
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-300">
          Únete a Pomodō
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="dark:text-white text-base">Nombre</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
                autoComplete="name"
                autoCapitalize="words"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="email" className="dark:text-white text-base">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                inputMode="email"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="password" className="dark:text-white text-base">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1 touch-manipulation"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {password && passwordErrors.length > 0 && (
              <div className="text-xs text-orange-500 dark:text-orange-400">
                La contraseña debe contener: {passwordErrors.join(', ')}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirmPassword" className="dark:text-white text-base">Confirmar Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-12 pr-12 text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1 touch-manipulation"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded">
              {success}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-base touch-manipulation"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta'
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-blue-500 hover:text-blue-600 text-base underline dark:text-blue-400 touch-manipulation p-2"
              disabled={isLoading}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
