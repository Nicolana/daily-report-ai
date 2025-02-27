<template>
  <div class="log-editor" v-loading="loading">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">{{ isEdit ? '编辑日报' : greeting }}</h2>
          <div v-if="!isEdit" class="page-subtitle">记录今天的工作点滴</div>
        </div>
        <el-date-picker
          v-model="selectedDate"
          type="date"
          placeholder="选择日期"
          :disabled-date="disableFutureDates"
          format="YYYY年MM月DD日"
          value-format="YYYY-MM-DD"
          class="date-picker"
        />
      </div>
    </div>
    
    <!-- 编辑器区域 -->
    <div class="editor-section">
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
            v-model="content"
            :preview="isPreview"
            @onSave="handleSave"
            :noMermaid="true"
            :toolbars="toolbars"
            class="md-editor"
          />
        </div>
      </div>

      <!-- 底部操作栏 -->
      <div class="action-bar">
        <div class="action-left">
          <el-text class="tip-text" type="info">
            <el-icon><Timer /></el-icon>
            自动保存中...
          </el-text>
        </div>
        <div class="action-right">
          <el-button @click="handleCancel" plain>取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">
            {{ saving ? '保存中...' : '保存' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import { InfoFilled, Timer } from '@element-plus/icons-vue'
import { dailyReportApi } from '../api/dailyReport'
import dayjs from '../utils/dayjs'
import 'md-editor-v3/lib/style.css'

const props = defineProps<{
  id?: string
  initialContent?: string
  initialDate?: string
}>()

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const isPreview = ref(false)
const content = ref(props.initialContent || '')
const selectedDate = ref(props.initialDate || dayjs().format('YYYY-MM-DD'))

const isEdit = computed(() => !!props.id)

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 6) return '凌晨好'
  if (hour < 9) return '早安'
  if (hour < 12) return '上午好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  if (hour < 22) return '晚上好'
  return '夜深了'
})

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

const disableFutureDates = (date: Date) => {
  return dayjs(date).isAfter(dayjs())
}

const handleSave = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入日报内容')
    return
  }

  saving.value = true
  try {
    if (isEdit.value) {
      await dailyReportApi.update(props.id!, {
        content: content.value,
        report_date: selectedDate.value
      })
    } else {
      await dailyReportApi.create({
        content: content.value,
        report_date: selectedDate.value
      })
    }
    ElMessage.success('保存成功')
    router.push('/logs')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const log = await dailyReportApi.get(props.id!)
      content.value = log.content
      selectedDate.value = dayjs(log.report_date).format('YYYY-MM-DD')
    } catch (error) {
      ElMessage.error('未找到日志')
      router.push('/logs')
    } finally {
      loading.value = false
    }
  }
})
</script>

<style scoped>
.log-editor {
  max-width: 1000px;
  margin: 0 auto;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* 页面头部样式 */
.page-header {
  position: relative;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 14px;
}

.date-picker {
  width: 180px;
}

/* 编辑器区域样式 */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-lg);
}

.editor-wrapper {
  flex: 1;
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
  font-size: 14px;
}

.editor-container {
  height: calc(100vh - 300px);
  min-height: 400px;
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

/* 底部操作栏样式 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.action-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.tip-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
}

.action-right {
  display: flex;
  gap: var(--spacing-sm);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .log-editor {
    padding: var(--spacing-md);
  }

  .page-title {
    font-size: 24px;
  }

  .editor-container {
    height: calc(100vh - 250px);
  }
}
</style> 