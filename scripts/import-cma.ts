import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { extname } from 'node:path'

const sourcePath = process.argv[2] ?? '/tmp/pisey-source-import/cma.html'
const html = await readFile(sourcePath, 'utf8')
const sourceUrl = 'https://www.cma-network.org/member-profile'
const retrievedAt = new Date().toISOString().slice(0, 10)

const categoryMap: Record<string, { type: string; acceptsDeposits: boolean }> = {
  Bank: { type: 'bank', acceptsDeposits: true },
  'Microfinance Deposit Taking Institutions (MDIs)': { type: 'mdi', acceptsDeposits: true },
  'Microfinance Institutions (MFIs)': { type: 'mfi', acceptsDeposits: false },
  'Leasing Institutions': { type: 'leasing', acceptsDeposits: false },
  'Rural Credit institution': { type: 'rural_credit', acceptsDeposits: false },
}

const tokens = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>|<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"[^>]*>/g)]
let category = ''
const members: Array<Record<string, unknown>> = []

for (const token of tokens) {
  if (token[1]) {
    const heading = token[1].trim()
    if (categoryMap[heading]) category = heading
    continue
  }
  if (!category || !token[2] || !token[3]) continue
  const name = token[3].replace(/\s+/g, ' ').trim()
  const slug = name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const imageUrl = token[2]
  const preceding = html.slice(Math.max(0, (token.index ?? 0) - 500), token.index)
  const profileMatches = [...preceding.matchAll(/href="(https:\/\/www\.cma-network\.org\/member-profile-details\/[^"]+)"/g)]
  const profileUrl = profileMatches.at(-1)?.[1] ?? `https://www.cma-network.org/member-profile-details/${slug}`
  const extension = ['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(extname(new URL(imageUrl).pathname).toLowerCase())
    ? extname(new URL(imageUrl).pathname).toLowerCase()
    : '.png'
  members.push({
    id: slug,
    officialName: name,
    type: categoryMap[category].type,
    acceptsDeposits: categoryMap[category].acceptsDeposits,
    cmaMember: true,
    nbcVerification: 'not_yet_verified',
    logo: `/logos/${slug}${extension}`,
    logoSourceUrl: imageUrl,
    profileUrl,
    sourceUrl,
    sourceCategory: category,
    retrievedAt,
  })
}

const decode = (value:string) => value.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim()
for (let offset=0; offset<members.length; offset+=8) {
  await Promise.all(members.slice(offset,offset+8).map(async member => {
    try {
      const response=await fetch(member.profileUrl as string,{headers:{'User-Agent':'Mozilla/5.0','Referer':sourceUrl}})
      if(!response.ok) throw new Error(`HTTP ${response.status}`)
      const detail=await response.text()
      const field=(label:string) => {
        const match=detail.match(new RegExp(`<strong>${label}:<\\/strong>\\s*<span>([\\s\\S]*?)<\\/span>`,'i'))
        return match ? decode(match[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ')) : null
      }
      member.website=field('Website')
      member.email=field('E-Mail')
      member.hotline=field('Hotline')
      member.address=field('Address')
    } catch(error) { console.warn(`Profile skipped: ${member.officialName} (${error})`) }
  }))
}

await mkdir('public/logos', { recursive: true })
for (const member of members) {
  if (await Bun.file(`public${member.logo}`).exists()) continue
  const response = await fetch(member.logoSourceUrl as string, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!response.ok) {
    console.warn(`Logo skipped (${response.status}): ${member.officialName}`)
    member.logo = null
    continue
  }
  await writeFile(`public${member.logo}`, Buffer.from(await response.arrayBuffer()))
}

await mkdir('src/data', { recursive: true })
await writeFile('src/data/institutions.json', JSON.stringify({ sourceUrl, retrievedAt, members }, null, 2) + '\n')
console.log(`Imported ${members.length} CMA members.`)
