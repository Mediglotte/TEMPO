# Opportunités d'animation — audit /find-animation-opportunities

> Passe en lecture seule (2026-07-18) : aucune implémentation, uniquement des recettes précises.
> Posture : **retenue**. TEMPO est un outil clinique dense — l'essentiel de l'interface ne doit
> **pas** bouger. Vocabulaire existant à étendre (pas de lib motion, transitions CSS pures) :
> `cubic-bezier(0.2, 0, 0, 1)` (cross-fade ShareBar), `duration-150/200/300`, `ease-out`,
> `active:scale-[0.96]`, `animate-blink` (alerte clinique, ne pas toucher).

## 1. Opportunités (par levier décroissant)

| # | Emplacement | Aujourd'hui | But | Fréquence | Motion proposée |
| --- | --- | --- | --- | --- | --- |
| 1 | `ActionDetailPanel.tsx:50-51` | Le panneau latéral (et son overlay) apparaît/disparaît instantanément | Cohérence spatiale + éviter le saut | Occasionnelle | Entrée via `@starting-style` : aside `opacity: 0; transform: translateX(24px)` → repos, `transition: opacity 200ms, transform 220ms cubic-bezier(0.2,0,0,1)` ; overlay `opacity: 0 → 1` en 150ms. Sortie instantanée assumée (unmount React) — ne pas ajouter d'état pour l'animer. `prefers-reduced-motion` : garder le fondu, supprimer le translate |
| 2 | `RecapButton.tsx:50-51` | La modale Récap surgit sans transition | Éviter le saut | Occasionnelle | `@starting-style` sur la carte : `opacity: 0; transform: scale(0.97)` → `scale(1)`, `transition: 200ms cubic-bezier(0.2,0,0,1)` (jamais `scale(0)`) ; overlay fondu 150ms. Modale centrée : pas de `transform-origin` vers le déclencheur |
| 3 | `ShareBar.tsx:39,95-98` | « Réinitialiser » **efface tout le cas** sur un simple clic, sans confirmation | Feedback (prévention de faux geste) | Rare | Hold-to-confirm : calque `clip-path: inset(0 100% 0 0)` en `bg-rose-600/80`, remplissage `clip-path 2s linear` pendant le press (pointerdown), retour `200ms cubic-bezier(0.2,0,0,1)` au relâchement ; déclenche `onReset` seulement à 100 %. Libellé pendant le press : « Maintenir pour effacer ». Alternative sans motion : `window.confirm` — mais le hold évite la boîte de dialogue |
| 4 | `RoleGate.tsx:16-20` | L'écran de choix de rôle (premier contact avec l'app) apparaît d'un bloc | Budget délice (premier lancement) | Rare / première fois | Carte : `opacity: 0; transform: scale(0.97) translateY(8px)` → repos en `240ms cubic-bezier(0.2,0,0,1)` via `@starting-style` ; les 4 cartes de rôle en cascade `transition-delay` 40ms/60ms/80ms/100ms (fondu seul, jamais bloquant — les boutons restent cliquables immédiatement). `prefers-reduced-motion` : fondu simple sans translate ni cascade |
| 5 | `SyncControl.tsx:114` | Le bloc réglages serveur (`showSettings`) claque à l'ouverture | Éviter le saut | Occasionnelle | `@starting-style` : `opacity: 0; transform: translateY(-4px)` → repos, `transition: 150ms cubic-bezier(0.2,0,0,1)`. Fermeture instantanée assumée |

Notes transverses : `@starting-style` est Baseline 2024 (déjà cohérent avec l'usage d'`oklch`) ;
sans support, les surfaces apparaissent simplement — dégradation propre, zéro JS ajouté.
Chaque recette n'anime que `transform`/`opacity` (+ `clip-path` pour le hold-to-confirm).

## 2. Candidats rejetés (volontairement)

- `Stopwatch.tsx:55` — chiffres du chrono géant (tick chaque seconde). **Rejet : donnée fonctionnelle lue en continu, fréquence maximale — ne jamais animer.**
- `TrackLane.tsx:74-100` + « Tout réduire » (`App.tsx`) — repli/dépli des pistes. **Rejet : animation de layout sur la zone de données dense que l'utilisateur manipule ; le coût (reflow, lisibilité) dépasse le bénéfice.**
- `ScoreBoard.tsx` — entrée en cascade des lanes/cellules au chargement. **Rejet : UI fonctionnelle rechargée souvent (liens partagés) ; la cascade retarde la lecture.**
- `GuidedPlayer.tsx:148,188` — bascules Play/Pause et boutons de vitesse. **Rejet : toggles fréquents pendant la démo ; l'instantané est l'optimum (le cross-fade y serait du bruit).**
- `BurnBodyMap.tsx:47` — compteur animé du total SCB (« count-up »). **Rejet : valeur clinique que l'utilisateur lit pour agir ; les zones ont déjà leur transition fill/stroke 150ms, suffisant.**

## 3. Verdict

TEMPO a besoin de **très peu** de motion supplémentaire — les passes précédentes (transitions de
couleurs, cross-fade du bouton copier, `active:scale`, rotation des chevrons) couvrent déjà le
feedback quotidien, et le clignotement d'alerte reste le seul motion « fort » légitime de la
timeline. Les cinq propositions ci-dessus comblent les dernières coutures : trois surfaces qui se
téléportent, un écran d'accueil plat, et surtout **le n° 3 (hold-to-confirm sur « Réinitialiser »)**,
qui est le plus fort levier — c'est autant une protection contre la perte de données qu'une
animation. Pour implémenter une ligne : `improve-animations plan <description de la ligne>`.
