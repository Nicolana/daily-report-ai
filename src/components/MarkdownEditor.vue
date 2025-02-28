<template>
  <div class="markdown-editor">
    <div class="editor-wrapper">
      <div class="editor-toolbar">
        <div class="toolbar-left">
          <el-tooltip content="支持 Markdown 语法" placement="top">
            <el-icon class="toolbar-icon"><InfoFilled /></el-icon>
          </el-tooltip>
          <span class="toolbar-text">编辑器</span>
        </div>
        <div class="toolbar-right">
          <el-tooltip content="预览模式" placement="top">
            <el-switch v-model="isPreview" />
          </el-tooltip>
        </div>
      </div>
      
      <div class="editor-container">
        <MdEditor
          :modelValue="modelValue"
          @update:modelValue="$emit('update:modelValue', $event)"
          :preview="isPreview"
          @onSave="$emit('save')"
          :noMermaid="true"
          :toolbars="toolbars"
          class="md-editor"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import { InfoFilled } from '@element-plus/icons-vue'
import 'md-editor-v3/lib/style.css'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'save'): void
}>()

const isPreview = ref(false)

const toolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  '-',
  'title',
  'sub',
  'sup',
  '-',
  'quote',
  'unorderedList',
  'orderedList',
  '-',
  'codeRow',
  'code',
  'link',
  'table',
  '-',
  'fullscreen'
]
</script>

<style scoped>
.markdown-editor {
  height: 100%;
}

.editor-wrapper {
  height: 100%;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  background: var(--bg-secondary);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.toolbar-icon {
  color: var(--primary-color);
  font-size: 16px;
}

.toolbar-text {
  color: var(--text-secondary);
}

.editor-container {
  height: calc(100% - 48px);
}

:deep(.md-editor) {
  border: none !important;
  height: 100% !important;
}

:deep(.md-editor-toolbar) {
  background-color: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.md-editor-content) {
  background-color: var(--bg-secondary) !important;
}
</style>
