import { useEffect, useRef } from 'react';

export const useIOSStandalone = (inputRef: React.RefObject<HTMLInputElement>) => {
  const isIOSStandalone = typeof window !== 'undefined' && 
    window.navigator.standalone === true;

  const hasUserInteracted = useRef(false);

  useEffect(() => {
    if (!isIOSStandalone) return;

    const handleFirstTouch = () => {
      if (!hasUserInteracted.current && inputRef.current) {
        hasUserInteracted.current = true;
        // Pequeño delay para asegurar que el teclado se abra correctamente
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    };

    document.addEventListener('touchstart', handleFirstTouch, { once: true });

    return () => {
      document.removeEventListener('touchstart', handleFirstTouch);
    };
  }, [isIOSStandalone]);

  return { isIOSStandalone };
}; 