import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { activeProtocol } from './config'
import { validateProtocol } from './config/validate'

// Garde-fou dev : signale les cibles de règles orphelines avant la démo.
if (import.meta.env.DEV) {
  const errors = validateProtocol(activeProtocol)
  if (errors.length) {
    console.warn('[config] Problèmes détectés dans le protocole :\n' + errors.join('\n'))
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
