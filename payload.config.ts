import path from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { buildConfig } from 'payload'

import { Users } from '@/collections/Users'
import { Media } from '@/collections/Media'
import { Pages } from '@/collections/Pages'
import { Posts } from '@/collections/Posts'
import { Services } from '@/collections/Services'
import { Solutions } from '@/collections/Solutions'
import { Industries } from '@/collections/Industries'
import { Products } from '@/collections/Products'
import { CaseStudies } from '@/collections/CaseStudies'
import { People } from '@/collections/People'
import { Jobs } from '@/collections/Jobs'
import { Locations } from '@/collections/Locations'
import { FAQs } from '@/collections/FAQs'
import { Redirects } from '@/collections/Redirects'
import { Enquiries } from '@/collections/Enquiries'
import { AssetLibrary } from '@/collections/AssetLibrary'
import { SourceTemplates } from '@/collections/SourceTemplates'
import { Clients } from '@/collections/Clients'
import { ClientProjects } from '@/collections/ClientProjects'

import { aflumaCoreCollections } from '@/afluma-core/payload/register'
import { processMeiLeadIntake } from '@/afluma-core/jobs'

import { SiteSettings } from '@/globals/SiteSettings'
import { Header } from '@/globals/Header'
import { Footer } from '@/globals/Footer'
import { SEOSettings } from '@/globals/SEOSettings'
import { Integrations } from '@/globals/Integrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const serverURL =
  process.env.SERVER_URL || 'http://localhost:3000'

const r2Enabled = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
)

export default buildConfig({
  serverURL,

  admin: {
    user: Users.slug,

    importMap: {
      baseDir: path.resolve(dirname),
    },

    meta: {
      titleSuffix: '— Afluma Content Studio',
    },

    components: {
      graphics: {
        Logo: '/src/components/admin/Logo',
        Icon: '/src/components/admin/Icon',
      },

      beforeDashboard: [
        '/src/components/admin/DashboardWelcome',
      ],
    },

    livePreview: {
      collections: [
        'pages',
        'posts',
        'products',
        'case-studies',
        'jobs',
      ],

      globals: [
        'site-settings',
        'header',
        'footer',
      ],

      url: ({ data }) => {
        const slug = encodeURIComponent(
          String(data?.slug || ''),
        )

        const secret =
          process.env.PREVIEW_SECRET || ''

        return `${serverURL}/api/draft?secret=${secret}&slug=${slug}`
      },

      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 390,
          height: 844,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 820,
          height: 1180,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },

  collections: [
    Users,
    Media,
    Pages,
    Posts,
    Services,
    Solutions,
    Industries,
    Products,
    CaseStudies,
    People,
    Jobs,
    Locations,
    FAQs,
    Redirects,
    Enquiries,
    AssetLibrary,
    SourceTemplates,
    Clients,
    ClientProjects,
    ...aflumaCoreCollections,
  ],


  jobs: {
    tasks: [
      processMeiLeadIntake,
    ],

    jobsCollectionOverrides: ({
      defaultJobsCollection,
    }) => ({
      ...defaultJobsCollection,
      admin: {
        ...defaultJobsCollection.admin,
        group: 'AgenticOS',
        hidden: false,
      },
    }),
  },

  globals: [
    SiteSettings,
    Header,
    Footer,
    SEOSettings,
    Integrations,
  ],

  editor: lexicalEditor(),

  secret: process.env.PAYLOAD_SECRET || '',

  db: postgresAdapter({
    /*
     * Store page-builder blocks in JSONB.
     *
     * This avoids generating deeply nested PostgreSQL
     * relational tables / enum names that may exceed
     * PostgreSQL's 63-character identifier limit.
     */
    blocksAsJSON: true,

    pool: {
      connectionString:
        process.env.DATABASE_URL || '',
    },
  }),

  sharp,

  plugins: [
    s3Storage({
      enabled: r2Enabled,

      collections: {
        media: {
          disablePayloadAccessControl: true,

          generateFileURL: ({
            filename,
            prefix,
          }) => {
            const publicURL =
              process.env.R2_PUBLIC_URL || ''

            const normalizedPublicURL =
              publicURL.replace(/\/$/, '')

            const normalizedPrefix = prefix
              ? `${prefix.replace(/^\/|\/$/g, '')}/`
              : ''

            return `${normalizedPublicURL}/${normalizedPrefix}${filename}`
          },
        },
      },

      bucket: process.env.R2_BUCKET || '',

      config: {
        credentials: {
          accessKeyId:
            process.env.R2_ACCESS_KEY_ID || '',

          secretAccessKey:
            process.env.R2_SECRET_ACCESS_KEY ||
            '',
        },

        region: 'auto',

        endpoint:
          process.env.R2_ENDPOINT || undefined,

        forcePathStyle: true,
      },
    }),
  ],

  cors: [
    serverURL,
  ],

  csrf: [
    serverURL,
  ],

  typescript: {
    outputFile: path.resolve(
      dirname,
      'src/payload-types.ts',
    ),
  },
})