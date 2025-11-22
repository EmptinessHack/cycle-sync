import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID || 'clxxxxxxxxxxxxxx', // Replace with your Privy App ID
  config: {
    loginMethods: ['email'],
    appearance: {
      theme: 'light',
      accentColor: '#16697A',
    },
  } as PrivyClientConfig,
};
