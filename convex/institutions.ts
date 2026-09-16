import { query } from './_generated/server'
import { v } from 'convex/values'

const csxListings: Record<string, {csxSecurityType:'equity_and_bond'|'bond';csxSymbol:string}> = {
  'acleda-bank-plc': {csxSecurityType:'equity_and_bond',csxSymbol:'ABC / ABC32A–C'},
  'lolc-cambodia-plc': {csxSecurityType:'bond',csxSymbol:'LOLC31A'},
}
const publicInstitution = ({_id,_creationTime,published,updatedAt,...item}: any) => {
  const csx=csxListings[item.slug]
  return {id:item.slug,...item,csxListed:Boolean(csx),...csx,csxSourceUrl:'https://csx.com.kh/home.jsp',csxCheckedAt:'2026-09-16'}
}
export const list = query({ args:{}, handler:async ctx => (await ctx.db.query('institutions').withIndex('by_published',q=>q.eq('published',true)).collect()).map(publicInstitution) })
export const getBySlug = query({ args:{slug:v.string()}, handler:async(ctx,args)=>{const item=await ctx.db.query('institutions').withIndex('by_slug',q=>q.eq('slug',args.slug)).unique();return item?.published?publicInstitution(item):null} })
