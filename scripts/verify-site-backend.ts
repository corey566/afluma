import assert from 'node:assert/strict'
import fs from 'node:fs'
import { getPayload } from 'payload'
import config from '../payload.config'

process.env.AFLUMA_OLLAMA_ENABLED='false'
const payload=await getPayload({config})
const testId=process.env.SITE_QA_ID || crypto.randomUUID()
const email=`site-qa-${testId}@example.invalid`
const base={name:'Afluma website QA',email,message:'Website build enquiry for automated QA',enquiryType:'project',consent:true}
const endpoint='http://localhost:3001/api/enquiry'
const submit=async(data:unknown)=>fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)})
const evidence:Record<string,unknown>={testId,createdAt:new Date().toISOString()}
let enquiryIds:(string|number)[]=[]
try {
 assert.equal((await submit({...base,email:'invalid'})).status,400)
 assert.equal((await submit({...base,consent:false})).status,400)
 const previous = await payload.count({collection:'enquiries',where:{email:{equals:email}},overrideAccess:true})
 if (!previous.totalDocs) assert.equal((await submit(base)).status,200)
 const records=await payload.find({collection:'enquiries',where:{email:{equals:email}},overrideAccess:true,depth:0})
 assert.equal(records.docs.length,1)
 enquiryIds=records.docs.map(x=>x.id)
 const enquiry=records.docs[0]
 const jobs=await payload.find({collection:'payload-jobs',limit:100,sort:'-createdAt',overrideAccess:true,depth:0})
 const job=jobs.docs.find(x=>String((x.input as {enquiryId?:string})?.enquiryId)===String(enquiry.id))
 assert.ok(job,'Enquiry should queue an intake job')
 await payload.jobs.run({id:job.id,queue:'agentic',overrideAccess:true})
 const leads=await payload.find({collection:'leads',where:{sourceEnquiryId:{equals:String(enquiry.id)}},overrideAccess:true,depth:0})
 assert.equal(leads.docs.length,1)
 assert.equal(leads.docs[0].assignedAgentId,'agent.yara.halo')
 evidence.enquiryStored=true;evidence.intakeJobProcessed=true;evidence.leadRoutedToYara=true
 const waitlist={name:base.name,email,formType:'waitlist',product:'serenops',consent:true}
 assert.equal((await submit(waitlist)).status,200)
 assert.equal((await submit(waitlist)).status,200)
 const all=await payload.find({collection:'enquiries',where:{email:{equals:email}},overrideAccess:true,depth:0})
 enquiryIds=all.docs.map(x=>x.id)
 assert.equal(all.docs.filter(x=>x.message.startsWith('Product waitlist:')).length,1)
 evidence.waitlistStored=true;evidence.repeatWaitlistDeduplicated=true
 const contacts=await payload.find({collection:'contacts',where:{email:{equals:email}},overrideAccess:true,depth:0})
 // Only records created by this uniquely identified QA run are removed.
 const qaJobs=await payload.find({collection:'payload-jobs',limit:100,sort:'-createdAt',overrideAccess:true,depth:0})
 for(const item of qaJobs.docs.filter(x=>enquiryIds.map(String).includes(String((x.input as {enquiryId?:string})?.enquiryId)))) await payload.delete({collection:'payload-jobs',id:item.id,overrideAccess:true})
 const runs=await payload.find({collection:'agent-runs',limit:100,sort:'-createdAt',overrideAccess:true,depth:0})
 for(const run of runs.docs.filter(x=>enquiryIds.map(String).includes(String((x.input as {enquiryId?:string})?.enquiryId)))) {
  const audits=await payload.find({collection:'audit-events',where:{correlationId:{equals:run.correlationId}},overrideAccess:true})
  for(const audit of audits.docs) await payload.delete({collection:'audit-events',id:audit.id,overrideAccess:true})
  await payload.delete({collection:'agent-runs',id:run.id,overrideAccess:true})
 }
 for(const lead of leads.docs) await payload.delete({collection:'leads',id:lead.id,overrideAccess:true})
 for(const contact of contacts.docs) await payload.delete({collection:'contacts',id:contact.id,overrideAccess:true})
 for(const id of enquiryIds) await payload.delete({collection:'enquiries',id,overrideAccess:true})
 evidence.qaRecordsCleaned=true
 fs.writeFileSync('work/backend-validation.json',JSON.stringify(evidence,null,2))
 console.log(JSON.stringify(evidence,null,2))
 process.exit(0)
} catch(error){console.error(error);console.error('QA identifier (for inspection):',testId);process.exit(1)}


