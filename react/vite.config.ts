import react from '@vitejs/plugin-react-swc';
import { join } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': join(__dirname, './src'),
    },
  },
});
