import { useEffect, useRef } from 'react';

export const useIOSStandalone = (inputRef: React.RefObject<HTMLInputElement>) => {
  const isIOSStandalone = typeof window !== 'undefined' && 
    window.navigator.standalone === true;

  useEffect(() => {
    if (!isIOSStandalone || !inputRef.current) return;

    const handleFirstTouch = () => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // Remover el listener después del primer uso
      document.removeEventListener('touchstart', handleFirstTouch);
    };

    document.addEventListener('touchstart', handleFirstTouch);

    return () => {
      document.removeEventListener('touchstart', handleFirstTouch);
    };
  }, [isIOSStandalone]);

  return { isIOSStandalone };
}; 