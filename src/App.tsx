import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from 'wagmi';
import { privyConfig } from './config/privy';
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

const App = () => (
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

export default App;
