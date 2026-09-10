import { query } from './_generated/server'
import { v } from 'convex/values'

const publicInstitution = ({_id,_creationTime,published,updatedAt,...item}: any) => ({ id:item.slug, ...item })
export const list = query({ args:{}, handler:async ctx => (await ctx.db.query('institutions').withIndex('by_published',q=>q.eq('published',true)).collect()).map(publicInstitution) })
export const getBySlug = query({ args:{slug:v.string()}, handler:async(ctx,args)=>{const item=await ctx.db.query('institutions').withIndex('by_slug',q=>q.eq('slug',args.slug)).unique();return item?.published?publicInstitution(item):null} })
