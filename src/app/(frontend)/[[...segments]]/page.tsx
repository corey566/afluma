import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { RefreshRouteOnSave } from '@/components/RefreshRouteOnSave'
import { AflumaPage } from '@/afluma-site/AflumaPage'
import { getPageBySlug, normalizeSlug } from '@/lib/content'

export const revalidate = 300
export const dynamicParams = true

type Props={params:Promise<{segments?:string[]}>}

export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {segments}=await params
  const {isEnabled}=await draftMode()
  const result=await getPageBySlug(normalizeSlug(segments),isEnabled)
  if(!result) return {}
  const doc=result.doc as any
  const seo=doc.seo||{}
  const indexable=Boolean(doc.recommendedIndexable)&&doc._status==='published'
  const canonical=seo.canonicalURL||undefined
  const title=seo.title||doc.title||'Afluma'
  const description=seo.description||doc.summary||'Afluma designs, builds and operates intelligent digital systems.'
  return {
    title,
    description,
    alternates:canonical?{canonical}:undefined,
    robots:indexable?{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-video-preview':-1,'max-snippet':-1}}:{index:false,follow:true},
    openGraph:{type:'website',siteName:'Afluma',title,description,images:[{url:'/afluma-v07/generated/hero-android.png',alt:'Afluma intelligent digital systems'}]},
    twitter:{card:'summary_large_image',title,description,images:['/afluma-v07/generated/hero-android.png']},
  }
}

export default async function DynamicPage({params}:Props){
  const {segments}=await params
  const {isEnabled}=await draftMode()
  const result=await getPageBySlug(normalizeSlug(segments),isEnabled)
  if(!result) notFound()
  const doc=result.doc as any
  const schema={
    '@context':'https://schema.org',
    '@type':doc.pageType==='article'?'Article':doc.pageType==='service'?'Service':'WebPage',
    name:doc.title,
    headline:doc.title,
    description:doc.seo?.description||doc.summary,
    url:doc.seo?.canonicalURL,
    isPartOf:{'@type':'WebSite',name:'Afluma',url:'https://afluma.com'},
    publisher:{'@type':'Organization',name:'Afluma',url:'https://afluma.com'},
  }
  return <>{isEnabled?<RefreshRouteOnSave/>:null}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><AflumaPage doc={doc} kind={result.kind}/></>
}
