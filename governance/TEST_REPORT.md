# Afluma v0.3 CMS validation report

## Passed locally

- Architecture records: **1,669**
- Unique route slugs: **1,669**
- Legacy static route validation: **1,669 pages, 0 detected errors**
- TypeScript/TSX files parsed for syntax: **49 files, 0 syntax errors**
- Local import-path scan: **0 missing local modules**
- CMS collections: **15**
- CMS globals: **5**
- Approved reusable page blocks: **17**
- Simple editorial roles: **6**
- Import policy: every architecture record starts as a draft and `noindex`

## Not executed in this environment

The environment could not download npm dependencies from its package registry, so the following must run in the deployment environment:

- `npm install`
- `npm run generate:importmap`
- `npm run generate:types`
- `npm run build`
- Payload migrations against the production PostgreSQL database
- R2 upload and CORS validation
- Live Preview browser validation against the running CMS
- Form delivery, Turnstile, rate-limiting and email notification tests
- Deployed accessibility, Lighthouse, cross-browser and security tests

No claim is made that the uninstalled Next.js/Payload application has passed a production build in this container. The source scaffold and static fallback have been validated to the extent listed above.
