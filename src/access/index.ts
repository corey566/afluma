import type { Access, FieldAccess } from 'payload'

export type AflumaRole = 'admin' | 'editor' | 'author' | 'reviewer' | 'media' | 'recruiter'

const roles = (user: unknown): AflumaRole[] => {
  if (!user || typeof user !== 'object' || !('roles' in user)) return []
  const value = (user as { roles?: AflumaRole[] }).roles
  return Array.isArray(value) ? value : []
}

export const hasRole = (user: unknown, allowed: AflumaRole[]) => roles(user).some((role) => allowed.includes(role))
export const authenticated: Access = ({ req }) => Boolean(req.user)
export const adminOnly: Access = ({ req }) => hasRole(req.user, ['admin'])
export const contentTeam: Access = ({ req }) => hasRole(req.user, ['admin', 'editor', 'author', 'reviewer'])
export const editors: Access = ({ req }) => hasRole(req.user, ['admin', 'editor'])
export const reviewers: Access = ({ req }) => hasRole(req.user, ['admin', 'editor', 'reviewer'])
export const mediaTeam: Access = ({ req }) => hasRole(req.user, ['admin', 'editor', 'media'])
export const recruiters: Access = ({ req }) => hasRole(req.user, ['admin', 'editor', 'recruiter'])
export const publicCreate: Access = () => true
export const publishedOrAuthenticated: Access = ({ req }) => req.user ? true : ({ _status: { equals: 'published' } })
export const sensitiveField: FieldAccess = ({ req }) => hasRole(req.user, ['admin'])
