# Propositions d'évolution du contenu clinique — à valider

Document de travail pour **Pierre** et le **médecin référent**. Rien de ce qui suit n'est
implémenté sans validation : conformément au cadre du projet (données fictives, outil
pédagogique), **aucun seuil clinique n'est inventé ni durci** par les développements techniques.

État des lieux : les jauges ACSOS existent (`src/config/protocols/polytrauma/actions.ts`,
action `prehosp.acsos`) et signalent visuellement les valeurs hors zone. Un chantier technique
les branche sur le moteur de règles **en réutilisant les seuils déjà déclarés** (aucune valeur
nouvelle). Les propositions ci-dessous demandent, elles, un arbitrage clinique.

## 1. PAM : une seule saisie, un objectif contextuel

**Aujourd'hui** : deux champs indépendants pour la même mesure —
`pam-tc` « objectif TC » (rouge < 90 mmHg) et `pam-hemo` « objectif hémorragie »
(rouge < 55 mmHg). L'utilisateur saisit la PAM deux fois et les deux jauges peuvent se
contredire.

**Proposition** : un seul champ « PA moyenne », dont le seuil d'alerte dépend du contexte
déjà connu du cas (TC suspecté / hémorragie active — par ex. piloté par le grade ou par une
case « TC »). Question au référent : quel critère du cas doit sélectionner l'objectif,
et quel objectif si les deux contextes coexistent (TC **et** choc hémorragique) ?

## 2. Natrémie chiffrée

**Aujourd'hui** : simple case à cocher « Hyponatrémie » — asymétrique avec les autres ACSOS
qui sont des valeurs chiffrées à jauge, et l'hypernatrémie n'est pas représentable.

**Proposition** : champ numérique « Natrémie » (mmol/L) avec zone normale à définir par le
référent (classiquement 135–145 mmol/L — **à confirmer**), remplaçant la case à cocher.

## 3. Seuil d'alerte de la glycémie

**Aujourd'hui** : jauge 2–20 mmol/L, zone normale **4,4–6,1 mmol/L** — toute glycémie
> 6,1 passe en rouge, ce qui marque comme « insulte » une hyperglycémie de stress banale
en traumatologie.

**Proposition** : garder la borne basse (hypoglycémie) stricte, mais remonter la borne
d'alerte haute au seuil considéré comme agressif pour le cerveau lésé (souvent ~10 mmol/L
dans la littérature ACSOS — **valeur à fixer par le référent**).

## 4. PIC / PPC en intra-hospitalier

**Aujourd'hui** : aucun monitorage de pression intracrânienne ni de pression de perfusion
cérébrale dans la piste intra-hospitalière ; l'osmothérapie existe comme geste isolé.

**Proposition** : ajouter en intra-hospitalier (réa/déchocage) des champs PIC et PPC avec
objectifs (classiquement PIC < 20–22 mmHg, PPC 60–70 mmHg — **à valider**), et relier
l'osmothérapie à ces valeurs.

## 5. Mappage « insulte → geste correcteur »

Le moteur de règles sait faire clignoter/surligner une action quand une condition est
remplie. Une fois les jauges branchées, on peut aller plus loin : quand une valeur sort de
la zone, **surligner le geste correcteur** correspondant. Table proposée, à valider ligne à
ligne :

| Insulte détectée | Geste(s) à mettre en avant |
|---|---|
| SpO₂ < 90 % | Oxygénation / contrôle des voies aériennes (IOT si GCS ≤ 8) |
| PAM sous l'objectif | Remplissage / vasopresseur |
| Hypo/hypercapnie | Réglage ventilation (FR, Vt) |
| Température < 36 °C | Réchauffement (lutte contre la triade létale) |
| Hypoglycémie | Resucrage |
| Anémie (Hcue bas) | Transfusion / accélérer l'accès au sang |

## 6. Jalons temporels supplémentaires

**Aujourd'hui** : lignes à 30 et 60 min (« golden hour ») sur la timeline.

**Proposition** : jalons cliniques additionnels si le référent les juge pédagogiquement
utiles — par ex. **TXA avant H3** (borne dure), objectif « imagerie corps entier < 60 min »,
« damage control : bloc < 90 min » pour l'instable. Les jalons deviennent configurables
(chantier technique en cours) : les ajouter ne demandera qu'une ligne de configuration.

---

*Répondre directement dans ce fichier (PR) ou par tout autre canal ; chaque point validé
sera implémenté dans une PR dédiée avec tests.*
