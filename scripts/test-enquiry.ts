import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseEnquiry } from '../src/lib/enquiry-input'
import { analyzeMeiIntake } from '../src/afluma-core/intake/mei'
import { ModelRouter } from '../src/afluma-core/model-router/router'
import { RuleBasedProvider } from '../src/afluma-core/model-router/rule-based'

const base = {name:'Site QA',email:'qa@example.invalid',message:'Website project',enquiryType:'project',consent:true}
test('enquiry rejects invalid email, missing consent, unsupported type and oversized messages',()=>{
 for(const input of [{...base,email:'bad'},{...base,consent:false},{...base,enquiryType:'admin'},{...base,message:'x'.repeat(5001)},null,[]]) assert.ok('error' in parseEnquiry(input))
})
test('waitlist locks product scope and records explicit update consent',()=>{
 const result=parseEnquiry({...base,formType:'waitlist',product:'serenops'})
 assert.ok('data' in result)
 assert.match(result.data.message,/SerenOps/)
 assert.match(result.data.message,/this product only/)
 assert.equal(result.data.enquiryType,'other')
 assert.ok('error' in parseEnquiry({...base,formType:'waitlist',product:'unknown'}))
})
test('honeypot prevents storage and valid contact email is normalised',()=>{
 assert.ok('spam' in parseEnquiry({...base,honeypot:'bot'}))
 const result=parseEnquiry({...base,email:' QA@EXAMPLE.INVALID '})
 assert.ok('data' in result)
 assert.equal(result.data.email,'qa@example.invalid')
})
test('deterministic intake routes project, support and career requests to appropriate owners',async()=>{
 const router=new ModelRouter([new RuleBasedProvider()])
 for(const [enquiryType,route] of [['project','agent.yara.halo'],['support','agent.esme.echo'],['career','human']]){
  const result=await analyzeMeiIntake(router,{...base,enquiryType,message:'Please get in touch'})
  assert.equal(result.analysis.recommendedNextAgent,route)
 }
})
