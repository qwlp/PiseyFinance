import cmaDirectory from './data/institutions.json'
import { NBC_BANK_CHECKED_AT, NBC_BANK_SOURCE, nbcCommercialBanks, nbcSpecializedBanks } from './data/nbc-banks'
import bankLogos from './data/bank-logos.json'
import bankWebsites from './data/bank-websites.json'
import websiteResearch from './data/official-websites.json'

import type { Institution } from './types'
export type { Institution } from './types'

const typeLabels: Record<string, [string, string]> = {
  bank: ['ធនាគារ', 'Bank'], mdi: ['មីក្រូហិរញ្ញវត្ថុទទួលប្រាក់បញ្ញើ', 'Deposit-taking MFI'],
  mfi: ['គ្រឹះស្ថានមីក្រូហិរញ្ញវត្ថុ', 'Microfinance institution'], leasing: ['ភតិសន្យាហិរញ្ញវត្ថុ', 'Financial leasing'],
  rural_credit: ['ឥណទានជនបទ', 'Rural credit institution'],
}
const websiteUrl = (value?: string | null) => value ? (/^https?:\/\//i.test(value) ? value : `https://${value}`) : undefined

const khmerNameOverrides: Record<string, string> = {
  'First Commercial Bank Phnom Penh Branch': 'ធនាគារពាណិជ្ជទីមួយ សាខាភ្នំពេញ',
  'Krung Thai Bank Phnom Penh Branch': 'ធនាគារក្រុងថៃ សាខាភ្នំពេញ',
  'Bank of China (Hong Kong) Phnom Penh Branch': 'ធនាគារចិន (ហុងកុង) សាខាភ្នំពេញ',
  'Mega International Commercial Bank Phnom Penh Branch': 'ធនាគារពាណិជ្ជអន្តរជាតិមេហ្គា សាខាភ្នំពេញ',
  'ICBC Limited Phnom Penh Branch': 'ធនាគារ ICBC លីមីតធីត សាខាភ្នំពេញ',
  'Taiwan Cooperative Bank Phnom Penh Branch': 'ធនាគារសហប្រតិបត្តិការតៃវ៉ាន់ សាខាភ្នំពេញ',
  'Bangkok Bank Public Company Limited, Cambodia Branch': 'ធនាគារបាងកក មហាជន លីមីតធីត សាខាកម្ពុជា',
  'Branch of Kasikornbank Public Company Limited (Phnom Penh)': 'សាខាធនាគារកាស៊ីកនថៃ មហាជន លីមីតធីត (ភ្នំពេញ)',
  'Foreign Trade Bank of Cambodia': 'ធនាគារពាណិជ្ជកម្មក្រៅប្រទេស នៃកម្ពុជា',
  'Agricultural and Rural Development Bank': 'ធនាគារអភិវឌ្ឍន៍ជនបទ និងកសិកម្ម',
  'Small and Medium Enterprise Bank of Cambodia Plc. “SME Bank”': 'ធនាគារសហគ្រាសធុនតូច និងមធ្យម កម្ពុជា «ធនាគារ SME»',
}

const decodeName = (name: string) => name
  .replace(/&#0*39;|&apos;/gi, "'")
  .replace(/&amp;/gi, '&')

/**
 * Institution brands are proper names, so the Khmer directory keeps the brand
 * (including familiar Latin acronyms) and localizes its legal/type wording.
 */
const khmerInstitutionName = (rawName: string, typeKm: string) => {
  const name = decodeName(rawName).trim()
  if (khmerNameOverrides[name]) return khmerNameOverrides[name]

  const branch = /cambodia branch/i.test(name)
    ? ' សាខាកម្ពុជា'
    : /phnom penh branch|branch.*phnom penh/i.test(name)
      ? ' សាខាភ្នំពេញ'
      : ''
  const brand = name
    .replace(/\bbranch of\b/gi, '')
    .replace(/\bphnom penh branch\b/gi, '')
    .replace(/\bcambodia branch\b/gi, '')
    .replace(/\bmicrofinance(?: institution)?\b/gi, '')
    .replace(/\bmicrohiranhvatho\b/gi, '')
    .replace(/\b(?:specialized|commercial) bank\b/gi, '')
    .replace(/\bbank\b/gi, '')
    .replace(/\b(?:financial )?leasing\b/gi, '')
    .replace(/\bfinance(?:corp)?\b/gi, '')
    .replace(/\bpublic limited company\b/gi, '')
    .replace(/\b(?:plc|ltd|limited)\.?\b/gi, '')
    .replace(/\(Cambodia\)/gi, '(កម្ពុជា)')
    .replace(/\bCambodia\b/gi, 'កម្ពុជា')
    .replace(/\bPhnom Penh\b/gi, 'ភ្នំពេញ')
    .replace(/[“”"']?ភ្នំពេញ[“”"']?/g, branch ? '' : 'ភ្នំពេញ')
    .replace(/[\s,.(]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return `${typeKm} ${brand || name}${branch}`.trim()
}

const cmaInstitutions: Institution[] = cmaDirectory.members.map(member => {
  const [typeKm, typeEn] = typeLabels[member.type] ?? ['គ្រឹះស្ថានហិរញ្ញវត្ថុ', 'Financial institution']
  const short = member.officialName.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()
  return {
    id: member.id, nameKm: khmerInstitutionName(member.officialName, typeKm), nameEn: decodeName(member.officialName), short, typeKm, typeEn,
    verified: false, deposits: member.acceptsDeposits, rating: 0, reviews: 0, provinces: [],
    descriptionKm: `សមាជិក CMA ដែលបានចុះក្នុងប្រភេទ ${typeKm}។ ព័ត៌មាននេះមិនមែនជាភស្តុតាងនៃអាជ្ញាបណ្ណ NBC ទេ។`,
    descriptionEn: `Listed by CMA as a ${typeEn.toLowerCase()}. CMA membership is not evidence of an NBC licence.`,
    services: [], color: '#315f63', logo: member.logo, cmaMember: member.cmaMember,
    sourceUrl: member.sourceUrl, checkedAt: member.retrievedAt, sourceName: 'CMA',
    website: websiteUrl(member.website), email: member.email || undefined,
    hotline: member.hotline || undefined, address: member.address || undefined,
  }
})

const slugify = (name: string) => name.toLowerCase().replace(/[“”]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const normalized = (name: string) => name.toLowerCase().replace(/advanced bank of asia limited.*$/, 'advanced bank of asia').replace(/[^a-z0-9]/g, '').replace(/(plc|limited|ltd)$/g, '')
const cmaByName = new Map(cmaInstitutions.map(institution => [normalized(institution.nameEn), institution]))

const nbcBanks: Institution[] = [
  ...nbcCommercialBanks.map(name => ({ name, specialized: false })),
  ...nbcSpecializedBanks.map(name => ({ name, specialized: true })),
].map(({ name, specialized }) => {
  const cma = cmaByName.get(normalized(name))
  const typeEn = specialized ? 'Specialized bank' : 'Commercial bank'
  const typeKm = specialized ? 'ធនាគារឯកទេស' : 'ធនាគារពាណិជ្ជ'
  const id = cma?.id ?? slugify(name)
  return {
    id, nameKm: khmerInstitutionName(name, typeKm), nameEn: name,
    short: cma?.short ?? name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase(),
    typeKm, typeEn, verified: true, deposits: !specialized, rating: 0, reviews: 0, provinces: [],
    descriptionKm: `គ្រឹះស្ថាននេះមានក្នុងបញ្ជី ${typeKm} របស់ធនាគារជាតិនៃកម្ពុជា គិតត្រឹមថ្ងៃទី ៣១ ខែមីនា ឆ្នាំ ២០២៦។`,
    descriptionEn: `Listed by the National Bank of Cambodia as a ${typeEn.toLowerCase()} as of 31 March 2026.`,
    services: [], color: '#315f63', logo: cma?.logo ?? bankLogos[id as keyof typeof bankLogos] ?? null, cmaMember: Boolean(cma),
    sourceUrl: NBC_BANK_SOURCE, checkedAt: NBC_BANK_CHECKED_AT, sourceName: 'NBC' as const,
    website: bankWebsites[id as keyof typeof bankWebsites] ?? cma?.website,
    email: cma?.email, hotline: cma?.hotline, address: cma?.address,
  }
})

const nbcNames = new Set(nbcBanks.map(bank => normalized(bank.nameEn)))
const directoryInstitutions: Institution[] = [...nbcBanks, ...cmaInstitutions.filter(i => !nbcNames.has(normalized(i.nameEn)))]
const researchById = new Map(websiteResearch.profiles.map(profile => [profile.institutionId, profile]))
export const institutions: Institution[] = directoryInstitutions.map(institution => {
  const research = researchById.get(institution.id)
  if (!research) return institution
  return {
    ...institution,
    website: research.finalUrl ?? institution.website,
    services: research.serviceCategories,
    officialDescription: research.description,
    officialCheckedAt: research.checkedAt,
    websiteResearchStatus: research.status as Institution['websiteResearchStatus'],
    officialEmails: research.emails,
    officialPhones: research.phones,
    socialLinks: research.socialLinks,
    appLinks: research.appLinks,
    productLinks: research.productLinks,
    evidenceUrls: research.evidenceUrls,
    pagesChecked: research.pagesChecked,
  }
})

export const glossary = [
  { slug: 'interest', km: 'អត្រាការប្រាក់', en: 'Interest rate', defKm: 'ភាគរយនៃប្រាក់ដើមដែលអ្នកខ្ចីបង់ ឬអ្នកសន្សំទទួលបាន ក្នុងរយៈពេលកំណត់។', defEn: 'A percentage of principal paid by a borrower or earned by a saver over a period.' },
  { slug: 'principal', km: 'ប្រាក់ដើម', en: 'Principal', defKm: 'ចំនួនប្រាក់ដើមដែលអ្នកខ្ចី មិនរាប់បញ្ចូលការប្រាក់ និងថ្លៃសេវា។', defEn: 'The original amount borrowed, excluding interest and fees.' },
  { slug: 'collateral', km: 'ទ្រព្យធានា', en: 'Collateral', defKm: 'ទ្រព្យដែលអ្នកខ្ចីដាក់ធានា ហើយអាចបាត់បង់ ប្រសិនបើមិនអាចសងបាន។', defEn: 'Property pledged for a loan that may be lost if repayments are not made.' },
  { slug: 'late-fee', km: 'ថ្លៃសេវាយឺតយ៉ាវ', en: 'Late fee', defKm: 'ប្រាក់បន្ថែមដែលអាចត្រូវបង់ នៅពេលបង់រំលស់ហួសកាលកំណត់។', defEn: 'An extra charge that may apply when an installment is paid after its due date.' },
  { slug: 'apr', km: 'អត្រាភាគរយប្រចាំឆ្នាំ', en: 'Annual percentage rate (APR)', defKm: 'រង្វាស់ថ្លៃឥណទានប្រចាំឆ្នាំ ដែលរួមបញ្ចូលការប្រាក់ និងថ្លៃសេវាមួយចំនួន។', defEn: 'A yearly measure of borrowing cost that includes interest and certain fees.' },
  { slug: 'flat-rate', km: 'អត្រាការប្រាក់ថេរ', en: 'Flat interest rate', defKm: 'ការប្រាក់ដែលគណនាលើប្រាក់ដើមដំបូងពេញមួយរយៈពេលឥណទាន។', defEn: 'Interest calculated using the original principal throughout the loan term.' },
  { slug: 'declining-balance', km: 'អត្រាលើសមតុល្យថយចុះ', en: 'Declining-balance interest', defKm: 'ការប្រាក់ដែលគណនាលើប្រាក់ដើមនៅសល់ បន្ទាប់ពីការបង់នីមួយៗ។', defEn: 'Interest calculated on the principal remaining after each payment.' },
  { slug: 'loan-term', km: 'រយៈពេលឥណទាន', en: 'Loan term', defKm: 'រយៈពេលដែលបានព្រមព្រៀងសម្រាប់សងឥណទានទាំងមូល។', defEn: 'The agreed period of time for repaying a loan in full.' },
  { slug: 'installment', km: 'ការបង់រំលស់', en: 'Installment', defKm: 'ចំនួនប្រាក់ដែលត្រូវបង់តាមកាលវិភាគ ជាទូទៅរៀងរាល់ខែ។', defEn: 'A scheduled payment, usually made monthly, toward a debt.' },
  { slug: 'processing-fee', km: 'ថ្លៃដំណើរការ', en: 'Processing fee', defKm: 'ថ្លៃដែលអ្នកផ្តល់កម្ចីគិតសម្រាប់រៀបចំ ឬអនុម័តឥណទាន។', defEn: 'A charge from a lender for arranging or approving a loan.' },
  { slug: 'prepayment', km: 'ការសងមុនកំណត់', en: 'Early repayment', defKm: 'ការសងប្រាក់មួយផ្នែក ឬទាំងអស់ មុនថ្ងៃកំណត់ក្នុងកិច្ចសន្យា។', defEn: 'Paying some or all of a loan before the date set in the agreement.' },
  { slug: 'guarantor', km: 'អ្នកធានា', en: 'Guarantor', defKm: 'បុគ្គលដែលយល់ព្រមទទួលខុសត្រូវលើបំណុល បើអ្នកខ្ចីមិនអាចសង។', defEn: 'A person who agrees to repay a debt if the borrower cannot.' },
  { slug: 'debt-to-income', km: 'សមាមាត្របំណុលធៀបចំណូល', en: 'Debt-to-income ratio', defKm: 'ភាគរយនៃចំណូលប្រចាំខែដែលត្រូវប្រើសម្រាប់បង់បំណុល។', defEn: 'The percentage of monthly income used to make debt payments.' },
  { slug: 'grace-period', km: 'រយៈពេលអនុគ្រោះ', en: 'Grace period', defKm: 'ពេលបន្ថែមក្រោយថ្ងៃកំណត់ ដែលអាចបង់ដោយមិនមានពិន័យ។', defEn: 'Extra time after a due date when payment may be made without a penalty.' },
  { slug: 'default', km: 'ការខកខានសង', en: 'Loan default', defKm: 'ការមិនបំពេញកាតព្វកិច្ចសង តាមលក្ខខណ្ឌក្នុងកិច្ចសន្យា។', defEn: 'Failure to repay a loan according to the terms of the agreement.' },
  { slug: 'total-cost', km: 'ថ្លៃឥណទានសរុប', en: 'Total cost of a loan', defKm: 'ប្រាក់ដើម ការប្រាក់ និងថ្លៃសេវាទាំងអស់ដែលអ្នកត្រូវបង់សរុប។', defEn: 'The principal, interest, and all fees you will pay altogether.' },
  { slug: 'savings-account', km: 'គណនីសន្សំ', en: 'Savings account', defKm: 'គណនីដាក់ប្រាក់ដែលអាចទទួលការប្រាក់ និងដកបានតាមលក្ខខណ្ឌ។', defEn: 'An account for holding money that may earn interest and allow withdrawals.' },
  { slug: 'compound-interest', km: 'ការប្រាក់បង្គរ', en: 'Compound interest', defKm: 'ការប្រាក់ដែលគណនាលើប្រាក់ដើម រួមទាំងការប្រាក់ដែលទទួលបានពីមុន។', defEn: 'Interest earned on both your original money and previously earned interest.' },
  { slug: 'emergency-fund', km: 'មូលនិធិបន្ទាន់', en: 'Emergency fund', defKm: 'ប្រាក់សន្សំសម្រាប់ចំណាយមិនបានរំពឹង ដូចជាជំងឺ ឬការបាត់បង់ការងារ។', defEn: 'Savings reserved for unexpected costs such as illness or job loss.' },
  { slug: 'savings-goal', km: 'គោលដៅសន្សំ', en: 'Savings goal', defKm: 'ចំនួនប្រាក់ និងពេលវេលាជាក់លាក់ដែលអ្នកគ្រោងសន្សំឱ្យបាន។', defEn: 'A specific amount of money you plan to save by a chosen date.' },
  { slug: 'automatic-saving', km: 'ការសន្សំស្វ័យប្រវត្តិ', en: 'Automatic saving', defKm: 'ការផ្ទេរប្រាក់ជាប្រចាំទៅគណនីសន្សំដោយស្វ័យប្រវត្តិ។', defEn: 'A recurring transfer that moves money into savings automatically.' },
  { slug: 'fixed-deposit', km: 'ប្រាក់បញ្ញើមានកាលកំណត់', en: 'Fixed deposit', defKm: 'ប្រាក់ដាក់សន្សំសម្រាប់រយៈពេលកំណត់ ជាថ្នូរនឹងអត្រាការប្រាក់ដែលបានកំណត់។', defEn: 'Money deposited for a fixed period in return for a stated interest rate.' },
  { slug: 'liquidity', km: 'លទ្ធភាពបម្លែងជាសាច់ប្រាក់', en: 'Liquidity', defKm: 'ភាពងាយស្រួល និងរហ័សក្នុងការប្រើ ឬដកប្រាក់ ដោយមិនខាតតម្លៃ។', defEn: 'How quickly money can be accessed without losing value.' },
  { slug: 'inflation', km: 'អតិផរណា', en: 'Inflation', defKm: 'ការកើនឡើងនៃតម្លៃទំនិញ ដែលធ្វើឱ្យប្រាក់ទិញបានតិចជាងមុន។', defEn: 'A general rise in prices that reduces what money can buy over time.' },
  { slug: 'budget', km: 'ថវិកា', en: 'Budget', defKm: 'ផែនការសម្រាប់ចំណូល ការចំណាយ ការសន្សំ និងការសងបំណុល។', defEn: 'A plan for income, spending, saving, and debt repayment.' },
  { slug: 'deposit-insurance', km: 'ការការពារប្រាក់បញ្ញើ', en: 'Deposit protection', defKm: 'ប្រព័ន្ធការពារប្រាក់បញ្ញើដែលអាចអនុវត្តចំពោះស្ថាប័ន និងចំនួនជាក់លាក់។', defEn: 'Protection that may cover eligible deposits at participating institutions.' },
  { slug: 'otp', km: 'លេខកូដ OTP', en: 'One-time password (OTP)', defKm: 'លេខកូដប្រើបានម្តងសម្រាប់បញ្ជាក់ប្រតិបត្តិការ ដែលមិនគួរចែករំលែក។', defEn: 'A single-use verification code that should never be shared.' },
  { slug: 'phishing', km: 'ការបោកបញ្ឆោតយកព័ត៌មាន', en: 'Phishing', defKm: 'សារ ឬគេហទំព័រក្លែងក្លាយដែលព្យាយាមលួចលេខសម្ងាត់ ឬព័ត៌មានហិរញ្ញវត្ថុ។', defEn: 'Fake messages or websites designed to steal passwords or financial information.' },
  { slug: 'pin', km: 'លេខសម្ងាត់ PIN', en: 'PIN safety', defKm: 'លេខសម្ងាត់សម្រាប់កាត ឬគណនី ដែលត្រូវរក្សាទុកជាសម្ងាត់។', defEn: 'A secret number used to access a card or account that must be kept private.' },
  { slug: 'licensed-institution', km: 'គ្រឹះស្ថានមានអាជ្ញាបណ្ណ', en: 'Licensed institution', defKm: 'ស្ថាប័នដែលទទួលបានការអនុញ្ញាតពីនិយតករ ដើម្បីផ្តល់សេវាជាក់លាក់។', defEn: 'An institution authorized by a regulator to provide specified services.' },
  { slug: 'terms-conditions', km: 'លក្ខខណ្ឌកិច្ចសន្យា', en: 'Terms and conditions', defKm: 'ច្បាប់ ថ្លៃសេវា សិទ្ធិ និងកាតព្វកិច្ចដែលមានក្នុងកិច្ចព្រមព្រៀង។', defEn: 'The rules, fees, rights, and obligations written into an agreement.' },
  { slug: 'complaint', km: 'ការដាក់ពាក្យបណ្តឹង', en: 'Making a complaint', defKm: 'ដំណើរការផ្លូវការសម្រាប់រាយការណ៍បញ្ហា និងស្នើសុំដំណោះស្រាយ។', defEn: 'A formal process for reporting a problem and requesting a resolution.' },
  { slug: 'fraud', km: 'ការក្លែងបន្លំ', en: 'Financial fraud', defKm: 'ការបោកប្រាស់ដោយចេតនា ដើម្បីយកប្រាក់ ឬព័ត៌មានរបស់អ្នក។', defEn: 'Deliberate deception intended to take your money or information.' },
  { slug: 'credit-report', km: 'របាយការណ៍ឥណទាន', en: 'Credit report', defKm: 'កំណត់ត្រាប្រវត្តិខ្ចី និងសងប្រាក់ ដែលអ្នកផ្តល់កម្ចីអាចប្រើវាយតម្លៃ។', defEn: 'A record of borrowing and repayment history that lenders may use to assess risk.' },
]
