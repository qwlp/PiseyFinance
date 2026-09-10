import type { ReactNode } from 'react'
import { BadgeCheck, CalendarDays, Check, CircleHelp, ExternalLink, Landmark, X } from 'lucide-react'
import type { Institution } from './types'

type Props = { ids:string[]; institutions:Institution[]; locale:'km'|'en'; go:(path:string)=>void }

function Logo({institution}:{institution:Institution}) {
  return <span className="compare-logo">{institution.logo?<img src={institution.logo} alt=""/>:institution.short}</span>
}

export function ComparePage({ids,institutions,locale,go}:Props) {
  const km=locale==='km'; const list=ids.map(id=>institutions.find(i=>i.id===id)).filter(Boolean) as Institution[]
  const columns={gridTemplateColumns:`190px repeat(${list.length}, minmax(230px, 1fr))`}
  const row=(labelKm:string,labelEn:string,render:(i:Institution)=>ReactNode)=><div className="comparison-row" style={columns}><div className="comparison-label">{km?labelKm:labelEn}</div>{list.map(i=><div key={i.id}>{render(i)}</div>)}</div>
  return <div className="page comparison-page"><section className="comparison-table"><div className="comparison-row comparison-header" style={columns}><div className="comparison-label">{km?'ព័ត៌មាន':'Institution'}</div>{list.map(i=><div className="comparison-institution" key={i.id}><Logo institution={i}/><div><h2>{i.nameEn}</h2><button onClick={()=>go(`/institutions/${i.id}`)}>{km?'មើលព័ត៌មានលម្អិត':'View institution'}</button></div></div>)}</div>
      {row('ឈ្មោះផ្លូវការ','Official name',i=>i.nameEn)}
      {row('ប្រភេទគ្រឹះស្ថាន','Institution category',i=><span className="detail-value"><Landmark/>{km?i.typeKm:i.typeEn}</span>)}
      {row('សមាជិក CMA','CMA membership',i=>i.cmaMember?<span className="status-value positive"><BadgeCheck/>{km?'មានក្នុងបញ្ជី':'Directory match'}</span>:<span className="status-value muted"><X/>{km?'រកមិនឃើញក្នុងបញ្ជី':'No directory match'}</span>)}
      {row('កាលបរិច្ឆេទយកទិន្នន័យ','Source retrieved',i=><span className="detail-value"><CalendarDays/>{i.checkedAt}</span>)}
      {row('ទទួលប្រាក់បញ្ញើ','Deposit-taking category',i=>i.deposits?<span className="status-value positive"><Check/>{km?'បាទ/ចាស':'Yes'}</span>:<span className="status-value muted"><X/>{km?'ទេ':'No'}</span>)}
      {row('ការផ្គូផ្គង NBC','NBC list match',i=>i.verified?<span className="status-value positive"><Check/>{km?'បានផ្គូផ្គង':'Matched'}</span>:<span className="status-value pending"><CircleHelp/>{km?'មិនទាន់ផ្ទៀងផ្ទាត់':'Not yet verified'}</span>)}
      {row('សេវាដែលបានរកឃើញ','Services found',i=>i.services.length?<div className="comparison-tags">{i.services.map(service=><span key={service}>{service}</span>)}</div>:<span className="status-value muted">{km?'មិនបានបោះពុម្ព':'Not published'}</span>)}
      {row('ផលិតផលផ្លូវការ','Official product pages',i=>i.productLinks?.length?<div className="comparison-links">{i.productLinks.slice(0,8).map(product=><a key={`${product.category}-${product.url}`} href={product.url} target="_blank" rel="noreferrer">{product.name||product.category}<ExternalLink/></a>)}{i.productLinks.length>8&&<small>+{i.productLinks.length-8} {km?'ទៀត':'more'}</small>}</div>:<span className="status-value muted">{km?'រកមិនឃើញ':'None found'}</span>)}
      {row('ទំនាក់ទំនង','Contact',i=><div className="comparison-contact">{(i.hotline||i.officialPhones?.[0])&&<span>{i.hotline||i.officialPhones?.[0]}</span>}{(i.email||i.officialEmails?.[0])&&<span>{i.email||i.officialEmails?.[0]}</span>}{!i.hotline&&!i.email&&!i.officialPhones?.length&&!i.officialEmails?.length&&(km?'មិនបានបោះពុម្ព':'Not published')}</div>)}
      {row('ពិនិត្យគេហទំព័រ','Website checked',i=><span className={`status-value ${i.websiteResearchStatus==='fetched'?'positive':'pending'}`}><CalendarDays/>{i.officialCheckedAt??(km?'មិនទាន់ពិនិត្យ':'Not checked')}</span>)}
    </section><p className="comparison-note">{km?'“មិនទាន់ផ្ទៀងផ្ទាត់” មិនមានន័យថា “គ្មានអាជ្ញាបណ្ណ” ទេ។':'“Not yet verified” does not mean “unlicensed.”'}</p>
  </div>
}
