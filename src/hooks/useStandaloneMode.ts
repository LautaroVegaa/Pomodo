import { useEffect, useState } from 'react';

export const useStandaloneMode = () => {
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar si la app está en modo standalone en iOS
    const isIOSStandalone = () => {
      // Detectar iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      
      // Detectar modo standalone
      const isStandalone = (window.navigator as any).standalone === true || 
        window.matchMedia('(display-mode: standalone)').matches;

      return isIOS && isStandalone;
    };

    setIsStandalone(isIOSStandalone());

    // Escuchar cambios en el modo de visualización
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(isIOSStandalone());
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isStandalone;
}; 