import * as React from "react"
import { useStandaloneMode } from "@/hooks/useStandaloneMode"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, autoFocus, ...props }, ref) => {
    const isStandalone = useStandaloneMode();
    const inputRef = React.useRef<HTMLInputElement>(null);
    const combinedRef = (node: HTMLInputElement) => {
      // Asignar ambas referencias
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    React.useEffect(() => {
      // Si es un campo de email y NO está en modo standalone, aplicar el autofocus
      if (type === 'email' && !isStandalone && autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [type, isStandalone, autoFocus]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
          "md:h-10 md:text-sm",
          "active:scale-[0.98] transition-transform duration-100",
          "cursor-text",
          className
        )}
        ref={ref}
        enterKeyHint="done"
        inputMode={type === 'email' ? 'email' : type === 'password' ? 'text' : undefined}
        readOnly={false}
        autoComplete={type === 'password' ? 'current-password' : type === 'email' ? 'email' : undefined}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
