
import * as React from "react"
import { useStandaloneMode } from "@/hooks/useStandaloneMode"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, autoFocus, onFocus, onTouchStart, ...props }, ref) => {
    const isStandalone = useStandaloneMode();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = (node: HTMLInputElement) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Improved touch handling for iOS standalone
    const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
      e.preventDefault();
      
      // For iOS standalone, use a small delay to ensure proper focus
      if (isStandalone) {
        setTimeout(() => {
          e.currentTarget.focus();
        }, 100);
      } else {
        e.currentTarget.focus();
      }
      
      // Call original onTouchStart if provided
      if (onTouchStart) {
        onTouchStart(e);
      }
    };

    // Improved focus handling for iOS
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Scroll to top to prevent zoom issues on iOS
      if (isStandalone || /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        window.scrollTo(0, 0);
      }
      
      // Call original onFocus if provided
      if (onFocus) {
        onFocus(e);
      }
    };

    React.useEffect(() => {
      if (autoFocus && inputRef.current && !isStandalone) {
        inputRef.current.focus();
      }
    }, [autoFocus, isStandalone]);

    return (
      <input
        type={type === 'email' ? 'text' : type}
        className={cn(
          "flex h-14 w-full rounded-md border border-input bg-background px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          "md:h-12 md:text-sm",
          "active:scale-[0.98] transition-transform duration-100",
          "cursor-text appearance-none",
          "tap-highlight-transparent",
          className
        )}
        ref={combinedRef}
        enterKeyHint={type === 'password' ? 'go' : 'next'}
        inputMode={type === 'email' ? 'email' : type === 'password' ? 'text' : 'text'}
        readOnly={false}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : undefined}
        autoCorrect="off"
        autoCapitalize={type === 'email' ? 'none' : 'sentences'}
        spellCheck={false}
        onTouchStart={handleTouchStart}
        onFocus={handleFocus}
        style={{
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitUserSelect: 'text',
          fontSize: '16px' // Critical for iOS to prevent zoom
        }}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
