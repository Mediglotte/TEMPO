import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// SINGLEFILE=1 npm run build  → produit un dist/index.html 100% autonome,
// baladable par mail / ouvrable hors-ligne. Sinon build statique classique.
const singleFile = process.env.SINGLEFILE === '1'

export default defineConfig({
  // base relative => fonctionne aussi bien sur Vercel/Netlify que sur GitHub Pages
  base: './',
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
})
