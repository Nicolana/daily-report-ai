import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import mdTaskLists from 'markdown-it-task-lists'
import mdEmoji from 'markdown-it-emoji'
import mdSub from 'markdown-it-sub'
import mdSup from 'markdown-it-sup'
import mdMark from 'markdown-it-mark'
import mdFootnote from 'markdown-it-footnote'
import mdAnchor from 'markdown-it-anchor'
import mdContainer from 'markdown-it-container'

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
        }</code></pre>`
      } catch (__) {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  }
})
  .use(mdTaskLists, { enabled: true })
  .use(mdEmoji)
  .use(mdSub)
  .use(mdSup)
  .use(mdMark)
  .use(mdFootnote)
  .use(mdAnchor, {
    permalink: true,
    permalinkBefore: true,
    permalinkSymbol: '#'
  })

// 自定义容器
md.use(mdContainer, 'info', {
  validate: function(params: string) {
    return params.trim().match(/^info\s+(.*)$/)
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^info\s+(.*)$/)
    if (tokens[idx].nesting === 1) {
      return `<div class="custom-block info"><p class="custom-block-title">${md.utils.escapeHtml(m[1])}</p>\n`
    } else {
      return '</div>\n'
    }
  }
})

// 添加更多自定义容器
md.use(mdContainer, 'warning', {/* ... */})
md.use(mdContainer, 'danger', {/* ... */})
md.use(mdContainer, 'success', {/* ... */})

export const renderMarkdown = (content: string): string => {
  if (!content) return ''
  return md.render(content)
}
