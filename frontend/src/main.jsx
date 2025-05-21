import React from 'react';
import ReactDOM from 'react-dom/client';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { injected } from '@wagmi/core';
import { sepolia } from 'wagmi/chains';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

// wagmi config
const wagmiConfig = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org'),
  },
  autoConnect: false,
});

console.log('Wagmi Config:', {
  chains: wagmiConfig.chains.map((chain) => ({
    id: chain.id,
    name: chain.name,
  })),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchInterval: 10_000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);