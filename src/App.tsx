import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { PRIVY_APP_ID, privyConfig } from './config/privy';
import { wagmiConfig } from './config/wagmi';
import { ThemeProvider } from './contexts/ThemeContext';

import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Today from "./pages/Today";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // If no Privy App ID is configured, show setup instructions
  if (!PRIVY_APP_ID) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: 'Poppins, sans-serif',
        background: 'linear-gradient(135deg, #82C0CC 0%, #16697A 100%)'
      }}>
        <div style={{
          maxWidth: '500px',
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#16697A' }}>
            CYRA Setup Required
          </h1>
          <p style={{ marginBottom: '1rem', color: '#171717' }}>
            To use CYRA, you need to configure Privy authentication:
          </p>
          <ol style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem', color: '#171717' }}>
            <li>Sign up at <a href="https://privy.io" target="_blank" rel="noopener noreferrer" style={{ color: '#16697A' }}>privy.io</a></li>
            <li>Create a new app and get your App ID</li>
            <li>Add it to <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>src/config/privy.ts</code></li>
          </ol>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            Or set the <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>VITE_PRIVY_APP_ID</code> environment variable
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider appId={privyConfig.appId} config={privyConfig.config}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <ThemeProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/today" element={<Today />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default App;
