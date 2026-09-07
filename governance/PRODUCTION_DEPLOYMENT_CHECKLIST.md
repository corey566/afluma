# Production deployment checklist

## Infrastructure
- [ ] Production PostgreSQL created with point-in-time recovery or daily backups.
- [ ] `DATABASE_URL` stored in deployment secrets.
- [ ] `PAYLOAD_SECRET`, `PREVIEW_SECRET`, and `REVALIDATE_SECRET` generated independently.
- [ ] Cloudflare R2 bucket and custom media domain configured.
- [ ] R2 CORS allows uploads from the production admin origin.
- [ ] DNS and TLS configured for `afluma.com`.

## Content interface
- [ ] First administrator created manually.
- [ ] Editor accounts use individual logins; no shared administrator account.
- [ ] Architecture import completed and counts verified at 1,669.
- [ ] Header, footer and site settings reviewed.
- [ ] Media licences and production status reviewed.

## Forms
- [ ] Turnstile added and server-side verified.
- [ ] Enquiry email adapter configured.
- [ ] Rate limiting added at Cloudflare and application levels.
- [ ] Privacy consent wording legally reviewed.

## Quality
- [ ] Final logo vector assets installed.
- [ ] Reference-only videos replaced or licensed.
- [ ] Real team/product/case-study evidence added.
- [ ] Keyboard and screen-reader tests completed.
- [ ] Lighthouse and Core Web Vitals measured on deployed pages.
- [ ] Browser tests completed for current Chrome, Edge, Safari and Firefox.
- [ ] Security headers and CSP reviewed against deployed integrations.
- [ ] Backup restore tested.
