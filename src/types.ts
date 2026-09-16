export type ProductLink = { category: string; name: string; url: string }

export type Institution = {
  id: string; nameKm: string; nameEn: string; short: string; typeKm: string; typeEn: string;
  verified: boolean; deposits: boolean; rating: number; reviews: number; provinces: string[];
  descriptionKm: string; descriptionEn: string; services: string[]; color: string; logo?: string | null;
  cmaMember: boolean; sourceUrl: string; checkedAt: string; sourceName: 'CMA' | 'NBC';
  website?: string; email?: string; hotline?: string; address?: string;
  officialDescription?: string; officialCheckedAt?: string; websiteResearchStatus?: 'fetched'|'partial'|'unreachable'|'no_website';
  officialEmails?: string[]; officialPhones?: string[]; socialLinks?: string[]; appLinks?: string[];
  productLinks?: ProductLink[]; evidenceUrls?: string[]; pagesChecked?: number;
  csxListed: boolean; csxSecurityType?: 'equity'|'bond'|'equity_and_bond'; csxSymbol?: string; csxSourceUrl: string; csxCheckedAt: string;
}

export type GlossaryTerm = { slug:string; km:string; en:string; defKm:string; defEn:string }
