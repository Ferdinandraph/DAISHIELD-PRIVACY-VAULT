import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ethers: 'ethers',
    },
  },
  optimizeDeps: {
    include: ['ethers', 'wagmi'],
  },
  css: {
    postcss: './postcss.config.js',
  },
  
  server: {
    port: 5173,
  }
});