<template>
  <MdPreview
    :modelValue="content"
    :preview="true"
    :previewOnly="true"
    :noMermaid="true"
    :readOnly="true"
    class="markdown-render"
  />
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/preview.css';

defineProps<{
  content: string
}>()
</script>

<style scoped>
.markdown-render {
  border: none !important;
}

:deep(.md-editor) {
  background: none !important;
}

:deep(.md-editor-preview) {
  padding: 0 !important;
  background: none !important;
}

/* 隐藏预览模式的工具栏 */
:deep(.md-editor-toolbar) {
  display: none !important;
}

:deep(.markdown-body) {
  background: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
  word-wrap: break-word;
  padding: 0;
}

/* 标题样式 */
:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3),
:deep(.markdown-body h4),
:deep(.markdown-body h5),
:deep(.markdown-body h6) {
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-primary);
}

:deep(.markdown-body h1) {
  font-size: 2em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-color);
}

:deep(.markdown-body h2) {
  font-size: 1.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--border-color);
}

:deep(.markdown-body h3) { font-size: 1.25em; }
:deep(.markdown-body h4) { font-size: 1em; }
:deep(.markdown-body h5) { font-size: 0.875em; }
:deep(.markdown-body h6) { font-size: 0.85em; color: var(--text-secondary); }

/* 段落和列表样式 */
:deep(.markdown-body p),
:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: var(--spacing-xl);
}

:deep(.markdown-body li) {
  margin: 0.25em 0;
}

:deep(.markdown-body li > p) {
  margin-top: var(--spacing-sm);
}

/* 引用块样式 */
:deep(.markdown-body blockquote) {
  margin: var(--spacing-md) 0;
  padding: 0 1em;
  color: var(--text-secondary);
  border-left: 0.25em solid var(--primary-color);
  background-color: rgba(96, 199, 183, 0.05);
  border-radius: var(--border-radius-sm);
}

:deep(.markdown-body blockquote > :first-child) { margin-top: 0; }
:deep(.markdown-body blockquote > :last-child) { margin-bottom: 0; }

/* 代码样式 */
:deep(.markdown-body code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
  background-color: rgba(96, 199, 183, 0.1);
  border-radius: var(--border-radius-sm);
}

:deep(.markdown-body pre) {
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
}

:deep(.markdown-body pre code) {
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
}

/* 表格样式 */
:deep(.markdown-body table) {
  display: block;
  width: 100%;
  overflow: auto;
  margin: var(--spacing-md) 0;
  border-spacing: 0;
  border-collapse: collapse;
}

:deep(.markdown-body table th) {
  font-weight: 600;
  background-color: var(--bg-tertiary);
}

:deep(.markdown-body table th),
:deep(.markdown-body table td) {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
}

:deep(.markdown-body table tr) {
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

:deep(.markdown-body table tr:nth-child(2n)) {
  background-color: var(--bg-tertiary);
}

/* 链接样式 */
:deep(.markdown-body a) {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

:deep(.markdown-body a:hover) {
  color: var(--primary-dark);
  text-decoration: underline;
}

/* 图片样式 */
:deep(.markdown-body img) {
  max-width: 100%;
  height: auto;
  margin: var(--spacing-md) 0;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

/* 水平线样式 */
:deep(.markdown-body hr) {
  height: 1px;
  padding: 0;
  margin: var(--spacing-xl) 0;
  background-color: var(--border-color);
  border: 0;
}

/* 任务列表样式 */
:deep(.markdown-body input[type="checkbox"]) {
  margin-right: var(--spacing-sm);
}

:deep(.markdown-body .task-list-item) {
  list-style-type: none;
}

:deep(.markdown-body .task-list-item + .task-list-item) {
  margin-top: 3px;
}

/* 代码高亮主题自定义 */
:deep(.hljs) {
  background: var(--bg-tertiary) !important;
  color: var(--text-primary) !important;
}

:deep(.hljs-comment),
:deep(.hljs-quote) {
  color: var(--text-secondary) !important;
  font-style: italic;
}

:deep(.hljs-keyword),
:deep(.hljs-selector-tag) {
  color: var(--primary-color) !important;
}

:deep(.hljs-string),
:deep(.hljs-doctag) {
  color: var(--secondary-color) !important;
}

/* 打印样式优化 */
@media print {
  :deep(.markdown-body) {
    color-adjust: exact;
  }
}
</style>
