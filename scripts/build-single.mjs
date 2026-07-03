// Build « fichier unique » multi-plateforme (Windows / macOS / Linux).
// Remplace l'ancienne commande shell `SINGLEFILE=1 vite build && cp ...`
// qui ne fonctionnait pas sous Windows (syntaxe Unix).
import { build } from 'vite'
import { copyFileSync, existsSync } from 'node:fs'

process.env.SINGLEFILE = '1' // active vite-plugin-singlefile (voir vite.config.ts)

await build()

const src = 'dist/index.html'
const out = 'partition-urgence.html'
if (!existsSync(src)) {
  console.error(`\n❌ ${src} introuvable — le build a-t-il réussi ?`)
  process.exit(1)
}
copyFileSync(src, out)
console.log(`\n✅ Fichier autonome prêt à envoyer : ${out}`)
