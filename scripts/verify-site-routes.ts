import assert from 'node:assert/strict'
import fs from 'node:fs'
import { pages, workforce, products, aliases } from '../src/site/content'
const base=process.env.SITE_TEST_URL || 'http://localhost:3001'
const paths=[...pages.map(p=>p.slug),...workforce.map(p=>'workforce/'+p.slug),...products.map(p=>'launch/'+p.slug),'privacy','terms','cookies']
const report:unknown[]=[]
for(const slug of paths){
 const response=await fetch(base+'/'+slug)
 const html=await response.text()
 assert.equal(response.status,200,slug)
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'One heading: '+slug)
 assert.match(html,/<title>[^<]+<\/title>/,'Title: '+slug)
 if(!['privacy','terms','cookies'].includes(slug)) assert.match(html,/name="description" content="[^"]+"/,'Description: '+slug)
 if(pages.some(p=>p.slug===slug)||slug.startsWith('workforce/')) assert.ok(html.includes('rel="canonical" href="https://afluma.com/'),'Canonical: '+slug)
 if(pages.some(p=>p.slug===slug)) assert.match(html,/application\/ld\+json/,'Structured data: '+slug)
 report.push({route:'/'+slug,status:response.status,h1:1})
}
for(const [from,to] of Object.entries(aliases)){
 const response=await fetch(base+'/'+from,{redirect:'manual'})
 assert.equal(response.status,308,'Redirect: '+from)
 assert.equal(response.headers.get('location'),'/'+to)
}
const missing=await fetch(base+'/this-route-does-not-exist-qa')
assert.equal(missing.status,404)
for(const path of ['/icon.png','/apple-icon.png','/favicon.ico','/robots.txt','/sitemap.xml','/manifest.webmanifest']) assert.equal((await fetch(base+path)).status,200,path)
const sitemap=await (await fetch(base+'/sitemap.xml')).text()
assert.ok(!sitemap.includes('localhost'))
assert.ok(!sitemap.includes('/launch/'))
const direct=await fetch(base+'/api/enquiries',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({})})
assert.ok([401,403].includes(direct.status),'Direct public enquiry writes must be denied')
fs.writeFileSync('work/route-validation.json',JSON.stringify({base,validated:report.length,aliases:Object.keys(aliases).length,metadataAndAssets:true,directEnquiryWritesBlocked:true,routes:report},null,2))
console.log(JSON.stringify({validated:report.length,aliases:Object.keys(aliases).length,metadataAndAssets:true,directEnquiryWritesBlocked:true}))
