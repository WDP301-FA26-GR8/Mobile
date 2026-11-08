export type SoftwareCategory = 'design' | 'development' | 'productivity'

interface SoftwareDetails {
  category: SoftwareCategory
  id: string
  name: string
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
    corporateEmail: 'nguyen.van.a@example.com',
    id: 'linear-plus',
    name: 'Linear',
    status: { type: 'active' },
    workspaceName: 'SaaS-Sentry'
  },
  {
    accessType: 'licenseKey',
    category: 'design',
    id: 'figma-professional',
    maskedKey: 'FIG-PRO-••••-••••-8819',
    name: 'Figma',
    status: { type: 'active' }
  },
  {
    accessType: 'workspaceSeat',
    category: 'development',
    corporateEmail: 'nguyen.van.a@example.com',
    id: 'github-enterprise',
    name: 'GitHub',
    status: { type: 'active' },
    workspaceName: 'SaaS-Sentry Engineering'
  },
  {
    accessType: 'licenseKey',
    category: 'development',
    id: 'jetbrains-all-products',
    maskedKey: 'JBR-ALL-••••-••••-2048',
    name: 'JetBrains',
    status: { daysRemaining: 14, type: 'expiring' }
  }
]

export function getMySoftwareById(id: string) {
  return mySoftwareItems.find((software) => software.id === id)
}
