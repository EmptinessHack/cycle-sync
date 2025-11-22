import { PrivyClientConfig } from '@privy-io/react-auth';

// IMPORTANT: Get your Privy App ID from https://privy.io
// For now, we'll use a demo mode if no valid App ID is provided
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

export const privyConfig = {
  appId: PRIVY_APP_ID,
  config: {
    loginMethods: ['email'],
    appearance: {
      theme: 'light',
      accentColor: '#16697A',
    },
  } as PrivyClientConfig,
};
