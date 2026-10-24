import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// The wordmark and the chapter titles are set in Cormorant Garamond 500
// italic, and the wordmark is the largest thing on the first screen. Telling
// the browser to fetch that one font file straight away lets it appear about
// as soon as the page does, instead of after the stylesheet is read.
function preloadDisplayFont(): Plugin {
  return {
    name: 'preload-display-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const file = Object.keys(ctx.bundle ?? {}).find((n) => /cormorant-garamond-latin-500-italic-[^/]+\.woff2$/.test(n))
        if (!file) return html
        return html.replace(
          '</head>',
          `  <link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin />\n  </head>`,
        )
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadDisplayFont()],
  // The real limit is the first-visit total, checked by scripts/check-budget.mjs.
  build: { chunkSizeWarningLimit: 540 },
  // PostCSS settings live here instead of a separate postcss.config.js.
  css: {
    postcss: {
      plugins: [tailwindcss(), autoprefixer()],
    },
  },
})
