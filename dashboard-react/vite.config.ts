import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: './', // relative paths so the build also works on GitHub Pages, Netlify or Vercel
  plugins: [react(), tailwindcss()],
});
