import type { FontAwesome6 } from '@expo/vector-icons'

type BrandIconName = keyof typeof FontAwesome6.glyphMap
type SoftwareBrand = { icon?: BrandIconName; background: string; foreground: string }

const brands = new Map<string, SoftwareBrand>([
  ['figma', { icon: 'figma', background: '#ffebe5', foreground: '#a33700' }],
  ['jira software', { icon: 'jira', background: '#e5f0ff', foreground: '#145b99' }],
  ['jira', { icon: 'jira', background: '#e5f0ff', foreground: '#145b99' }],
  ['github', { icon: 'github', background: '#e9e9f2', foreground: '#25233b' }],
  ['github enterprise', { icon: 'github', background: '#e9e9f2', foreground: '#25233b' }],
  ['slack', { icon: 'slack', background: '#f5e8f4', foreground: '#612860' }],
  ['chatgpt', { background: '#def4ec', foreground: '#146b4a' }],
  ['postman', { background: '#ffede3', foreground: '#a33700' }]
])

export function getSoftwareBrand(name: string): SoftwareBrand | undefined {
  return brands.get(name.trim().toLowerCase())
}
