import { nanoid } from 'nanoid'
import type { PolicyAlias } from '../types/rule'

export const defaultPolicies: PolicyAlias[] = [
  { id: nanoid(), name: '直连', value: 'DIRECT' },
  { id: nanoid(), name: '拒绝', value: 'REJECT' },
  { id: nanoid(), name: '代理', value: 'PROXY' },
  { id: nanoid(), name: '节点选择', value: '节点选择' },
  { id: nanoid(), name: '全球直连', value: '🎯 全球直连' },
  { id: nanoid(), name: '国外流量', value: '🚀 节点选择' },
]
