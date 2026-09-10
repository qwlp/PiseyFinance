import { mkdir, writeFile } from 'node:fs/promises'

const domains: Record<string, string> = {
  'acleda-bank-plc': 'acledabank.com.kh',
  'advanced-bank-of-asia-limited-aba-bank': 'ababank.com',
  'canadia-bank-plc': 'canadiabank.com.kh',
  'wing-bank-cambodia-plc': 'wingbank.com.kh',
  'amk-bank-plc': 'amkbank.com.kh',
  'maybank-cambodia-plc': 'maybank2u.com.kh',
  'vattanac-bank': 'vattanacbank.com',
  'foreign-trade-bank-of-cambodia': 'ftb.com.kh',
  'sathapana-bank-plc': 'sathapana.com.kh',
  'phnom-penh-commercial-bank': 'ppcbank.com.kh',
  'cambodia-post-bank-plc': 'cambodiapostbank.com',
  'chip-mong-commercial-bank-plc': 'chipmongbank.com',
  'j-trust-royal-bank-plc': 'jtrustroyal.com',
  'small-and-medium-enterprise-bank-of-cambodia-plc-sme-bank': 'smebankcambodia.com.kh',
  'agricultural-and-rural-development-bank': 'ardb.com.kh',
  'hattha-bank-plc': 'hatthabank.com',
  'kb-prasac-bank-plc': 'kbprasacbank.com.kh',
  'woori-bank-cambodia-plc': 'wooribank.com.kh',
  'shinhan-bank-cambodia-plc': 'shinhan.com.kh',
  'cimb-bank-plc': 'cimbbank.com.kh',
  'rhb-bank-cambodia-plc': 'rhbgroup.com.kh',
  'bred-bank-cambodia-plc': 'bredcambodia.com',
  'hong-leong-bank-cambodia-plc': 'hlb.com.kh',
  'cathay-united-bank-cambodia-plc': 'cathaybk.com.kh',
  'phillip-bank-plc': 'phillipbank.com.kh',
  'sbi-ly-hour-bank-plc': 'sbilhbank.com.kh',
  'dgb-bank-plc': 'dgbcambodia.com',
  'mb-bank-cambodia-plc': 'mbcambodia.com',
  'bridge-bank-plc': 'bridgebank.com.kh',
  'oriental-bank-plc': 'orientalbank.com.kh',
  'chief-commercial-bank-plc': 'chiefbank.com.kh',
  'alpha-commercial-bank-plc': 'alphabank.com.kh',
  'cambodian-public-bank-plc': 'campubank.com.kh',
  'cambodian-commercial-bank-plc': 'ccb.com.kh',
  'union-commercial-bank-plc': 'ucb.com.kh',
  'bank-for-investment-and-development-of-cambodia-plc': 'bidc.com.kh',
  'first-commercial-bank-phnom-penh-branch': 'firstbank.com.tw',
  'krung-thai-bank-phnom-penh-branch': 'krungthai.com',
  'bank-of-china-hong-kong-phnom-penh-branch': 'bankofchina.com.kh',
  'mega-international-commercial-bank-phnom-penh-branch': 'megabank.com.tw',
  'icbc-limited-phnom-penh-branch': 'icbc.com.cn',
  'taiwan-cooperative-bank-phnom-penh-branch': 'tcb-bank.com.tw',
  'bangkok-bank-public-company-limited-cambodia-branch': 'bangkokbank.com',
  'branch-of-kasikornbank-public-company-limited-phnom-penh': 'kasikornbank.com.kh',
  'branch-of-mizuho-bank-ltd': 'mizuhogroup.com',
  'branch-of-industrial-bank-of-korea-phnom-penh': 'ibk.co.kr',
  'aeon-specialized-bank-cambodia-plc': 'aeon.com.kh',
  'vietnam-bank-for-agriculture-and-rural-development-cambodia-branch-agri-bank': 'agribank.com.kh',
  'cambodia-asia-bank-ltd': 'cab.com.kh',
  'booyoung-khmer-bank': 'booyoungkhmerbank.com',
  'ibank-cambodia-plc': 'ibank.com.kh',
  'asia-pacific-development-bank-plc': 'apdbank.com.kh',
  'peak-wealth-bank-plc': 'peakwealthbank.com',
  'hh-bank-cambodia-plc': 'hhbank.com.kh',
  'ccu-commercial-bank-plc': 'ccubank.com.kh',
  'heng-feng-cambodia-bank-plc': 'hfcommercialbank.com',
  'ipu-sea-bank-cambodia-plc': 'ipubank.com',
  'saigon-thuong-tin-bank-cambodia-plc': 'sacombank.com.kh',
  'saigon-hanoi-cambodia-bank-shb-plc': 'shb.com.vn',
  'anco-specialized-bank': 'ancogroups.com',
  'phsme-specialized-bank-ltd': 'phsmebank.com.kh',
  'kb-daehan-specialized-bank-plc': 'kdsb.com.kh',
  'daun-penh-specialized-bank-plc': 'dpbank.com.kh',
  'southern-capital-specialized-bank-plc': 'scb-bank.com',
  'evergrowth-cambodia-specialized-bank-plc': 'evergrowthbank.com.kh',
}

await mkdir('public/logos/banks', { recursive: true })
const imported: Record<string, string> = {}
const extensions = ['svg', 'jpg', 'ico', 'png'] as const
const existingLogo = async (id: string) => {
  for (const extension of extensions) {
    const officialPath = `/logos/banks/${id}-official.${extension}`
    if (await Bun.file(`public${officialPath}`).exists()) return officialPath
    const path = `/logos/banks/${id}.${extension}`
    if (await Bun.file(`public${path}`).exists()) return path
  }
}

for (const id of Object.keys(domains)) {
  const path = await existingLogo(id)
  if (path) imported[id] = path
}
await writeFile('src/data/bank-logos.json', JSON.stringify(imported, null, 2) + '\n')
for (const [id, domain] of Object.entries(domains)) {
  const existing = await existingLogo(id)
  if (existing) { imported[id] = existing; continue }
  let response = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`)
  if (!response.ok) response = await fetch(`https://icon.horse/icon/${encodeURIComponent(domain)}`)
  if (!response.ok) { console.warn(`Skipped ${id}: HTTP ${response.status}`); continue }
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length < 100) { console.warn(`Skipped ${id}: empty image`); continue }
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  const extension = contentType.includes('svg') ? 'svg'
    : contentType.includes('icon') ? 'ico'
      : contentType.includes('jpeg') ? 'jpg'
        : 'png'
  const path = `/logos/banks/${id}.${extension}`
  await writeFile(`public${path}`, bytes)
  imported[id] = path
  await writeFile('src/data/bank-logos.json', JSON.stringify(imported, null, 2) + '\n')
}
await writeFile('src/data/bank-logos.json', JSON.stringify(imported, null, 2) + '\n')
console.log(`Imported ${Object.keys(imported).length} bank logos.`)
