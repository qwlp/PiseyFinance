import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { institutions } from '../src/data'

type ProductLink = { category: string; name: string; url: string }
type WebProfile = {
  institutionId: string
  website: string | null
  checkedAt: string
  status: 'fetched' | 'partial' | 'unreachable' | 'no_website'
  finalUrl?: string
  title?: string
  description?: string
  emails: string[]
  phones: string[]
  socialLinks: string[]
  appLinks: string[]
  serviceCategories: string[]
  productLinks: ProductLink[]
  evidenceUrls: string[]
  pagesChecked: number
  error?: string
}

const checkedAt = new Date().toISOString().slice(0, 10)
const timeoutMs = Number(process.env.PISEY_CRAWL_TIMEOUT_MS ?? 12_000)
const pageLimit = Number(process.env.PISEY_CRAWL_PAGE_LIMIT ?? 10)
const concurrency = Number(process.env.PISEY_CRAWL_CONCURRENCY ?? 6)
const only = new Set((process.env.PISEY_CRAWL_ONLY ?? '').split(',').filter(Boolean))

const categories: Array<[string, RegExp]> = [
  ['Personal loans', /personal loan|consumer loan|salary loan|payroll loan/i],
  ['Home loans', /home loan|housing loan|mortgage/i],
  ['Vehicle finance', /car loan|auto loan|vehicle loan|motorcycle loan|motorbike loan/i],
  ['Business loans', /business loan|sme loan|commercial loan|working capital|business finance/i],
  ['Agriculture loans', /agri(?:culture|cultural)? loan|farm loan/i],
  ['Microloans', /micro loan|microloan|small loan|group loan/i],
  ['Savings accounts', /savings? account|saving deposit/i],
  ['Fixed deposits', /fixed deposit|term deposit/i],
  ['Current accounts', /current account|checking account/i],
  ['Cards', /credit card|debit card|visa card|mastercard|unionpay/i],
  ['Mobile banking', /mobile banking|banking app|digital banking|internet banking/i],
  ['Payments and transfers', /money transfer|remittance|payment service|fund transfer|bakong/i],
  ['Financial leasing', /financial leas|leasing service|lease finance/i],
  ['Insurance', /bancassurance|insurance/i],
]

const relevantPath = /loan|credit|borrow|financ|deposit|saving|account|card|banking|payment|transfer|remittance|product|service|contact|branch|about/i
const skipPath = /career|job|news|press|event|privacy|terms|login|register|download|.pdf(?:$|\?)/i
const normalizeSpace = (value: string) => value.replace(/\s+/g, ' ').trim()
const decode = (value: string) => normalizeSpace(value
  .replace(/&amp;/gi, '&').replace(/&quot;/gi, '"').replace(/&#0*39;|&apos;/gi, "'")
  .replace(/&nbsp;/gi, ' ').replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, decimal) => String.fromCodePoint(Number(decimal))))
const stripTags = (value: string) => decode(value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
const unique = <T>(values: T[]) => [...new Set(values)]

function absoluteUrl(raw: string, base: string) {
  try {
    const url = new URL(decode(raw).replace(/[\s\u200e\u200f]+$/g, ''), base)
    url.hash = ''
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch { return null }
}

async function fetchHtml(url: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      redirect: 'follow', signal: controller.signal,
      headers: { 'User-Agent': 'PiseyFinanceResearch/1.0 (+public financial-product directory)', Accept: 'text/html,application/xhtml+xml' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const type = response.headers.get('content-type') ?? ''
    if (!type.includes('text/html') && !type.includes('application/xhtml')) throw new Error(`Unsupported content type: ${type || 'unknown'}`)
    return { html: await response.text(), url: response.url }
  } finally { clearTimeout(timer) }
}

function pageMetadata(html: string, pageUrl: string) {
  const title = decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '')
  const description = decode(html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']+)/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:description|og:description)["']/i)?.[1] ?? '')
  const text = stripTags(html)
  const emails = [...html.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map(match => match[0].toLowerCase()).filter(email => !/example|sentry|wixpress|cloudflare/.test(email))
  const phones = [...text.matchAll(/(?:\+?855[ -]?)?(?:\(?0\)?[ -]?)?(?:1\d|[2-9]\d)(?:[ -]?\d){6,8}/g)]
    .map(match => normalizeSpace(match[0]))
    .filter(phone => phone.replace(/\D/g, '').length >= 8 && !/^20\d\d[- /](?:0?\d|1[0-2])[- /]/.test(phone))
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(match => {
    const url = absoluteUrl(match[1], pageUrl)
    return url ? { url, name: stripTags(match[2]).slice(0, 120) } : null
  }).filter(Boolean) as Array<{url:string;name:string}>
  return { title, description, text, emails, phones, links }
}

function classify(name: string, url: string, text = '') {
  const haystack = `${name} ${decodeURIComponent(url)} ${text.slice(0, 3000)}`
  return categories.filter(([, pattern]) => pattern.test(haystack)).map(([category]) => category)
}

async function crawl(institution: (typeof institutions)[number]): Promise<WebProfile> {
  const website = institution.website ?? null
  const empty = { institutionId: institution.id, website, checkedAt, emails: [] as string[], phones: [] as string[], socialLinks: [] as string[], appLinks: [] as string[], serviceCategories: [] as string[], productLinks: [] as ProductLink[], evidenceUrls: [] as string[], pagesChecked: 0 }
  if (!website) return { ...empty, status: 'no_website' }
  try {
    const home = await fetchHtml(website)
    const homeMeta = pageMetadata(home.html, home.url)
    const origin = new URL(home.url).origin
    const candidates = homeMeta.links
      .filter(link => { try { return new URL(link.url).origin === origin && relevantPath.test(`${link.name} ${new URL(link.url).pathname}`) && !skipPath.test(link.url) } catch { return false } })
      .sort((a, b) => Number(/contact|product|service|loan|deposit|saving/i.test(b.url)) - Number(/contact|product|service|loan|deposit|saving/i.test(a.url)))
    const queue = unique(candidates.map(link => link.url)).slice(0, Math.max(0, pageLimit - 1))
    const pages = [{ ...homeMeta, url: home.url }]
    for (const url of queue) {
      try {
        const page = await fetchHtml(url)
        pages.push({ ...pageMetadata(page.html, page.url), url: page.url })
      } catch { /* A failed secondary page makes the result partial, not unusable. */ }
    }
    const allLinks = pages.flatMap(page => page.links)
    const isForeignBranch = /branch/i.test(institution.nameEn)
    const cambodiaSpecific = (url: string, name = '') => !isForeignBranch || /cambodia|khmer|phnom.?penh|(?:^|\/)en-kh(?:\/|$)|(?:^|\/)kh(?:\/|$)/i.test(`${url} ${name}`)
    const socialLinks = unique(allLinks.map(link => link.url).filter(url => /facebook\.com|linkedin\.com|instagram\.com|youtube\.com|tiktok\.com/i.test(url))).slice(0, 12)
    const appLinks = unique(allLinks.map(link => link.url).filter(url => /apps\.apple\.com|play\.google\.com/i.test(url))).slice(0, 8)
    const productLinks = new Map<string, ProductLink>()
    for (const link of allLinks) {
      if (new URL(link.url).origin !== origin || skipPath.test(link.url) || !cambodiaSpecific(link.url, link.name)) continue
      for (const category of classify(link.name, link.url)) {
        const key = `${category}|${link.url}`
        productLinks.set(key, { category, name: link.name || category, url: link.url })
      }
    }
    const serviceCategories = unique(pages.filter(page => cambodiaSpecific(page.url, `${page.title} ${page.description}`)).flatMap(page => classify(page.title, page.url, page.text)))
    return {
      ...empty, status: pages.length === Math.min(pageLimit, queue.length + 1) ? 'fetched' : 'partial', finalUrl: home.url,
      title: homeMeta.title || undefined, description: homeMeta.description.slice(0, 500) || undefined,
      emails: unique(pages.flatMap(page => page.emails)).slice(0, 12),
      phones: unique(pages.flatMap(page => page.phones)).filter(phone => !isForeignBranch || /855|^0/.test(phone)).slice(0, 12),
      socialLinks, appLinks, serviceCategories,
      productLinks: [...productLinks.values()].slice(0, 60), evidenceUrls: unique(pages.map(page => page.url)), pagesChecked: pages.length,
    }
  } catch (error) {
    return { ...empty, status: 'unreachable', error: error instanceof Error ? error.message : String(error) }
  }
}

const selected = only.size ? institutions.filter(institution => only.has(institution.id)) : institutions
const profiles: WebProfile[] = []
for (let offset = 0; offset < selected.length; offset += concurrency) {
  const batch = await Promise.all(selected.slice(offset, offset + concurrency).map(crawl))
  profiles.push(...batch)
  console.log(`Checked ${profiles.length}/${selected.length}`)
}

let outputProfiles = profiles
if (only.size) {
  try {
    const previous = JSON.parse(await readFile('src/data/official-websites.json', 'utf8')) as {profiles: WebProfile[]}
    const replacements = new Map(profiles.map(profile => [profile.institutionId, profile]))
    outputProfiles = previous.profiles.map(profile => replacements.get(profile.institutionId) ?? profile)
    for (const profile of profiles) if (!previous.profiles.some(item => item.institutionId === profile.institutionId)) outputProfiles.push(profile)
  } catch { /* A targeted first run can still create a valid partial snapshot. */ }
}
const summary = {
  total: outputProfiles.length,
  fetched: outputProfiles.filter(profile => profile.status === 'fetched').length,
  partial: outputProfiles.filter(profile => profile.status === 'partial').length,
  unreachable: outputProfiles.filter(profile => profile.status === 'unreachable').length,
  noWebsite: outputProfiles.filter(profile => profile.status === 'no_website').length,
  withProducts: outputProfiles.filter(profile => profile.productLinks.length).length,
  pagesChecked: outputProfiles.reduce((sum, profile) => sum + profile.pagesChecked, 0),
}
await mkdir('src/data', { recursive: true })
await writeFile('src/data/official-websites.json', JSON.stringify({ checkedAt, summary, profiles: outputProfiles }, null, 2) + '\n')
console.log(summary)
