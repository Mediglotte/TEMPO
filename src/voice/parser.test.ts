import { describe, expect, it } from 'vitest'
import { detectCommand, parseFills } from './parser'

const byId = (fills: ReturnType<typeof parseFills>, id: string) =>
  fills.find((f) => f.actionId === id)

describe('detectCommand — frontières de mots', () => {
  it('ne matche pas une commande à l’intérieur d’un mot', () => {
    expect(detectCommand('grade indéterminé')).toBeNull()
    expect(detectCommand('bilan invalide')).toBeNull()
  })

  it('détecte les commandes réelles', () => {
    expect(detectCommand('terminé')).toBe('stop')
    expect(detectCommand('validé')).toBe('validate')
  })
})

describe('parseFills — champs numériques', () => {
  it('capture les décimales (« virgule »)', () => {
    const fills = parseFills('température trente-huit virgule cinq')
    expect(byId(fills, 'prehosp.e.temperature')?.value).toBe(38.5)
  })

  it('ne tronque plus les nombres hors bornes (1000 rejeté, pas 100)', () => {
    const fills = parseFills('tension 1000')
    expect(byId(fills, 'prehosp.c.pas')).toBeUndefined()
  })

  it('ne vole pas le nombre du champ voisin (fenêtre bornée)', () => {
    const fills = parseFills('pouls non pris saturation 95')
    expect(byId(fills, 'prehosp.c.fc')).toBeUndefined()
    expect(byId(fills, 'prehosp.b.spo2')?.value).toBe(95)
  })

  it('« pression artérielle moyenne 65 » ne remplit que la PAM', () => {
    const fills = parseFills('pression artérielle moyenne 65')
    expect(byId(fills, 'prehosp.c.pas')).toBeUndefined()
    expect(byId(fills, 'prehosp.acsos::pam-hemo')?.value).toBe(65)
  })
})

describe('parseFills — toggles et négations', () => {
  it('« kétamine » ne coche pas la noradrénaline (« amine » n’est plus une sous-chaîne)', () => {
    const fills = parseFills('kétamine pour l’induction')
    expect(byId(fills, 'prehosp.g.nad')).toBeUndefined()
  })

  it('« garrot annoncé » n’est pas une négation (« non » ⊄ « annoncé »)', () => {
    const fills = parseFills('garrot annoncé')
    expect(byId(fills, 'prehosp.g.garrot')?.value).toBe(true)
  })

  it('« pas de garrot » reste une négation', () => {
    const fills = parseFills('pas de garrot')
    expect(byId(fills, 'prehosp.g.garrot')?.value).toBe(false)
  })
})
