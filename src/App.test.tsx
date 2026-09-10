import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { institutions } from './data'

describe('institution fixtures', () => {
  it('contains the complete NBC bank list and keeps CMA membership separate', () => {
    const banks = institutions.filter(i => i.typeEn.toLowerCase().includes('bank'))
    expect(banks).toHaveLength(65)
    expect(banks.filter(i => i.typeEn === 'Commercial bank')).toHaveLength(58)
    expect(banks.filter(i => i.typeEn === 'Specialized bank')).toHaveLength(7)
    expect(banks.every(i => i.verified && i.sourceName === 'NBC')).toBe(true)
    expect(banks.some(i => !i.cmaMember)).toBe(true)
  })
  it('contains searchable bilingual names', () => {
    expect(institutions.every(i => i.nameKm && i.nameEn)).toBe(true)
    expect(institutions.every(i => /[\u1780-\u17ff]/.test(i.nameKm))).toBe(true)
    expect(institutions.every(i => i.nameKm !== i.nameEn)).toBe(true)
  })
  it('uses only local logo paths when a logo is available', () => {
    expect(institutions.every(i => !i.logo || i.logo.startsWith('/logos/'))).toBe(true)
  })

  it('provides an official website and local logo for every NBC bank', () => {
    const banks = institutions.filter(institution => institution.sourceName === 'NBC')

    expect(banks).toHaveLength(65)
    for (const bank of banks) {
      expect(bank.website, `${bank.nameEn} website`).toMatch(/^https?:\/\//)
      expect(bank.logo, `${bank.nameEn} logo`).toMatch(/^\/logos\//)
    }
  })

  it('keeps a dated website-research record for every directory institution', () => {
    expect(institutions).toHaveLength(187)
    for (const institution of institutions) {
      expect(institution.officialCheckedAt, `${institution.nameEn} research date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(institution.websiteResearchStatus, `${institution.nameEn} research status`).toMatch(/^(fetched|partial|unreachable|no_website)$/)
    }
  })

  it('links every discovered product back to an official web page', () => {
    const products = institutions.flatMap(institution => institution.productLinks ?? [])
    expect(products.length).toBeGreaterThan(100)
    for (const product of products) {
      expect(product.category).not.toBe('')
      expect(product.url).toMatch(/^https?:\/\//)
    }
  })
})
