export type SoftwareCategory = 'development' | 'design' | 'productivity' | 'communication'
export type SoftwareFilter = 'all' | SoftwareCategory
export type AssignmentKind = 'workspace-seat' | 'license-key'
export type AssignmentStatus = 'active' | 'expiring'
export type CatalogAvailability = 'in-stock' | 'purchase'

export interface SoftwareAssignment {
  id: string
  name: string
  plan: string
  category: SoftwareCategory
  status: AssignmentStatus
  grantedOn: string
  expiresOn: string
  usagePercent: number
  kind: AssignmentKind
  email: string | null
  workspace: string | null
  maskedKey: string | null
  fullKey: string | null
  deviceName: string | null
}

export interface CatalogItem {
  id: string
  name: string
  category: SoftwareCategory
  standardToolset: boolean
  availability: CatalogAvailability
  estimatedCostVnd: number
  ownedSoftwareId: string | null
}

export const demoSoftware: SoftwareAssignment[] = [
  {
    id: 'sw-github',
    name: 'GitHub Enterprise',
    plan: 'Enterprise',
    category: 'development',
    status: 'active',
    grantedOn: '2026-03-01T00:00:00.000Z',
    expiresOn: '2027-03-01T00:00:00.000Z',
    usagePercent: 82,
    kind: 'workspace-seat',
    email: 'an.nguyen@company.com',
    workspace: 'Company Tech Org',
    maskedKey: null,
    fullKey: null,
    deviceName: null
  },
  {
    id: 'sw-figma',
    name: 'Figma Professional',
    plan: 'Professional',
    category: 'design',
    status: 'expiring',
    grantedOn: '2026-01-15T00:00:00.000Z',
    expiresOn: '2026-12-01T00:00:00.000Z',
    usagePercent: 64,
    kind: 'license-key',
    email: null,
    workspace: null,
    maskedKey: 'FIG-PRO-••••-••••-8819',
    fullKey: 'FIG-PRO-8K2M-Q19L-8819',
    deviceName: 'NB-DEV-042'
  }
]

export const catalog: CatalogItem[] = [
  {
    id: 'github',
    name: 'GitHub Enterprise',
    category: 'development',
    standardToolset: true,
    availability: 'in-stock',
    estimatedCostVnd: 0,
    ownedSoftwareId: 'sw-github'
  },
  {
    id: 'jira',
    name: 'Jira Standard',
    category: 'productivity',
    standardToolset: true,
    availability: 'in-stock',
    estimatedCostVnd: 0,
    ownedSoftwareId: null
  },
  {
    id: 'jetbrains',
    name: 'JetBrains All Products',
    category: 'development',
    standardToolset: false,
    availability: 'purchase',
    estimatedCostVnd: 12_500_000,
    ownedSoftwareId: null
  }
]

export function findSoftware(softwareId: string | null): SoftwareAssignment | null {
  if (!softwareId) return null
  return demoSoftware.find((item) => item.id === softwareId) ?? null
}

export function softwareSummary(items: SoftwareAssignment[]) {
  return {
    active: items.length,
    expiring: items.filter((item) => item.status === 'expiring').length
  }
}

export function filterSoftware(
  items: SoftwareAssignment[],
  input: { category: SoftwareFilter; query: string }
): SoftwareAssignment[] {
  const query = input.query.trim().toLocaleLowerCase()

  return items.filter((item) => {
    const categoryMatches = input.category === 'all' || item.category === input.category
    const queryMatches = query.length === 0 || item.name.toLocaleLowerCase().includes(query)
    return categoryMatches && queryMatches
  })
}

export function catalogForWizard(): CatalogItem[] {
  return [...catalog].sort((left, right) => Number(right.standardToolset) - Number(left.standardToolset))
}
