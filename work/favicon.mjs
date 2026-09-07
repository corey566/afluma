import fs from 'node:fs';import sharp from 'sharp';
const png=await sharp('public/assets/brand/afluma-symbol-clean.webp').resize(48,48,{fit:'contain',background:'#ffffff'}).png().toBuffer();
const header=Buffer.alloc(22);header.writeUInt16LE(1,2);header.writeUInt16LE(1,4);header[6]=48;header[7]=48;header.writeUInt16LE(1,10);header.writeUInt16LE(32,12);header.writeUInt32LE(png.length,14);header.writeUInt32LE(22,18);fs.writeFileSync('src/app/favicon.ico',Buffer.concat([header,png]));
