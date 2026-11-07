import type { TFunction } from 'i18next'

import type { AccessRequest, ReasonPreset, RejectionPreset } from '@/entities/access-request'
import type { SoftwareCategory } from '@/entities/software'

export function categoryLabel(category: SoftwareCategory, t: TFunction): string {
  switch (category) {
    case 'communication':
      return t('software.categories.communication')
    case 'design':
      return t('software.categories.design')
    case 'development':
      return t('software.categories.development')
    case 'productivity':
      return t('software.categories.productivity')
  }
}

export function requestReason(request: AccessRequest, t: TFunction): string {
  if (request.reasonText) return request.reasonText
  if (request.reasonPreset) return reasonPresetLabel(request.reasonPreset, t)
  return ''
}

export function rejectionReason(request: AccessRequest, t: TFunction): string {
  if (!request.rejectionPreset) return ''
  return rejectionPresetLabel(request.rejectionPreset, t)
}

function reasonPresetLabel(preset: ReasonPreset, t: TFunction): string {
  switch (preset) {
    case 'projectChannel':
      return t('requests.reasonPresets.projectChannel')
  }
}

function rejectionPresetLabel(preset: RejectionPreset, t: TFunction): string {
  switch (preset) {
    case 'standardTool':
      return t('requests.rejectionPresets.standardTool')
  }
}
