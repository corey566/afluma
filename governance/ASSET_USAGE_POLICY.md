# Asset Usage Policy

## Included automatically

All unique visual files from the supplied NextSaaS image archive are registered and assigned unless classified as a dimension placeholder.

## Excluded

A raster is excluded only when it is detected as a flat grey dimension placeholder or has an explicit placeholder/demo path or filename. Every excluded record has an exclusion reason in `media-assets.json` and remains auditable.

## Restricted, not deleted

Template client logos, template brand logos and template avatars are retained because they are part of the supplied source. They are not allowed to appear as verified Afluma clients, partners, employees or testimonials.

- `replace-before-launch`: visible only in drafts or clearly labelled concept contexts
- `editorial-placeholder-only`: may support draft composition but must be replaced for team, author, testimonial or client evidence
- `production-candidate`: may be used after normal visual, licence and relevance review

## Placement

Assets are assigned by source family and route intent, then inserted into the original template media slots. Editors can replace, reorder, hide or reassign assets through Content Studio without touching code.

## Performance

Production deployment must migrate final approved files to R2, generate responsive derivatives, set width/height metadata, use lazy loading below the fold, and prevent large media from loading on every page.
