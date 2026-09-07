const slugs = ['privacy','terms','cookies','workforce'];
for (const slug of slugs) {
 const u = new URL('http://localhost:3001/api/pages');
 u.searchParams.set('where[slug][equals]', slug);u.searchParams.set('depth','0');
 const r=await fetch(u); const d=await r.json(); console.log(JSON.stringify({slug,status:r.status,docs:d.docs?.map(p=>({title:p.title,summary:p.summary,layout:p.layout}))}));
}
