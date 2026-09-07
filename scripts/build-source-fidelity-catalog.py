#!/usr/bin/env python3
from __future__ import annotations

import json, re, csv, hashlib, html, os
from collections import defaultdict
from pathlib import Path, PurePosixPath
from zipfile import ZipFile, ZipInfo
from io import BytesIO
from PIL import Image

PROJECT = Path(__file__).resolve().parents[1]
CATALOG = PROJECT / 'source-fidelity' / 'catalog'
TEMPLATES_OUT = PROJECT / 'source-fidelity' / 'templates'
CATALOG.mkdir(parents=True, exist_ok=True)
TEMPLATES_OUT.mkdir(parents=True, exist_ok=True)

IMAGE_ARCHIVE = Path(os.environ.get(
    'AFLUMA_IMAGE_ARCHIVE',
    PROJECT / 'source-archives' / 'nexsas-images-reconstructed.zip',
))
PAGES_JSON = PROJECT / 'content' / 'pages.json'

# All source roots are project-local so the catalog works on Windows, macOS and Linux.
SOURCE_FAMILIES = {
    'creative-portfolio': PROJECT / 'source-fidelity' / 'reference' / 'creative-portfolio',
    'ai-agency': PROJECT / 'source-fidelity' / 'reference' / 'ai-agency',
    'automation-saas': PROJECT / 'source-fidelity' / 'reference' / 'automation-saas-tailwind',
    'app-development': PROJECT / 'source-fidelity' / 'reference' / 'app-development-production',
}

COMP_RE = re.compile(r'<Component\s+src=["\']([^"\']+)["\']\s*/>', re.I)
IMG_RE = re.compile(r'(?:src|href)=["\'](?:\./)?(?:public/)?images/([^"\']+)["\']', re.I)


def slugify(s: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')


def resolve_component(root: Path, source: str, stack: tuple[str, ...] = ()) -> str:
    source = source.replace('\\', '/')
    p = root / source
    if not p.exists():
        # Some Component paths are root-relative with src/ prefix from a page nested elsewhere.
        p = root / source.lstrip('./')
    if not p.exists():
        return f'<!-- unresolved component: {html.escape(source)} -->'
    rel = str(p.relative_to(root)).replace('\\', '/')
    if rel in stack:
        return f'<!-- circular component: {html.escape(rel)} -->'
    text = p.read_text(encoding='utf-8', errors='ignore')
    return COMP_RE.sub(lambda m: resolve_component(root, m.group(1), stack + (rel,)), text)


def scan_sources():
    pages = []
    components = []
    for family, root in SOURCE_FAMILIES.items():
        if not root.exists():
            continue
        fam_out = TEMPLATES_OUT / family
        fam_out.mkdir(parents=True, exist_ok=True)
        for p in sorted(root.rglob('*.htm')):
            if '__MACOSX' in p.parts or p.name.startswith('._'):
                continue
            rel = str(p.relative_to(root)).replace('\\', '/')
            raw = p.read_text(encoding='utf-8', errors='ignore')
            resolved = COMP_RE.sub(lambda m: resolve_component(root, m.group(1), (rel,)), raw)
            for folder in ('images','video','videos','fonts','vendor','assets'):
                resolved = resolved.replace(f'./{folder}/', f'/nexsas-runtime/{family}/{folder}/')
                resolved = resolved.replace(f'../{folder}/', f'/nexsas-runtime/{family}/{folder}/')
            out_name = slugify(rel) + '.html'
            (fam_out / out_name).write_text(resolved, encoding='utf-8')
            components.append({
                'key': f'{family}:{rel}', 'family': family, 'sourcePath': rel,
                'resolvedPath': str((fam_out / out_name).relative_to(PROJECT)).replace('\\','/'),
                'sourceBytes': p.stat().st_size, 'imageRefs': sorted(set(IMG_RE.findall(resolved))),
                'animationHooks': sorted(set(re.findall(r'data-ns-[a-z0-9-]+|data-[a-z0-9-]+', resolved))),
            })
        # Source packages have tiny page files; production app-development has compiled full HTML.
        for p in sorted(root.glob('*.html')):
            if p.name.startswith('._'):
                continue
            rel = p.name
            raw = p.read_text(encoding='utf-8', errors='ignore')
            resolved = COMP_RE.sub(lambda m: resolve_component(root, m.group(1), (rel,)), raw)
            # Strip document shell; keep body for React rendering.
            body_match = re.search(r'<body[^>]*>(.*)</body>', resolved, flags=re.I|re.S)
            body = body_match.group(1) if body_match else resolved
            # Afluma owns the global React header/footer. Remove the source shell but keep exact page sections.
            body = re.sub(r'<header\b[^>]*>.*?</header>', '', body, flags=re.I|re.S)
            body = re.sub(r'<footer\b[^>]*>.*?</footer>', '', body, flags=re.I|re.S)
            body = re.sub(r'(?i)Nexsas|NextSaaS|Next Sass', 'Afluma', body)
            body = re.sub(r'<h1(\s|>)', r'<h1 data-afluma-slot="title"\1', body, count=1, flags=re.I)
            body = re.sub(r'<p(\s|>)', r'<p data-afluma-slot="summary"\1', body, count=1, flags=re.I)
            body = re.sub(r'<a(\s+[^>]*?href=["\'][^"\']+["\'][^>]*)>', r'<a data-afluma-slot="primary-action"\1>', body, count=1, flags=re.I)
            body = re.sub(r'<img(\s+[^>]*?src=["\'](?![^"\']*(?:logo|icon|badge))[^"\']+["\'][^>]*)>', r'<img data-afluma-slot="primary-media"\1>', body, count=1, flags=re.I)
            body = re.sub(r'<video(\s|>)', r'<video data-afluma-slot="primary-video"\1', body, count=1, flags=re.I)
            for folder in ('images','video','videos','fonts','vendor','assets'):
                body = body.replace(f'./{folder}/', f'/nexsas-runtime/{family}/{folder}/')
                body = body.replace(f'../{folder}/', f'/nexsas-runtime/{family}/{folder}/')
            out_name = slugify(p.stem) + '.html'
            (fam_out / out_name).write_text(body, encoding='utf-8')
            pages.append({
                'key': f'{family}:{p.stem}', 'family': family, 'page': p.stem,
                'sourcePath': rel, 'resolvedPath': str((fam_out / out_name).relative_to(PROJECT)).replace('\\','/'),
                'sourceBytes': p.stat().st_size, 'componentIncludes': COMP_RE.findall(raw),
                'imageRefs': sorted(set(IMG_RE.findall(body))),
                'animationHooks': sorted(set(re.findall(r'data-ns-[a-z0-9-]+|data-[a-z0-9-]+', body))),
            })
    (CATALOG / 'source-pages.json').write_text(json.dumps(pages, indent=2), encoding='utf-8')
    (CATALOG / 'source-components.json').write_text(json.dumps(components, indent=2), encoding='utf-8')
    return pages, components


def placeholder_dimension(zf: ZipFile, info: ZipInfo) -> bool:
    p = PurePosixPath(info.filename)
    if p.suffix.lower() not in {'.png','.jpg','.jpeg','.webp'} or info.file_size > 12000:
        return False
    try:
        with zf.open(info) as fp:
            im = Image.open(fp)
            w, h = im.size
            if w < 100 or h < 100:
                return False
            thumb = im.convert('RGB')
            thumb.thumbnail((128,128))
            colors = thumb.getcolors(maxcolors=64)
            if not colors or len(colors) > 16:
                return False
            # Dimension placeholders are flat grey with black text and almost no chroma.
            chroma = 0
            total = 0
            for count, rgb in colors:
                chroma += count * (max(rgb)-min(rgb))
                total += count
            avg_chroma = chroma / max(total,1)
            return avg_chroma < 4
    except Exception:
        return False


def family_from_path(path: str) -> str:
    parts = PurePosixPath(path).parts
    try:
        idx = parts.index('nexsas-images')
        return parts[idx+1]
    except Exception:
        return parts[0] if parts else 'unknown'


def asset_kind(path: str) -> str:
    n = PurePosixPath(path).name.lower()
    if 'avatar' in n: return 'avatar'
    if 'client-logo' in n: return 'client-logo'
    if '/icons/' in path.lower() or n.startswith('icon-'): return 'icon'
    if '/logo/' in path.lower() or 'logo' in n: return 'logo'
    if 'gradient' in path.lower(): return 'gradient'
    if PurePosixPath(path).suffix.lower() == '.svg': return 'vector'
    return 'image'


def scan_assets():
    # The production download ships the verified media catalog separately from the
    # original multi-gigabyte archive. Reuse that catalog when the optional archive
    # is not present, and verify that the extracted public media directory exists.
    if not IMAGE_ARCHIVE.exists():
        existing_catalog = CATALOG / 'media-assets.json'
        media_root = PROJECT / 'public' / 'source-media'
        if not existing_catalog.exists():
            raise FileNotFoundError(
                f'Missing both image archive ({IMAGE_ARCHIVE}) and media catalog ({existing_catalog}).'
            )
        if not media_root.exists():
            raise FileNotFoundError(
                f'Media catalog exists, but extracted media is missing at {media_root}. '
                'Extract the NextSaaS media package into public/source-media first.'
            )
        assets = json.loads(existing_catalog.read_text(encoding='utf-8'))
        missing = []
        for asset in assets:
            public_path = asset.get('publicPath')
            if not public_path or asset.get('status') == 'excluded':
                continue
            local_path = PROJECT / 'public' / public_path.lstrip('/').replace('/', os.sep)
            if not local_path.exists():
                missing.append(public_path)
        if missing:
            sample = '\n'.join(missing[:10])
            raise FileNotFoundError(
                f'{len(missing)} catalogued media files are missing under public/source-media. '
                f'First missing paths:\n{sample}'
            )
        return assets

    unique = {}
    duplicates = defaultdict(list)
    excluded = []
    with ZipFile(IMAGE_ARCHIVE) as zf:
        infos = [i for i in zf.infolist() if not i.is_dir() and '__MACOSX' not in i.filename]
        infos = [i for i in infos if PurePosixPath(i.filename).suffix.lower() in {'.png','.jpg','.jpeg','.webp','.svg','.gif','.avif'}]
        for info in infos:
            key = f'{info.CRC:08x}:{info.file_size}'
            duplicates[key].append(info.filename)
            if key in unique:
                continue
            reason = None
            status = 'production-candidate'
            if re.search(r'(^|/)(demo|placeholder|placeholders|dimensions?)(/|$)', info.filename, re.I):
                reason = 'demo-or-placeholder-path'
            elif re.search(r'(placeholder|\bgray\b|\bgrey\b|dimension)', PurePosixPath(info.filename).stem, re.I):
                reason = 'placeholder-filename'
            elif placeholder_dimension(zf, info):
                reason = 'dimension-placeholder-image'
            kind = asset_kind(info.filename)
            if reason:
                status = 'excluded'
            elif kind in {'client-logo','logo'}:
                status = 'replace-before-launch'
            elif kind == 'avatar':
                status = 'editorial-placeholder-only'
            item = {
                'assetId': 'NSA-' + key.replace(':','-'),
                'canonicalPath': info.filename,
                'family': family_from_path(info.filename),
                'kind': kind,
                'extension': PurePosixPath(info.filename).suffix.lower().lstrip('.'),
                'bytes': info.file_size,
                'crc32': f'{info.CRC:08x}',
                'status': status,
                'exclusionReason': reason,
                'duplicatePaths': [],
                'sourceArchive': IMAGE_ARCHIVE.name,
                'licenseStatus': 'User-supplied NextSaaS source; retain purchase/license documentation.',
            }
            unique[key] = item
        for key, paths in duplicates.items():
            if key in unique:
                unique[key]['duplicatePaths'] = paths[1:]
    assets = list(unique.values())
    assets.sort(key=lambda x:(x['family'],x['canonicalPath']))
    (CATALOG / 'media-assets.json').write_text(json.dumps(assets, indent=2), encoding='utf-8')
    with (CATALOG / 'media-assets.csv').open('w', newline='', encoding='utf-8-sig') as fp:
        fields = ['assetId','canonicalPath','family','kind','extension','bytes','crc32','status','exclusionReason','sourceArchive','licenseStatus','duplicateCount']
        wr = csv.DictWriter(fp, fieldnames=fields); wr.writeheader()
        for a in assets:
            row = {k:a.get(k) for k in fields}; row['duplicateCount']=len(a['duplicatePaths']); wr.writerow(row)
    return assets


FAMILY_KEYWORDS = {
    'financial-management-platform': ['finance','financial','accounting','payments','banking','reconciliation'],
    'automation-saas': ['automation','operations','workflow','managed','process'],
    'ai-agency': ['ai','artificial-intelligence','automation','software','strategy'],
    'ai-application': ['ai','application','software','product','platform'],
    'ai-marketing': ['marketing','growth','seo','content','customer'],
    'ai-saas-software': ['saas','software','platform','cloud','product'],
    'ai-solution': ['ai','solution','automation','industry'],
    'ai-keyword-generator': ['seo','keyword','content','growth','insights'],
    'ai-resume-builder': ['careers','jobs','talent','people'],
    'ai-voice-generator': ['voice','customer','experience','media','content'],
    'neural-netwokrs': ['ai','data','analytics','machine-learning','security'],
    'nexsas-1-to-37': ['service','solution','product','insights','about'],
}


def choose_routes(family: str, pages: list[dict]) -> list[dict]:
    kws = FAMILY_KEYWORDS.get(family, ['service','solution','insights'])
    matches=[]
    for p in pages:
        hay = (' '.join([p.get('slug',''),p.get('url_path',''),p.get('Page Type',''),p.get('Section',''),p.get('Pillar',''),p.get('Topic Cluster',''),p.get('H1 / Page Title','')])).lower()
        if any(k in hay for k in kws): matches.append(p)
    return matches or pages


def assign_assets(assets):
    pages = json.loads(PAGES_JSON.read_text(encoding='utf-8'))
    by_family=defaultdict(list)
    for a in assets:
        if a['status']!='excluded': by_family[a['family']].append(a)
    assignments=[]
    slots_by_kind={
        'image':['hero-media','feature-media','editorial-card','case-study-media','background-media'],
        'gradient':['background-media','section-transition','cta-media'],
        'vector':['icon-illustration','decorative-vector','diagram-media'],
        'icon':['component-icon'],
        'avatar':['editorial-avatar','author-placeholder'],
        'client-logo':['client-logo-placeholder'],
        'logo':['template-logo-reference'],
    }
    for family, fam_assets in sorted(by_family.items()):
        routes = choose_routes(family, pages)
        for idx,a in enumerate(fam_assets):
            p=routes[idx % len(routes)]
            slots=slots_by_kind.get(a['kind'],['feature-media'])
            slot=slots[(idx//max(1,len(routes)))%len(slots)]
            assignments.append({
                'assetId':a['assetId'],'route':p.get('url_path') or '/', 'pageId':p.get('Page ID'),
                'slot':slot,'family':family,'status':a['status'],
                'publicUseAllowed':a['status']=='production-candidate',
                'note': 'Must be replaced with verified real evidence before launch.' if a['status'] in {'replace-before-launch','editorial-placeholder-only'} else '',
            })
    (CATALOG / 'asset-assignments.json').write_text(json.dumps(assignments, indent=2), encoding='utf-8')
    with (CATALOG / 'asset-assignments.csv').open('w',newline='',encoding='utf-8-sig') as fp:
        fields=['assetId','route','pageId','slot','family','status','publicUseAllowed','note']
        w=csv.DictWriter(fp,fieldnames=fields);w.writeheader();w.writerows(assignments)
    return pages, assignments


def build_template_route_map(source_pages, pages):
    # Template choice preserves the complete source page library while mapping it to the Afluma architecture.
    page_types={
        'Home':'index','Service Hub':'services','Service Detail':'service-details','Solution Hub':'use-case',
        'Solution Detail':'service-details','Industry':'use-case','Product Hub':'features','Product':'features',
        'Work Hub':'case-study','Case Study':'case-study-details','Insights Hub':'blog','Insight Article':'blog-details',
        'About':'about','Team':'team','Career Hub':'career','Career Detail':'career-details','Contact':'contact',
        'Location':'contact','Legal':'legal','Utility':'404'
    }
    by_family=defaultdict(dict)
    for s in source_pages: by_family[s['family']][s['page']]=s['key']
    family_cycle=['creative-portfolio','ai-agency','app-development','automation-saas']
    route_map=[]
    for idx,p in enumerate(pages):
        family=family_cycle[idx%len(family_cycle)]
        wanted=page_types.get(p.get('Page Type',''), 'index')
        key=by_family.get(family,{}).get(wanted) or by_family.get(family,{}).get('index')
        # Primary public design is creative portfolio; automation/AI structures are used for technical pages.
        text=(' '.join([p.get('url_path',''),p.get('H1 / Page Title',''),p.get('Pillar','')])).lower()
        if any(k in text for k in ['automation','ai ','artificial intelligence','managed operations']): family='automation-saas'; key=by_family.get(family,{}).get(wanted) or by_family.get(family,{}).get('index')
        elif any(k in text for k in ['software','product','platform','commerce','serenops']): family='app-development'; key=by_family.get(family,{}).get(wanted) or by_family.get(family,{}).get('index')
        elif p.get('Page Type') in {'About','Team','Career Hub','Career Detail','Work Hub','Case Study'}: family='creative-portfolio'; key=by_family.get(family,{}).get(wanted) or by_family.get(family,{}).get('index')
        route_map.append({'route':p.get('url_path') or '/','pageId':p.get('Page ID'),'pageType':p.get('Page Type'),'sourceFamily':family,'sourceTemplateKey':key,'indexable':p.get('indexable',False)})
    (CATALOG/'route-template-map.json').write_text(json.dumps(route_map,indent=2),encoding='utf-8')
    with (CATALOG/'route-template-map.csv').open('w',newline='',encoding='utf-8-sig') as fp:
        fields=['route','pageId','pageType','sourceFamily','sourceTemplateKey','indexable'];w=csv.DictWriter(fp,fieldnames=fields);w.writeheader();w.writerows(route_map)
    return route_map


def summary(source_pages, components, assets, pages, assignments, route_map):
    status=defaultdict(int)
    for a in assets: status[a['status']]+=1
    s={
        'sourceFamilies':list(SOURCE_FAMILIES), 'sourcePages':len(source_pages), 'sourceComponents':len(components),
        'uniqueMediaAssets':len(assets), 'assetStatusCounts':dict(status), 'architectureRoutes':len(pages),
        'assetAssignments':len(assignments), 'routesWithTemplates':len(route_map),
        'unassignedEligibleAssets':len({a['assetId'] for a in assets if a['status']!='excluded'}-{a['assetId'] for a in assignments}),
        'routesWithoutTemplate':sum(1 for r in route_map if not r['sourceTemplateKey']),
    }
    (CATALOG/'build-summary.json').write_text(json.dumps(s,indent=2),encoding='utf-8')
    return s

if __name__=='__main__':
    sp, comps=scan_sources()
    assets=scan_assets()
    pages, assignments=assign_assets(assets)
    route_map=build_template_route_map(sp,pages)
    print(json.dumps(summary(sp,comps,assets,pages,assignments,route_map),indent=2))
