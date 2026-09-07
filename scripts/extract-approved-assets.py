#!/usr/bin/env python3
from pathlib import Path, PurePosixPath
from zipfile import ZipFile
import json, shutil

ROOT=Path(__file__).resolve().parents[1]
ARCHIVE=Path('/mnt/data/afluma_source_rebuild/nexsas-images-reconstructed.zip')
CATALOG=ROOT/'source-fidelity/catalog/media-assets.json'
DEST=ROOT/'public/source-media'
DEST.mkdir(parents=True,exist_ok=True)
assets=json.loads(CATALOG.read_text())
with ZipFile(ARCHIVE) as zf:
    for index,a in enumerate(assets,1):
        if a['status']=='excluded':
            a['publicPath']=None
            continue
        src=a['canonicalPath']
        parts=PurePosixPath(src).parts
        try: start=parts.index('nexsas-images')+1
        except ValueError: start=0
        rel=PurePosixPath(*parts[start:])
        target=DEST/Path(*rel.parts)
        target.parent.mkdir(parents=True,exist_ok=True)
        if not target.exists() or target.stat().st_size == 0:
            with zf.open(src) as rf, target.open('wb') as wf: shutil.copyfileobj(rf,wf,1024*1024)
        a['publicPath']='/source-media/'+str(rel).replace('\\','/')
        if index%200==0: print(f'extracted {index}/{len(assets)}')
CATALOG.write_text(json.dumps(assets,indent=2))
print(f'Extracted {sum(bool(a.get("publicPath")) for a in assets)} approved/restricted assets to {DEST}')
