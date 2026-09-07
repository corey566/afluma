#!/usr/bin/env python3
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
cat=root/'source-fidelity/catalog'
assets=json.loads((cat/'media-assets.json').read_text())
assign=json.loads((cat/'asset-assignments.json').read_text())
routes=json.loads((cat/'route-template-map.json').read_text())
source_pages=json.loads((cat/'source-pages.json').read_text())
source_components=json.loads((cat/'source-components.json').read_text())
assigned={x['assetId'] for x in assign}
eligible={x['assetId'] for x in assets if x['status']!='excluded'}
errors=[]
if eligible-assigned: errors.append(f'{len(eligible-assigned)} eligible assets are unassigned')
if len(routes)!=1669: errors.append(f'Expected 1669 route mappings, got {len(routes)}')
if any(not r.get('sourceTemplateKey') for r in routes): errors.append('One or more routes lack a source template')
if any(a['status']=='excluded' and not a.get('exclusionReason') for a in assets): errors.append('Excluded asset missing reason')
if len(source_pages) < 150: errors.append(f'Expected at least 150 source pages, got {len(source_pages)}')
if len(source_components) < 500: errors.append(f'Expected at least 500 source components, got {len(source_components)}')
summary={
 'passed':not errors,'errors':errors,'uniqueAssets':len(assets),'eligibleAssets':len(eligible),
 'excludedAssets':sum(a['status']=='excluded' for a in assets),'assetAssignments':len(assign),
 'routesMapped':len(routes),'sourcePages':len(source_pages),'sourceComponents':len(source_components)
}
(root/'governance/SOURCE_FIDELITY_TEST_RESULTS.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
raise SystemExit(1 if errors else 0)
