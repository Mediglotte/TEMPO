import type { ClinicalReference, SubField } from '../../../types/model'

/**
 * Rappels cliniques affichés dans les panneaux de détail.
 * Sources : critères de Vittel (Riou 2002), fiche RESUVAL 2019 (grades A/B/C),
 * score ABC (Nunez 2009), CRASH-2 / BATT pour le TXA.
 *
 * ⚠️ Contenu de démonstration à FAIRE VALIDER par le médecin référent
 * (seuils, mappings grade→centre, libellés). Voir le plan, section « Points cliniques ».
 */

export const VITTEL_REMINDER = `Critères de Vittel — un seul item suffit à classer « traumatisé sévère ».
• Physiologie : Glasgow < 13 · PAS < 90 mmHg · SpO₂ < 90 %
• Cinétique : éjection, autre passager décédé, chute > 6 m, projection/écrasement, blast
• Lésions : trauma pénétrant (tête/cou/thorax/abdomen/bassin/racine de membre), volet thoracique, brûlure grave, fracas du bassin, suspicion d'atteinte médullaire, amputation, ischémie de membre
• Réanimation préhosp : ventilation assistée, remplissage > 1 000 ml, catécholamines
• Terrain : âge > 65 ans, insuff. cardiaque/respiratoire, grossesse (2e–3e T), trouble de la crase`

export const GRADE_REMINDER = `Grade de gravité (oriente vers le niveau de centre) — réf. RESUVAL/RENAU.
• Grade A : instable MALGRÉ la réanimation (SpO₂ < 90 % sous O₂, PAS < 100 après > 1 000 ml, GCS ≤ 8, amines, transfusion préhosp). → Niveau I.
• Grade B : stabilisé par la réa et/ou lésion à expertise (pénétrant tronc, volet, atteinte médullaire, bassin grave, lésion vasculaire de membre, épanchement au FAST). → Niveau II (I si non stabilisé).
• Grade C : stable sans réa, sur cinétique/terrain. → Niveau I/II/III selon le temps de transport.`

export const ABC_REMINDER = `Score ABC (Assessment of Blood Consumption) — prédiction de transfusion massive.
4 items à 1 point chacun : mécanisme pénétrant · FAST positif · PAS ≤ 90 mmHg · FC ≥ 120 /min.
Seuil : ABC ≥ 2 → activer le protocole de transfusion massive (calcul immédiat, sans biologie).
Alternative intra-hosp : TASH ≥ 8,5 (pondéré, nécessite Hb / base excess).`

export const BATT_REMINDER = `Score BATT (Bleeding Audit Triage Trauma) — Ageron et al. 2021 — risque de décès par hémorragie.
Items PONDÉRÉS (score 0–27) : Âge 65–74 ans (+1) / ≥ 75 ans (+2) · PAS < 60 mmHg (+14) / 60–99 mmHg (+5) · Glasgow ≤ 8 (+4) / 9–12 (+3) · FR < 10 ou ≥ 30 /min, ou SpO₂ < 90 % (+2) · FC > 100 /min (+1) · trauma pénétrant (+2) · haute cinétique (+2).
Ne cocher qu'UN seul palier par variable (Âge, PAS, Glasgow).
Bandes de risque de décès hémorragique : BATT 3–4 = faible (~1 %) · 5–7 = intermédiaire (~5 %) · ≥ 8 = HAUT (~15 %).
Seuils : ≥ 2 → acide tranexamique préhospitalier (< 3 h) ; ≥ 8 (haut risque) → protocole de transfusion massive + OctaplasLG (choix local).
Haute cinétique = AVP avec intrusion/éjection/décès dans l'habitacle ou piéton-cycliste percuté, chute > 3 m, blast.
⚠️ À VALIDER : le BATT est validé pour l'indication de l'ACIDE TRANEXAMIQUE préhospitalier (< 3 h ; risque de décès hémorragique), tandis que l'ABC et le TASH prédisent la transfusion massive. Le seuil ≥ 8 pour déclencher PTM + OctaplasLG est un choix local, à valider par le médecin référent.`

export const TXA_REMINDER = `Acide tranexamique (TXA) — dans les 3 h suivant le traumatisme (CRASH-2).
Indication préhosp : risque hémorragique (ex. BATT ≥ 2 : hypotension, tachycardie, mécanisme...).
Schéma : 1 g IV en 10 min, puis 1 g sur 8 h. Bolus débuté en préhospitalier.`

export const FAST_REMINDER = `e-FAST — 4 fenêtres + thorax : épanchement péritonéal (Morrison, spléno-rénal, Douglas),
péricardique (sous-xiphoïde), pneumothorax (perte du glissement pleural), hémothorax.
FAST positif + instabilité hémodynamique → laparotomie d'hémostase / damage control sans attendre le body-CT.`

export const STABILITE_REMINDER = `Décision d'orientation au déchocage :
• Instable + FAST positif → BLOC (damage control) / packing / artériographie sans délai.
• Stabilisé → body-CT (scanner corps entier injecté), examen de référence.
L'indication de damage control repose sur la PHYSIOLOGIE (instabilité, triade létale), pas sur le mécanisme.`

export const TRAUMA_CENTER_REMINDER = `Niveaux de centre (nomenclature variable selon les régions) :
• Niveau I — CHU de référence : toutes lésions, chirurgie + neurochir + radio interventionnelle 24/24.
• Niveau II — plateau proche du I, chirurgie souvent en astreinte ; grades B et certains A après concertation.
• Niveau III — proximité : bilan et stabilisation avant transfert ; surtout grades C.`

export const TRANSFUSION_REMINDER = `Protocole de transfusion massive : ratio CGR/PFC/plaquettes ≈ 1:1:1,
fibrinogène, calcium ; réanimation hémostatique. Déclenché si ABC ≥ 2 ou TASH ≥ 8,5.`

/**
 * Critères de Vittel structurés (checklist) — un seul item suffit à classer
 * « traumatisé sévère ». Source : Riou 2002 ; cf. medicalcul.free.fr/vittel.html.
 * Stockés sous la clé `regul.appel.vittel::<id>` ; comptés par l'action computed.
 */
export const VITTEL_SUBFIELDS: SubField[] = [
  // Variables physiologiques
  { id: 'phys-glasgow', group: 'Variables physiologiques', type: 'checkbox', label: 'Glasgow < 13' },
  { id: 'phys-pas', group: 'Variables physiologiques', type: 'checkbox', label: 'PAS < 90 mmHg' },
  { id: 'phys-spo2', group: 'Variables physiologiques', type: 'checkbox', label: 'SpO₂ < 90 %' },
  // Éléments de cinétique
  { id: 'cin-ejection', group: 'Éléments de cinétique', type: 'checkbox', label: 'Éjection d’un véhicule' },
  { id: 'cin-deces', group: 'Éléments de cinétique', type: 'checkbox', label: 'Autre passager décédé dans le même véhicule' },
  { id: 'cin-chute', group: 'Éléments de cinétique', type: 'checkbox', label: 'Chute > 6 m' },
  { id: 'cin-projete', group: 'Éléments de cinétique', type: 'checkbox', label: 'Victime projetée ou écrasée' },
  { id: 'cin-blast', group: 'Éléments de cinétique', type: 'checkbox', label: 'Blast' },
  { id: 'cin-appreciation', group: 'Éléments de cinétique', type: 'checkbox', label: 'Appréciation globale (déformation du véhicule, vitesse, absence de ceinture/casque)' },
  // Lésions anatomiques
  { id: 'les-penetrant', group: 'Lésions anatomiques', type: 'checkbox', label: 'Trauma pénétrant (tête, cou, thorax, abdomen, bassin, racine de membre)' },
  { id: 'les-volet', group: 'Lésions anatomiques', type: 'checkbox', label: 'Volet thoracique' },
  { id: 'les-brulure', group: 'Lésions anatomiques', type: 'checkbox', label: 'Brûlure sévère / inhalation de fumées' },
  { id: 'les-bassin', group: 'Lésions anatomiques', type: 'checkbox', label: 'Fracas du bassin' },
  { id: 'les-medullaire', group: 'Lésions anatomiques', type: 'checkbox', label: 'Suspicion d’atteinte médullaire' },
  { id: 'les-amputation', group: 'Lésions anatomiques', type: 'checkbox', label: 'Amputation (poignet/cheville ou au-dessus)' },
  { id: 'les-ischemie', group: 'Lésions anatomiques', type: 'checkbox', label: 'Ischémie aiguë de membre' },
  // Réanimation préhospitalière
  { id: 'rea-ventilation', group: 'Réanimation préhospitalière', type: 'checkbox', label: 'Ventilation assistée' },
  { id: 'rea-remplissage', group: 'Réanimation préhospitalière', type: 'checkbox', label: 'Remplissage > 1 000 ml' },
  { id: 'rea-catecholamines', group: 'Réanimation préhospitalière', type: 'checkbox', label: 'Catécholamines' },
  { id: 'rea-pantalon', group: 'Réanimation préhospitalière', type: 'checkbox', label: 'Pantalon antichoc gonflé' },
  // Terrain
  { id: 'ter-age', group: 'Terrain', type: 'checkbox', label: 'Âge > 65 ans' },
  { id: 'ter-cardio', group: 'Terrain', type: 'checkbox', label: 'Insuffisance cardiaque ou coronarienne' },
  { id: 'ter-respi', group: 'Terrain', type: 'checkbox', label: 'Insuffisance respiratoire' },
  { id: 'ter-grossesse', group: 'Terrain', type: 'checkbox', label: 'Grossesse (2e–3e trimestre)' },
  { id: 'ter-crase', group: 'Terrain', type: 'checkbox', label: 'Trouble de la crase sanguine' },
]

/** Clés d'entrée (values) pour l'action calculée « Critères de Vittel ». */
export const VITTEL_INPUT_IDS = VITTEL_SUBFIELDS.map((sf) => `regul.appel.vittel::${sf.id}`)

export const SOURCES: ClinicalReference[] = [
  { label: 'Critères de Vittel', note: 'Riou et al., 2002 — triage du traumatisé sévère.' },
  { label: 'Grades A/B/C', note: 'Fiche RESUVAL 2019 / réseau RENAU (Auvergne-Rhône-Alpes).' },
  { label: 'Score ABC', note: 'Nunez et al., 2009 — seuil ≥ 2 pour la transfusion massive.' },
  { label: 'Score BATT', note: 'Ageron et al., 2021 — seuil ≥ 2 pour la TXA préhospitalière (risque de décès hémorragique).' },
  { label: 'TXA', note: 'CRASH-2 (Lancet 2010) ; BATT pour l’indication préhospitalière.' },
]
