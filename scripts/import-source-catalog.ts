import fs from 'node:fs/promises'
import path from 'node:path'

import config from '@payload-config'
import { getPayload } from 'payload'

type SourceFamily =
  | 'creative-portfolio'
  | 'ai-agency'
  | 'automation-saas'
  | 'app-development'

type SourcePage = {
  key: string
  family: SourceFamily
  page: string
  sourcePath: string
  resolvedPath: string
}

type BindingMode = 'text' | 'html' | 'image-src' | 'video-src' | 'href' | 'class'

type Asset = {
  assetId: string
  canonicalPath: string
  publicPath?: string | null
  family: string
  kind: string
  status?: string | null
  exclusionReason?: string | null
  sourceArchive: string
  crc32: string
  bytes: number
  licenseStatus: string
  duplicatePaths?: string[]
}

type Assignment = {
  assetId: string
  route: string
  slot: string
  publicUseAllowed?: boolean
}

type RouteTemplate = {
  route: string
  sourceTemplateKey?: string
  templateKey?: string
  sourceTemplate?: string
}

type PayloadID = string | number

type TemplateDocument = {
  id: PayloadID
  key?: string | null
}

type AssetDocument = {
  id: PayloadID
  assetId?: string | null
  publicPath?: string | null
  status?: string | null
}

type PageDocument = {
  id: PayloadID
  title?: string | null
  summary?: string | null
}

const contentBindings: Array<{
  slot: string
  selector: string
  mode: BindingMode
}> = [
  { slot: 'title', selector: '[data-afluma-slot="title"]', mode: 'text' },
  { slot: 'summary', selector: '[data-afluma-slot="summary"]', mode: 'text' },
  {
    slot: 'primaryActionLabel',
    selector: '[data-afluma-slot="primary-action"]',
    mode: 'text',
  },
  {
    slot: 'primaryActionHref',
    selector: '[data-afluma-slot="primary-action"]',
    mode: 'href',
  },
  {
    slot: 'primaryMedia',
    selector: '[data-afluma-slot="primary-media"]',
    mode: 'image-src',
  },
  {
    slot: 'primaryVideo',
    selector: '[data-afluma-slot="primary-video"]',
    mode: 'video-src',
  },
]

const catalogRoot = path.join(process.cwd(), 'source-fidelity', 'catalog')

const readJSON = async <T>(name: string): Promise<T> => {
  const filePath = path.join(catalogRoot, name)
  const contents = await fs.readFile(filePath, 'utf8')
  return JSON.parse(contents) as T
}

const normalizeRoute = (route: string): string => {
  if (!route || route === '/') return '/'
  return `/${route.replace(/^\/+|\/+$/g, '')}/`
}

const routeToSlug = (route: string): string => {
  const normalized = normalizeRoute(route)
  return normalized === '/' ? '' : normalized.slice(1, -1)
}

const normalizeAssetStatus = (status: string | null | undefined): 'approved' | 'available' | 'deprecated' => {
  const normalized = String(status || '').trim().toLowerCase()

  if (normalized === 'approved') return 'approved'
  if (normalized === 'deprecated' || normalized === 'excluded') return 'deprecated'
  return 'available'
}

const routeTemplateKey = (item: RouteTemplate): string | undefined =>
  item.sourceTemplateKey || item.templateKey || item.sourceTemplate

const run = async (): Promise<void> => {
  const payload = await getPayload({ config })

  const [templates, assets, assignments, routeTemplates] = await Promise.all([
    readJSON<SourcePage[]>('source-pages.json'),
    readJSON<Asset[]>('media-assets.json'),
    readJSON<Assignment[]>('asset-assignments.json'),
    readJSON<RouteTemplate[]>('route-template-map.json'),
  ])

  if (!templates.length) throw new Error('source-pages.json contains no source templates.')
  if (!assets.length) throw new Error('media-assets.json contains no media records.')
  if (!routeTemplates.length) throw new Error('route-template-map.json contains no routes.')

  const assignmentByAssetID = new Map<string, Assignment>()
  const assignmentsByRoute = new Map<string, Assignment[]>()

  for (const assignment of assignments) {
    assignmentByAssetID.set(assignment.assetId, assignment)

    const route = normalizeRoute(assignment.route)
    const bucket = assignmentsByRoute.get(route) || []
    bucket.push({ ...assignment, route })
    assignmentsByRoute.set(route, bucket)
  }

  let templateCreates = 0
  let templateUpdates = 0

  for (const [index, template] of templates.entries()) {
    const existing = await payload.find({
      collection: 'source-templates',
      where: { key: { equals: template.key } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      key: template.key,
      family: template.family,
      page: template.page,
      sourcePath: template.sourcePath,
      resolvedPath: template.resolvedPath,
      status: 'available',
      contentBindings,
    }

    const current = existing.docs[0]

    if (current) {
      await payload.update({
        collection: 'source-templates',
        id: current.id,
        data: data as never,
        depth: 0,
        overrideAccess: true,
      })
      templateUpdates += 1
    } else {
      await payload.create({
        collection: 'source-templates',
        data: data as never,
        depth: 0,
        overrideAccess: true,
      })
      templateCreates += 1
    }

    if ((index + 1) % 50 === 0 || index + 1 === templates.length) {
      console.log(`Source templates: ${index + 1}/${templates.length}`)
    }
  }

  let assetCreates = 0
  let assetUpdates = 0

  for (const [index, asset] of assets.entries()) {
    const assigned = assignmentByAssetID.get(asset.assetId)
    const existing = await payload.find({
      collection: 'asset-library',
      where: { assetId: { equals: asset.assetId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      assetId: asset.assetId,
      canonicalPath: asset.canonicalPath,
      family: asset.family,
      kind: asset.kind,
      status: normalizeAssetStatus(asset.status),
      exclusionReason: asset.exclusionReason || undefined,
      sourceArchive: asset.sourceArchive,
      sourceCRC32: asset.crc32,
      sourceBytes: asset.bytes,
      publicPath: asset.publicPath || undefined,
      licenseStatus: asset.licenseStatus,
      assignedRoute: assigned ? normalizeRoute(assigned.route) : undefined,
      assignedSlot: assigned?.slot,
      publicUseAllowed: Boolean(assigned?.publicUseAllowed),
      duplicatePaths: (asset.duplicatePaths || []).map((duplicatePath: string) => ({
        path: duplicatePath,
      })),
    }

    const current = existing.docs[0]

    if (current) {
      await payload.update({
        collection: 'asset-library',
        id: current.id,
        data: data as never,
        depth: 0,
        overrideAccess: true,
      })
      assetUpdates += 1
    } else {
      await payload.create({
        collection: 'asset-library',
        data: data as never,
        depth: 0,
        overrideAccess: true,
      })
      assetCreates += 1
    }

    if ((index + 1) % 100 === 0 || index + 1 === assets.length) {
      console.log(`Media records: ${index + 1}/${assets.length}`)
    }
  }

  const templateResult = await payload.find({
    collection: 'source-templates',
    pagination: false,
    limit: Math.max(templates.length + 100, 1000),
    depth: 0,
    overrideAccess: true,
  })
  const templateDocuments = templateResult.docs as unknown as TemplateDocument[]
  const templateByKey = new Map<string, PayloadID>()

  for (const document of templateDocuments) {
    if (document.key) templateByKey.set(document.key, document.id)
  }

  const assetResult = await payload.find({
    collection: 'asset-library',
    pagination: false,
    limit: Math.max(assets.length + 100, 2000),
    depth: 0,
    overrideAccess: true,
  })
  const assetDocuments = assetResult.docs as unknown as AssetDocument[]
  const assetByID = new Map<string, PayloadID>()
  const assetDocumentByID = new Map<string, AssetDocument>()

  for (const document of assetDocuments) {
    if (!document.assetId) continue
    assetByID.set(document.assetId, document.id)
    assetDocumentByID.set(document.assetId, document)
  }

  const assetRelationshipsByRoute = new Map<string, PayloadID[]>()

  for (const assignment of assignments) {
    const assetDocumentID = assetByID.get(assignment.assetId)
    if (assetDocumentID === undefined) continue

    const route = normalizeRoute(assignment.route)
    const bucket = assetRelationshipsByRoute.get(route) || []
    bucket.push(assetDocumentID)
    assetRelationshipsByRoute.set(route, bucket)
  }

  let linkedPages = 0
  let missingPages = 0
  let missingTemplates = 0

  for (const [index, routeTemplate] of routeTemplates.entries()) {
    const route = normalizeRoute(routeTemplate.route)
    const slug = routeToSlug(route)
    const templateKey = routeTemplateKey(routeTemplate)

    if (!templateKey) {
      missingTemplates += 1
      console.warn(`No source template key for route: ${route}`)
      continue
    }

    const templateID = templateByKey.get(templateKey)

    if (templateID === undefined) {
      missingTemplates += 1
      console.warn(`Source template not found: ${templateKey} (${route})`)
      continue
    }

    const pageResult = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const page = pageResult.docs[0] as unknown as PageDocument | undefined

    if (!page) {
      missingPages += 1
      console.warn(`Page record not found for route: ${route}`)
      continue
    }

    const routeAssignments = assignmentsByRoute.get(route) || []
    const firstPublicAsset = routeAssignments
      .map((assignment) => assetDocumentByID.get(assignment.assetId))
      .find((asset) => Boolean(asset?.publicPath) && asset?.status !== 'deprecated')

    const sourceSlots = [
      { slot: 'title', value: page.title || '' },
      { slot: 'summary', value: page.summary || '' },
      { slot: 'primaryActionLabel', value: 'Explore Afluma' },
      { slot: 'primaryActionHref', value: '/start-project' },
      ...(firstPublicAsset?.publicPath
        ? [{ slot: 'primaryMedia', value: firstPublicAsset.publicPath }]
        : []),
    ]

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: {
        presentationMode: 'hybrid',
        sourceTemplate: templateID,
        assetAssignments: assetRelationshipsByRoute.get(route) || [],
        sourceSlots,
      } as never,
      depth: 0,
      overrideAccess: true,
    })

    linkedPages += 1

    if ((index + 1) % 100 === 0 || index + 1 === routeTemplates.length) {
      console.log(`Page links: ${index + 1}/${routeTemplates.length}`)
    }
  }

  console.log(
    JSON.stringify(
      {
        sourceTemplates: {
          total: templates.length,
          created: templateCreates,
          updated: templateUpdates,
        },
        media: {
          total: assets.length,
          created: assetCreates,
          updated: assetUpdates,
        },
        routes: {
          total: routeTemplates.length,
          linked: linkedPages,
          missingPages,
          missingTemplates,
        },
      },
      null,
      2,
    ),
  )

  if (missingPages > 0 || missingTemplates > 0) {
    throw new Error(
      `Source import incomplete: ${missingPages} missing page(s), ${missingTemplates} missing template(s).`,
    )
  }
}

run()
  .then(() => {
    console.log('SOURCE CATALOG IMPORT PASSED')
    process.exit(0)
  })
  .catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
