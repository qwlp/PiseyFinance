import { query } from './_generated/server'
export const list = query({ args:{}, handler:async ctx => (await ctx.db.query('glossaryTerms').withIndex('by_status',q=>q.eq('status','published')).collect()).map(({_id,_creationTime,status,updatedAt,...term})=>term) })
