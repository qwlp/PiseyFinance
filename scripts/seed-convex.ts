import { ConvexHttpClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'
import { institutions, glossary } from '../src/data'

const url=process.env.CONVEX_URL??process.env.VITE_CONVEX_URL
if(!url)throw new Error('Set CONVEX_URL or VITE_CONVEX_URL before seeding')
const client=new ConvexHttpClient(url)
const seed=makeFunctionReference<'mutation',{institutions:typeof institutions;glossary:typeof glossary},{institutions:number;glossary:number}>('seed:batch')
for(let offset=0;offset<institutions.length;offset+=25)console.log(await client.mutation(seed,{institutions:institutions.slice(offset,offset+25),glossary:offset===0?glossary:[]}))
