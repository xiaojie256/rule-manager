import { nanoid } from 'nanoid'
import type { RuleTemplate, RuleItem, RuleSection } from '../types/rule'

function makeRule(section: RuleSection, raw: string): RuleItem {
  const parts = raw.split(',').map(s => s.trim())
  return {
    id: nanoid(),
    section,
    enabled: true,
    raw,
    type: parts[0] || '',
    value: parts[1] || '',
    policy: parts[2] || '',
    extra: parts.slice(3),
  }
}

export const defaultTemplate: RuleTemplate = {
  id: 'default',
  name: '校园/常用网站直连模板',
  description: '包含常用校园网站和工具网站的直连规则',
  sections: {
    prepend: [
      makeRule('prepend', 'DOMAIN-SUFFIX,matiji.net,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,jwxt.aqnu.edu.cn,DIRECT'),
      makeRule('prepend', 'DOMAIN,gitee.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,bing.com,节点选择'),
      makeRule('prepend', 'DOMAIN-SUFFIX,anchnet.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,www.speedtest.net,节点选择'),
      makeRule('prepend', 'DOMAIN-SUFFIX,xiaomimimo.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,xiaojie256.top,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,immersivetranslate.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,itab.link,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,fanyi.baidu.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,xuexitong.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,i.xuexitong.com,DIRECT'),
      makeRule('prepend', 'DOMAIN-SUFFIX,chaoxing.com,DIRECT'),
    ],
    append: [],
    delete: [],
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
