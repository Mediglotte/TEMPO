import markUrl from '../assets/tempo-mark.png'

// 480×163 : recadrage du motif seul dans assets/tempo-logo-v2.png (sans le
// mot « TEMPO », déjà porté en texte par l'en-tête — d'où l'alt vide).
const RATIO = 480 / 163

/**
 * Marque « TEMPO » (partition d'urgence) : des lignes qui convergent en une
 * timeline commune, ponctuée de trois jalons (régulation, SMUR, hôpital) et
 * fléchée vers l'avant. Le logo complet avec le mot-symbole est dans
 * assets/tempo-logo-v2.png (affiché sur l'écran de choix de rôle).
 */
export function Logo({ size = 34, className }: { size?: number; className?: string }) {
  return (
    <img
      src={markUrl}
      alt=""
      draggable={false}
      width={Math.round(size * RATIO)}
      height={size}
      className={className}
    />
  )
}
