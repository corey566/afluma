import sharp from 'sharp';
await sharp('public/assets/brand/afluma-symbol-clean.webp').resize(192,192,{fit:'contain',background:'#faf9f6'}).png().toFile('src/app/icon.png');
await sharp('public/assets/brand/afluma-symbol-clean.webp').resize(180,180,{fit:'contain',background:'#faf9f6'}).png().toFile('src/app/apple-icon.png');
