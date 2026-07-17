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

### Mise en place (une fois — Félix ou Pierre)

1. Créer un compte **Cloudflare** gratuit (e-mail seulement, pas de carte bancaire).
2. Dans le dossier `server/` du repo :
   ```bash
   cd server
   npm install
   npx wrangler login       # ouvre le navigateur, autoriser
   npx wrangler deploy      # publie le Worker
   ```
   La commande affiche l'URL publique, de la forme
   `https://tempo-rooms.<compte>.workers.dev`.
3. Communiquer cette URL au build de l'app : dans GitHub → *Settings → Secrets and
   variables → Actions → Variables* (droits admin), créer la **variable de repo**
   `TEMPO_SYNC_URL` avec cette URL. Relancer le déploiement Pages (*Actions → Run workflow*).
   → Le bouton de synchro de l'app utilise alors ce serveur par défaut, sans rien demander
   aux utilisateurs.
4. Tant que la variable n'existe pas, l'app garde le comportement précédent : champ « URL du
   serveur » à renseigner manuellement (l'ancien WordPress continue de fonctionner pendant la
   transition).

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
4. **Variable `TEMPO_SYNC_URL`** : voir « Serveur de salons » ci-dessus (étape 3).
5. **Recommandé — gouvernance à deux** : soit donner le rôle **Admin** à `Namsara`
   (*Settings → Collaborators*), soit créer une **organisation GitHub** commune et y transférer
   le repo (*Settings → Danger Zone → Transfer*). Évite que chaque réglage repasse par une
   seule personne.
6. **Après la bascule synchro** : désinstaller le plugin WordPress (voir ci-dessus).

## Dépannage rapide

- **La démo ne reflète pas le dernier merge** : onglet *Actions* → le workflow a-t-il échoué ?
  L'erreur la plus fréquente est une erreur TypeScript (le build la bloque volontairement).
- **La synchro ne marche pas** : vérifier que `TEMPO_SYNC_URL` existe (variable de repo) et que
  `npx wrangler deploy` a bien été fait ; l'app dégrade proprement en mode local sinon.
- **Rollback** : *revert* du commit fautif sur `main` (bouton *Revert* de la PR) → redéploiement
  automatique de la version précédente.
