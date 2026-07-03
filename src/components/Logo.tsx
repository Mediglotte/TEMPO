/**
 * Marque « Partition d'urgence » : une portée dont les trois têtes de notes
 * représentent les trois phases (régulation, SMUR, hôpital). Version compacte
 * (sans glyphes internes, illisibles en petit) pour l'en-tête ; le logo détaillé
 * avec casque / ambulance / H est dans public/logo.svg et les icônes d'accueil.
 */
export function Logo({ size = 34, className }: { size?: number; className?: string }) {
  const lines = [22.8, 27.4, 32, 36.6, 41.2]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Partition d'urgence"
    >
      <rect x="0" y="0" width="64" height="64" rx="13" fill="#e11d48" />
      {lines.map((y, i) => (
        <line
          key={i}
          x1="9"
          y1={y}
          x2="55"
          y2={y}
          stroke="#ffffff"
          strokeWidth="1.3"
          strokeLinecap="round"
          opacity="0.9"
        />
      ))}
      <polygon points="16,15.9 50,18.2 50,21 16,18.7" fill="#ffffff" />
      <rect x="18.4" y="16" width="1.4" height="14.2" fill="#ffffff" />
      <rect x="32.4" y="17" width="1.4" height="18.2" fill="#ffffff" />
      <rect x="45.4" y="18.2" width="1.4" height="21.4" fill="#ffffff" />
      <circle cx="19" cy="30.2" r="5.2" fill="#ffffff" />
      <circle cx="33" cy="35.2" r="5.2" fill="#ffffff" />
      <circle cx="46" cy="39.6" r="5.2" fill="#ffffff" />
    </svg>
  )
}
