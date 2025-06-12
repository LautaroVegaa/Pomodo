import React from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PomodoroTimerProvider } from "@/contexts/PomodoroTimerContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapper para obtener el userId autenticado y proveer el contexto global del temporizador
const PomodoroProviderWrapper: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <>{children}</>; // Si no está autenticado, no proveer el contexto
  return (
    <PomodoroTimerProvider userId={user.id}>
      {children}
    </PomodoroTimerProvider>
  );
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <PomodoroProviderWrapper>
              <TooltipProvider>
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Sonner />
                </BrowserRouter>
              </TooltipProvider>
            </PomodoroProviderWrapper>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
