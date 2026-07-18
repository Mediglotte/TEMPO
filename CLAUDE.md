# TEMPO — partition d'urgence (polytraumatisé)

Prototype cliquable : le parcours d'un **traumatisé sévère** visualisé comme une **partition à 3 pistes**
(Régulation / Pré-hospitalier / Intra-hospitalier) sur une **timeline commune**, façon Songsterr.
Une action renseignée par une équipe débloque / fait clignoter des actions ailleurs.

## ⚠️ Cadre (à respecter)
Démonstration à **données fictives** — **aucun champ patient**, aucune donnée réelle. Le contenu clinique
(actions, seuils, mappings) est à **valider par le médecin référent** : ne pas inventer ni durcir de seuils
cliniques sans validation. C'est un outil pédagogique, pas un dispositif médical.

## Stack
Vite 5 · React 18 · TypeScript (**strict**) · Tailwind · Zustand (state) · framer-motion · jsPDF · lz-string.

## Commandes
```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # tsc --noEmit && vite build
npm run build:single   # node scripts/build-single.mjs → partition-urgence.html autonome (baladable par mail)
npm test               # vitest run   (npm run test:watch pour le mode watch)
```
TypeScript strict (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) : garder le build `tsc` vert.

## Déploiement
GitHub Pages : chaque push sur `main` déclenche `.github/workflows/deploy.yml` → https://pierre-balaz.github.io/TEMPO/.
Voir `docs/DEPLOYMENT.md` pour le détail (Pages, serveur de synchro, runbook admin).

## Architecture (piloté par la config)
- `src/config/protocols/polytrauma/` — **le contenu clinique**, séparé du moteur :
  - `actions.ts` (actions par piste, dont ACSOS) · `rules.ts` (déclencheurs → effets) · `tracks.ts` · `clinical.ts` (scores : Vittel, ABC…) · `burns.ts` (Wallace) · `voice.ts` (vocabulaire de dictée) · `sources.ts` (bibliographie) · `index.ts`.
- `src/config/validate.ts` — **validateur exécuté en dev** : signale toute cible/condition orpheline dans les règles avant qu'un bug silencieux ne passe en démo. **Le lancer/mettre à jour** quand on touche `actions`/`rules`.
- `src/engine/` — moteur pur : `evaluate.ts`, `conditions.ts`, `effects.ts`, `computed.ts` (+ `evaluate.test.ts`).
- `src/store/` — Zustand : `caseStore`, `uiStore` (rôle actif), `playerStore`, `selectors`.
- `src/share/` — partage d'état par URL (`urlState.ts` via lz-string, sans backend) + `persistence.ts`.
- `src/sync/` — synchro multi-postes « salle commune » : `roomSync.ts` (HTTP), `useRoomSync.ts` (polling), `merge.ts` (fusion LWW par `completedAt`).
- `src/voice/` — dictée vocale : `parser.ts`, `speech.ts`, `frenchNumbers.ts`, `useVoiceDictation.ts`.
- `src/components/` — UI (ScoreBoard, TrackLane, ActionCell, Gauge, Stopwatch, SyncControl, ShareBar…).
- `src/lib/` — `protocol.ts` (index), `case.ts`, `pdf.ts`, `timeline.ts`, `recap.ts`, `codename.ts`, `theme.ts`, `icons.ts`.

## Conventions
- **Ajouter un déclencheur** = un objet dans `config/protocols/polytrauma/rules.ts` ; **ajouter une action** = un objet dans `actions.ts`. Le validateur signale les cibles orphelines.
- Garder la **séparation contenu (`config/`) ↔ moteur (`engine/`)** : pas de logique clinique en dur dans le moteur ni dans les composants.
- Écrire un test vitest pour toute évolution du moteur (`engine/*.test.ts`).

## Flux de travail
Branche + **PR** (reviews code et sécurité automatiques). Ne pas committer directement sur `main`.
Chaque merge sur `main` part en production (GitHub Pages) : gate local avant merge —
`npm run build && npm test && npm run build:single`.
