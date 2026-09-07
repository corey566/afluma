export const flagshipRoutes = [
  '',
  'workforce',
  'platform',
  'platform/agenticos',
  'products',
  'products/serenops',
  'products/afluma-commerce',
  'products/commander-os',
  'research',
  'proof',
  'proof/afluma-runs-on-afluma',
  'company',
  'trust',
  'responsible-ai',
  'security',
  'careers',
  'contact',
] as const

export const legacyFlagshipAliases: Record<string, string> = {
  home: '',
  about: 'company',
  work: 'proof',
  insights: 'research',
  team: 'workforce',
  'start-project': 'contact',
  'platform/agentic-os': 'platform/agenticos',
  'products/agenticos': 'platform/agenticos',
}

export const sitemapExcludedRoutes = new Set(Object.keys(legacyFlagshipAliases))
