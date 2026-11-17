export type SoftwareCategory = 'design' | 'development' | 'productivity'

interface SoftwareDetails {
  category: SoftwareCategory
  iconBackground: string
  id: string
  name: string
  shortName: string
  status: { type: 'active' } | { daysRemaining: number; type: 'expiring' }
}

export interface WorkspaceSoftware extends SoftwareDetails {
  accessType: 'workspaceSeat'
  corporateEmail: string
  workspaceName: string
}

export interface LicenseKeySoftware extends SoftwareDetails {
  accessType: 'licenseKey'
  maskedKey: string
}

export type MySoftwareItem = LicenseKeySoftware | WorkspaceSoftware
export type SoftwareCategoryFilter = 'all' | SoftwareCategory

export const mySoftwareItems: MySoftwareItem[] = [
  {
    accessType: 'workspaceSeat',
    category: 'development',
    corporateEmail: 'nguyen.van.a@company.tech',
    iconBackground: '#357bd7',
    id: 'linear-plus',
    name: 'Linear Plus',
    shortName: 'Li',
    status: { type: 'active' },
    workspaceName: 'Company Tech Org'
  },
  {
    accessType: 'licenseKey',
    category: 'design',
    iconBackground: '#f2683b',
    id: 'figma-professional',
    maskedKey: 'FIG-PRO-••••-••••-8819',
    name: 'Figma Professional',
    shortName: 'Fg',
    status: { type: 'active' }
  },
  {
    accessType: 'workspaceSeat',
    category: 'development',
    corporateEmail: 'nguyen.van.a@company.tech',
    iconBackground: '#357bd7',
    id: 'github-enterprise',
    name: 'GitHub Enterprise',
    shortName: 'GH',
    status: { type: 'active' },
    workspaceName: 'Company Tech Org'
  },
  {
    accessType: 'licenseKey',
    category: 'development',
    iconBackground: '#3478c8',
    id: 'jetbrains-all-products',
    maskedKey: 'JET-BRA-••••-••••-2048',
    name: 'JetBrains All Products',
    shortName: 'JB',
    status: { daysRemaining: 14, type: 'expiring' }
  }
]

export function getMySoftwareById(id: string) {
  return mySoftwareItems.find((software) => software.id === id)
}
