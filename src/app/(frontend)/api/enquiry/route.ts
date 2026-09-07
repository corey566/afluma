import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export async function POST(request:Request){
  try{
    const body=await request.json() as Record<string,unknown>
    if(String(body.honeypot||'').trim()) return NextResponse.json({ok:true})
    const name=String(body.name||'').trim()
    const email=String(body.email||'').trim()
    const message=String(body.message||'').trim()
    const consent=String(body.consent||'')==='true'||body.consent===true
    if(!name||!email||!message||!consent) return NextResponse.json({error:'Missing required fields'},{status:400})
    const payload=await getPayload({config})
    await payload.create({collection:'enquiries',overrideAccess:true,data:{name,email,company:String(body.company||'').trim(),enquiryType:String(body.enquiryType||'project') as any,message,consent:true,honeypot:'',status:'new'}})
    return NextResponse.json({ok:true})
  }catch(error){console.error('Afluma enquiry error',error);return NextResponse.json({error:'Unable to submit enquiry'},{status:500})}
}
