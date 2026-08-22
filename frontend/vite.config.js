// frontend/vite.config.js
// Vite build/dev-server configuration. Adds the React plugin (JSX support,
// fast refresh) and the Tailwind CSS plugin (so `@import "tailwindcss"` in
// index.css is processed).
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
    ],

})
