import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const must = (p) => { if (!fs.existsSync(p)) throw new Error(`Missing expected project file: ${p}`); };
const srcComponent = path.join(project, 'src', 'components', 'CertificationSection.tsx');
const css = path.join(project, 'src', 'reference-ui.css');
const assetDir = path.join(project, 'public', 'assets', 'certifications');
must(srcComponent); must(css);

const stamp = new Date().toISOString().replace(/[.:]/g, '-');
const backup = path.join(project, `.footer-cert-logos-5.1.1-backup-${stamp}`);
fs.mkdirSync(path.join(backup, 'src', 'components'), { recursive: true });
fs.mkdirSync(path.join(backup, 'src'), { recursive: true });
fs.copyFileSync(srcComponent, path.join(backup, 'src', 'components', 'CertificationSection.tsx'));
fs.copyFileSync(css, path.join(backup, 'src', 'reference-ui.css'));

fs.copyFileSync(path.join(here, 'CertificationSection.tsx'), srcComponent);
fs.mkdirSync(assetDir, { recursive: true });
for (const name of ['ggtl.png','cgl.png','eg-lab.png','lanka-gem-lab.png','international-labs-reference.png']) {
  fs.copyFileSync(path.join(here, 'assets', name), path.join(assetDir, name));
}

let cssText = fs.readFileSync(css, 'utf8');
const marker = '/* === FOOTER CERT LOGOS 5.1.1 === */';
if (!cssText.includes(marker)) cssText += fs.readFileSync(path.join(here, 'footer-cert-logos-5.1.1.css'), 'utf8');
fs.writeFileSync(css, cssText);

console.log('Footer certification logos 5.1.1 applied.');
console.log(`Backup: ${backup}`);
console.log('Supplied certification logos are now visible inside the footer certification section.');
