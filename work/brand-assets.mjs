import sharp from 'sharp';
const input = 'public/assets/brand/afluma-logo.png';
const m=await sharp(input).metadata();
console.log(m.width,m.height);
await sharp(input).extract({left:0,top:590,width:940,height:111}).resize({width:392}).webp({quality:95}).toFile('public/assets/brand/afluma-wordmark.webp');
await sharp(input).extract({left:166,top:0,width:650,height:550}).resize({width:780}).webp({quality:92}).toFile('public/assets/brand/afluma-symbol-clean.webp');
