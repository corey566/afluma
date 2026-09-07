import {getPayload} from 'payload';import config from '../payload.config';
const p=await getPayload({config});
const e=await p.find({collection:'enquiries',where:{email:{equals:'site-qa-89f9b751-acfb-447f-8a0e-f5297cd3d6a8@example.invalid'}},overrideAccess:true});
const jobs=await p.find({collection:'payload-jobs',limit:100,sort:'-createdAt',overrideAccess:true});
const j=jobs.docs.find(x=>String(x.input?.enquiryId)===String(e.docs[0]?.id));
console.log(JSON.stringify({enquiryId:e.docs[0]?.id,job:j},null,2));process.exit(0);
