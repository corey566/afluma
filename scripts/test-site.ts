import assert from 'node:assert/strict'
import { test } from 'node:test'
import { aliases, findPage, findPersona, pages, products, workforce } from '../src/site/content'

const personaRoutes = workforce.map((agent) => `workforce/${agent.slug}`)
const canonicalRoutes = [...pages.map((page) => page.slug), ...personaRoutes]
const canonicalRouteSet = new Set(canonicalRoutes)

test('canonical public routes are unique and use clean URL paths', () => {
  assert.equal(canonicalRouteSet.size, canonicalRoutes.length, 'Page and persona routes must not collide')
  assert.ok(canonicalRouteSet.has(''), 'The home page must exist')

  for (const route of canonicalRoutes) {
    assert.match(route, /^(?:[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*)?$/, `Invalid route: ${route}`)
  }
})

test('the workforce and connected ecosystem have dedicated pages', () => {
  for (const route of ['workforce', 'platform/agenticos', 'products', 'services', 'about', 'contact']) {
    assert.ok(findPage(route), `Missing core page: /${route}`)
  }

  assert.ok(products.length > 0, 'The ecosystem must include products')
  assert.equal(new Set(products.map((product) => product.slug)).size, products.length, 'Product slugs must be unique')
  for (const product of products) {
    const page = findPage(`products/${product.slug}`)
    assert.ok(page, `Missing product page for ${product.name}`)
    assert.equal(page.title, product.name, 'Product navigation and page identity must agree')
    assert.ok(page.sections.length > 0, `${product.name} needs explanatory content`)
  }
})

test('every page has meaningful metadata and complete editorial sections', () => {
  for (const page of pages) {
    assert.ok(page.title.trim(), `Missing title: /${page.slug}`)
    assert.ok(page.description.trim(), `Missing description: /${page.slug}`)
    assert.ok(page.eyebrow.trim(), `Missing context label: /${page.slug}`)
    for (const section of page.sections) {
      assert.ok(section.title.trim(), `Missing section title: /${page.slug}`)
      assert.ok(section.body.trim(), `Missing section body: /${page.slug}`)
      for (const item of section.items ?? []) assert.ok(item.trim(), `Empty list item: /${page.slug}`)
    }
  }
})

test('persona identities and every collaboration handoff resolve to public profiles', () => {
  const agentIds = new Set(workforce.map((agent) => agent.id))
  assert.ok(workforce.length > 0, 'The workforce must include personas')
  assert.equal(agentIds.size, workforce.length, 'Agent IDs must be unique')

  for (const agent of workforce) {
    assert.equal(findPersona(`workforce/${agent.slug}`)?.id, agent.id, `Profile does not resolve: ${agent.name}`)
    assert.ok(agent.name.trim() && agent.role.trim() && agent.mission.trim(), `Incomplete persona: ${agent.id}`)
    assert.match(agent.disclosure, /\bAI\b/, `${agent.name} must disclose its AI identity`)
    assert.equal(new Set(agent.escalationAgentIds).size, agent.escalationAgentIds.length, `Duplicate handoff: ${agent.name}`)

    for (const peerId of agent.escalationAgentIds) {
      const peer = workforce.find((candidate) => candidate.id === peerId)
      assert.ok(peer, `${agent.name} references an unknown handoff: ${peerId}`)
      assert.ok(canonicalRouteSet.has(`workforce/${peer.slug}`), `Handoff has no public route: ${peerId}`)
      assert.notEqual(peer.id, agent.id, `${agent.name} should hand off to a different teammate`)
    }
  }
})

test('legacy aliases resolve directly to canonical pages without collisions or chains', () => {
  for (const [source, target] of Object.entries(aliases)) {
    assert.ok(!canonicalRouteSet.has(source), `Alias hides a canonical route: /${source}`)
    assert.ok(canonicalRouteSet.has(target), `Alias /${source} points to missing route /${target}`)
    assert.ok(!Object.hasOwn(aliases, target), `Alias /${source} introduces a redirect chain`)
    assert.notEqual(source, target, `Alias loops to itself: /${source}`)
  }
})
