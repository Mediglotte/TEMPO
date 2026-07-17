# Déploiement & administration — TEMPO

Ce document décrit **où tourne TEMPO**, comment le faire évoluer, et les quelques actions
d'administration qui nécessitent les droits **admin** du repo (Pierre / compte `Mediglotte`).

## Vue d'ensemble

| Brique | Où | Comment |
|---|---|---|
| **Application** (SPA statique) | GitHub Pages — https://mediglotte.github.io/TEMPO/ | Auto : chaque push/merge sur `main` déclenche [`deploy.yml`](../.github/workflows/deploy.yml) (build Vite puis publication). Rien à faire. |
| **Serveur de salons** (synchro salle commune) | Cloudflare Workers (gratuit) | Dossier [`server/`](../server/) du repo — voir « Serveur de salons » ci-dessous. |
| **Fichier autonome** (hors-ligne / e-mail) | Nulle part — généré à la demande | `npm run build:single` → `partition-urgence.html` à envoyer. |

Aucune donnée patient : l'app est 100 % côté client, l'état vit dans le navigateur
(et dans l'URL pour les liens de partage — le « hash » `#s=…` n'atteint jamais un serveur).
Les salons de synchro sont éphémères (12 h) et ne contiennent que des cas fictifs.

## GitHub Pages (application)

- **Déclencheur** : push sur `main` (ou bouton *Run workflow* dans l'onglet Actions).
- **Ce qui tourne** : `npm ci` → `npm run build` (le build inclut `tsc --noEmit` : une erreur
  TypeScript **bloque** le déploiement — c'est voulu) → publication de `dist/`.
- **Vérifier un déploiement** : onglet *Actions* → workflow « Déploiement GitHub Pages » vert,
  puis ouvrir l'URL de démo dans une fenêtre privée.
- Pas d'URL de préversion par PR sur Pages : pour tester une branche, `npm run dev` en local.

## Serveur de salons (synchro « salle commune »)

Historique : la première version de la synchro passait par un mini-plugin WordPress
(`tempo-sync.php`) installé sur un hébergement personnel. Il est remplacé par un
**Cloudflare Worker + Durable Object** (gratuit, toujours actif, données épinglables en
juridiction UE), **même API** (`GET/POST /room/:code`), code versionné dans [`server/`](../server/).

### État : déjà déployé

Le Worker est en ligne : **`https://tempo-rooms.felix-amiot.workers.dev`** (compte Cloudflare de
Félix). Cette URL est **intégrée par défaut dans l'app** (`SyncControl.tsx`) : la synchro
fonctionne sur le site déployé sans aucun réglage supplémentaire.

### Redéployer / mettre à jour le Worker (si `server/` change)

```bash
cd server
npm install
npx wrangler login       # une fois : ouvre le navigateur, cliquer « Allow »
npx wrangler deploy      # publie ; réaffiche l'URL
```

### Déplacer le Worker vers un autre compte (optionnel)

Si le serveur doit changer d'URL (autre compte Cloudflare, domaine dédié…) : ou bien remplacer la
constante `BUILTIN_SERVER` dans `src/components/SyncControl.tsx`, ou bien — sans toucher au code —
créer une **variable de repo** `TEMPO_SYNC_URL` (GitHub → *Settings → Secrets and variables →
Actions → Variables*, droits admin) avec la nouvelle URL : `deploy.yml` l'injecte au build et elle
prime sur la valeur intégrée. Relancer alors le déploiement Pages (*Actions → Run workflow*).

### Après bascule

- Tester : ouvrir la démo sur **deux machines** (ou un ordi + un téléphone en 4G), activer la
  synchro des deux côtés → cocher une action d'un côté, elle apparaît de l'autre en ≤ 2 s.
- **Désinstaller le plugin WordPress** `tempo-sync.php` de l'hébergement personnel de Pierre
  (extensions WordPress → désactiver puis supprimer). Il n'a plus de raison d'exister — c'était
  un point de fragilité (endpoint sans authentification sur un hébergement perso).

## Runbook admin (Pierre — compte Mediglotte, 10 min)

Ces actions demandent les droits **admin** du repo ; Félix (`Namsara`) n'a que *push*.

1. **Description & page d'accueil du repo** (la description actuelle a perdu ses accents) —
   dans un terminal avec [gh](https://cli.github.com) connecté au compte Mediglotte :
   ```bash
   gh repo edit Mediglotte/TEMPO \
     --description "TEMPO — partition d'urgence : parcours du traumatisé sévère (démo pédagogique, données fictives)" \
     --homepage "https://mediglotte.github.io/TEMPO/" \
     --add-topic urgences --add-topic medical-education --add-topic react --add-topic vite
   ```
   (ou via l'interface web : page du repo → ⚙️ à droite de *About*.)
2. **Protection de la branche `main`** (gratuit sur repo public) : *Settings → Branches →
   Add branch ruleset* → cible `main`, cocher **Require a pull request before merging** et
   **Block force pushes**. Pas de « required status checks » pour l'instant.
3. **Activer les reviews Claude sur les PRs** : *Settings → Secrets and variables → Actions →
   New repository secret* → nom `CLAUDE_CODE_OAUTH_TOKEN`, valeur fournie par Félix (token de
   l'abonnement Claude). Sans ce secret, les 3 workflows de review restent silencieux.
4. **Recommandé — gouvernance à deux** : soit donner le rôle **Admin** à `Namsara`
   (*Settings → Collaborators*), soit créer une **organisation GitHub** commune et y transférer
   le repo (*Settings → Danger Zone → Transfer*). Évite que chaque réglage repasse par une
   seule personne.
5. **Après confirmation de la synchro Cloudflare** : désinstaller le plugin WordPress
   `tempo-sync.php` de l'hébergement personnel (il n'a plus de rôle).

> La synchro « salle commune » ne demande **aucune** action admin : l'URL du Worker est intégrée
> à l'app. La variable `TEMPO_SYNC_URL` n'est utile que pour pointer un autre serveur (voir
> « Déplacer le Worker » ci-dessus).

## Dépannage rapide

- **La démo ne reflète pas le dernier merge** : onglet *Actions* → le workflow a-t-il échoué ?
  L'erreur la plus fréquente est une erreur TypeScript (le build la bloque volontairement).
- **La synchro ne marche pas** : vérifier que `TEMPO_SYNC_URL` existe (variable de repo) et que
  `npx wrangler deploy` a bien été fait ; l'app dégrade proprement en mode local sinon.
- **Rollback** : *revert* du commit fautif sur `main` (bouton *Revert* de la PR) → redéploiement
  automatique de la version précédente.
