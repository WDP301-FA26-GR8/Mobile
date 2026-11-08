export type SoftwareCategory = 'development' | 'design' | 'productivity' | 'communication'
export type SoftwareFilter = 'all' | SoftwareCategory
export type AssignmentKind = 'workspace-seat' | 'license-key' | 'shared'
export type AssignmentStatus = 'active' | 'expiring'
export type CatalogAvailability = 'in-stock' | 'purchase'

export interface SoftwareAssignment {
  id: string
  name: string
  plan: string
  subtitle: string
  monogram: string
  markColor: string
  category: SoftwareCategory
  status: AssignmentStatus
  daysLeft: number | null
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
  monogram: string
  markColor: string
  category: SoftwareCategory
  standardToolset: boolean
  availability: CatalogAvailability
  estimatedCostVnd: number
  freeSeats: number | null
  ownedSoftwareId: string | null
}

export const demoSoftware: SoftwareAssignment[] = [
  {
    id: 'sw-figma',
    name: 'Figma Professional',
    plan: 'Professional',
    subtitle: 'Enterprise UI/UX',
    monogram: 'Fg',
    markColor: '#eb6834',
    category: 'design',
    status: 'active',
    daysLeft: null,
    grantedOn: '2026-01-15T00:00:00.000Z',
    expiresOn: '2026-12-01T00:00:00.000Z',
    usagePercent: 64,
    kind: 'license-key',
    email: null,
    workspace: null,
    maskedKey: 'FIG-PRO-••••-••••-8819',
    fullKey: 'FIG-PRO-8K2M-Q19L-8819',
    deviceName: 'NB-DEV-042'
  },
  {
    id: 'sw-github',
    name: 'GitHub Enterprise',
    plan: 'Enterprise',
    subtitle: 'Cloud Seat',
    monogram: 'GH',
    markColor: '#2a78d6',
    category: 'development',
    status: 'active',
    daysLeft: null,
    grantedOn: '2026-03-01T00:00:00.000Z',
    expiresOn: '2027-03-01T00:00:00.000Z',
    usagePercent: 82,
    kind: 'workspace-seat',
    email: 'nguyen.van.a@company.com',
    workspace: 'Company Tech Org',
    maskedKey: null,
    fullKey: null,
    deviceName: null
  },
  {
    id: 'sw-jetbrains',
    name: 'JetBrains All Products',
    plan: 'Commercial Annual',
    subtitle: 'Commercial Annual',
    monogram: 'JB',
    markColor: '#2a78d6',
    category: 'development',
    status: 'expiring',
    daysLeft: 14,
    grantedOn: '2025-09-10T00:00:00.000Z',
    expiresOn: '2026-11-22T00:00:00.000Z',
    usagePercent: 70,
    kind: 'license-key',
    email: null,
    workspace: null,
    maskedKey: 'JB-ALL-••••-••••-4410',
    fullKey: 'JB-ALL-91KQ-M20P-4410',
    deviceName: 'NB-DEV-042'
  },
  {
    id: 'sw-miro',
    name: 'Miro Team Board',
    plan: 'Shared Team Plan',
    subtitle: 'Shared Team Plan',
    monogram: 'Mi',
    markColor: '#1baf7a',
    category: 'productivity',
    status: 'active',
    daysLeft: null,
    grantedOn: '2026-04-01T00:00:00.000Z',
    expiresOn: '2027-04-01T00:00:00.000Z',
    usagePercent: 40,
    kind: 'shared',
    email: null,
    workspace: 'Product Design',
    maskedKey: null,
    fullKey: null,
    deviceName: null
  }
]

export const catalog: CatalogItem[] = [
  {
    id: 'linear',
    name: 'Linear Plus',
    monogram: 'Li',
    markColor: '#2a78d6',
    category: 'productivity',
    standardToolset: true,
    availability: 'in-stock',
    estimatedCostVnd: 0,
    freeSeats: 4,
    ownedSoftwareId: null
  },
  {
    id: 'claude',
    name: 'Claude Team AI',
    monogram: 'Cl',
    markColor: '#2a78d6',
    category: 'productivity',
    standardToolset: true,
    availability: 'purchase',
    estimatedCostVnd: 880_000,
    freeSeats: null,
    ownedSoftwareId: null
  },
  {
    id: 'figma',
    name: 'Figma Professional',
    monogram: 'Fg',
    markColor: '#eb6834',
    category: 'design',
    standardToolset: true,
    availability: 'in-stock',
    estimatedCostVnd: 0,
    freeSeats: null,
    ownedSoftwareId: 'sw-figma'
  },
  {
    id: 'raycast',
    name: 'Raycast Pro Teams',
    monogram: 'Rc',
    markColor: '#e87ba4',
    category: 'productivity',
    standardToolset: false,
    availability: 'purchase',
    estimatedCostVnd: 293_000,
    freeSeats: null,
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
