# Afluma Production Website v0.4 — Source Fidelity Rebuild

This release replaces the loosely inspired interface approach with a source-faithful React and Payload CMS architecture.

## What is preserved from the supplied NextSaaS source

- Original page hierarchy and section ordering
- Original Tailwind class names and responsive rules
- Original data attributes and animation hooks
- Original compiled family CSS, JavaScript, vendor files, fonts and videos
- 158 source page templates
- 565 reusable source component partials
- Creative Portfolio, AI Agency, Automation SaaS and App Development families

The exact trusted markup is compiled into `source-fidelity/templates` and rendered through React by `SourceTemplatePage` and `ExactSourceMarkup`. The Afluma React header, footer, accessibility layer and CMS replace the original demo shell.

## Media coverage

The complete user-supplied NextSaaS image archive was deduplicated and classified.

- 1,544 unique assets
- 1,354 production candidates
- 127 template avatars retained only as editorial placeholders
- 47 template/client/logo records retained but blocked from public trust claims until replaced
- 16 grey dimension-placeholder images excluded
- 1,528 eligible/restricted assets extracted to `public/source-media`
- Every eligible asset assigned to at least one of the 1,669 website routes

The site does not represent template logos, avatars, metrics or demo material as real Afluma evidence. Those records remain manageable in Content Studio and are marked for replacement or approval.

## No-code management

Payload Content Studio now includes:

- Source Templates
- Source Asset Library
- Clients
- Client Projects
- Page-level template selection
- Page-level source slot overrides
- Page-level asset assignments
- Media approval and exclusion status
- Client permissions and approved public uses
- Verified client-project metrics and evidence status

## Commands

```powershell
npm install
npm run catalog:source
npm run verify:source-fidelity
npm run import:architecture
npm run import:source
npm run dev
```

The public site is available at `http://localhost:3000` and Content Studio at `http://localhost:3000/admin`.

## Important production gate

The source-fidelity catalog and Python validations pass. A complete Next.js/Payload build still needs to be run after installing dependencies and configuring PostgreSQL. R2 migration, image optimization, browser testing and live performance testing remain deployment tasks.
