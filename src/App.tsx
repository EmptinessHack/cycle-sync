import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivyDemoProvider } from './contexts/PrivyDemoContext';
import { DemoAuthProvider } from './contexts/DemoAuthContext';
import { privyConfig } from './config/privy';
import ErrorBoundary from './components/ErrorBoundary';

import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Today from "./pages/Today";
import WeeklySchedule from "./pages/WeeklySchedule";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import TestEncryption from "./pages/TestEncryption";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

// Componente wrapper para manejar Privy con o sin App ID
const AppContent = () => {
  const hasPrivyAppId = privyConfig.appId && privyConfig.appId.trim() !== '';

  if (!hasPrivyAppId) {
    console.warn('⚠️ Privy App ID no configurado. La aplicación funcionará en modo demo.');
    console.warn('Para habilitar autenticación real, configura VITE_PRIVY_APP_ID en tu archivo .env');
  }

  const appContent = (
    <DemoAuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/setup"
              element={
                <ProtectedRoute>
                  <Setup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/today"
              element={
                <ProtectedRoute>
                  <Today />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weekly-schedule"
              element={
                <ProtectedRoute>
                  <WeeklySchedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-encryption"
              element={<TestEncryption />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ThemeProvider>
    </DemoAuthProvider>
  );

  // Siempre usar PrivyDemoProvider y PrivyProvider
  // PrivyProvider siempre está presente (incluso con appId inválido) para que usePrivy() funcione
  // PrivyDemoProvider proporciona valores demo como fallback
  const appId = hasPrivyAppId ? privyConfig.appId : 'cl00000000000000000000000'; // App ID de demo que no rompe
  
  return (
    <PrivyDemoProvider>
      <PrivyProvider
        appId={appId}
        config={privyConfig.config}
      >
        {appContent}
      </PrivyProvider>
    </PrivyDemoProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
