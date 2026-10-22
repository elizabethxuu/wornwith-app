import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // PostCSS settings live here instead of a separate postcss.config.js.
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
