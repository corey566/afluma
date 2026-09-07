# Automation SaaS – Nexsas

A modern, responsive HTML template for AI, SaaS, and tech products. Built with **Nexsas** branding, this project uses a component-based architecture and Tailwind CSS.

## Features

- Multi-page HTML template structure
- Component-based architecture via `<Component>` tags
- Tailwind CSS v4 utility-first styling
- Vite for fast local development and production builds
- Vanilla JavaScript animations/utilities

## Project structure

```text
automation-saas-tailwind/
├── public/                     # Static assets
├── src/
│   ├── components/             # Reusable and page-specific partials
│   ├── js/
│   │   ├── animation/          # Animation scripts
│   │   └── utils/              # Utility scripts
│   ├── styles/                 # Tailwind and project styles
│   └── main.js                 # JS entry
├── *.html                      # Root HTML pages
├── package.json
├── vite.config.js
└── README.md
```

## Prerequisites

- Node.js (v18+ recommended)
- npm, bun, or yarn

## Installation

```bash
npm install
# or
bun install
# or
yarn install
```

## Development

```bash
npm run dev
# or
bun run dev
# or
yarn dev
```

Runs on localhost (default Vite port, or next available).

## Build

```bash
npm run build
# or
bun run build
# or
yarn build
```

Build output is generated in `dist/`.

## Preview

```bash
npm run preview
# or
bun run preview
# or
yarn preview
```

## Customization

### Using components

Pages include shared parts like:

```html
<Component src="src/components/shared/head-link.htm" />
<Component src="src/components/shared/layout/navbar/header.htm" />
<Component src="src/components/shared/footer/footer.htm" />
```

### Adding a new page

1. Add a new root `.html` file.
2. Include shared head/header/footer components.
3. Compose sections from `src/components/`.

## Tech stack

- Vite
- `vite-plugin-html-inject`
- Tailwind CSS v4
- Vanilla JavaScript
- GSAP (where used)

## Quick reference

```bash
npm install
npm run dev
npm run build
npm run preview
```

---

**Nexsas – Automation SaaS Template**
