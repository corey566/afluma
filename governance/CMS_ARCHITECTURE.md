# CMS architecture

## Public application

Next.js App Router renders published documents from Payload through the Local API. Routes use ISR with on-demand revalidation. Draft Mode and Payload Live Preview allow editors to review changes before publishing.

## Content application

Payload provides the `/admin` interface, authentication, role-based access, REST API, version history, drafts, scheduled publishing and the media library.

## Data

PostgreSQL is the system of record. Cloudflare R2 is used for production media through Payload's S3-compatible storage adapter.

## Scale

The 1,669-route architecture imports as records, not hand-coded files. New pages and articles can be created through the interface. Controlled templates and blocks keep the design coherent across services, products, work, Insights, company, careers, locations and legal content.

## Publishing safety

- Every imported route starts as draft/noindex.
- Page indexing requires approved workflow and valid evidence status.
- Insight indexing requires sources, fact-check and originality review.
- Case-study indexing requires client permission and verified evidence.
- Only verified metrics render in Metrics blocks.
- Reference-only media remains visibly restricted in the asset library.
