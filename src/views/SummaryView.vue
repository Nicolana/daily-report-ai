<template>
  <div class="summary">
    <div class="summary-header-container">
      <h1 class="main-title">工作总结</h1>
      <p class="subtitle">查看和管理您的周期性工作总结</p>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="custom-tabs">
      <el-tab-pane label="周总结" name="week">
        <el-card class="summary-card" :body-style="{ padding: '0' }">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <h3 class="card-title">周总结</h3>
                <el-date-picker
                  v-model="selectedWeek"
                  type="week"
                  format="YYYY年第ww周"
                  placeholder="选择周"
                  value-format="YYYY-MM-DD"
                  @change="handleWeekChange"
                  class="date-picker"
                />
              </div>
              <div class="header-right" v-if="!weekSummary">
                <el-button
                  type="primary"
                  @click="$router.push(`/summary/generate/${activeTab}`)"
                >
                  <el-icon><Plus /></el-icon>生成总结
                </el-button>
              </div>
            </div>
          </template>

          <div class="summary-content">
            <div class="ai-summary">
              <div class="summary-header">
                <div class="summary-title">
                  <el-icon><Document /></el-icon>
                  <h3>AI 总结</h3>
                </div>
                <div class="summary-actions" v-if="weekSummary">
                  <el-button
                    text
                    type="primary"
                    @click="handleEdit('week')"
                    class="action-button"
                  >
                    <el-icon><EditPen /></el-icon>编辑
                  </el-button>
                  <el-button
                    text
                    type="info"
                    @click="copyWeekSummary"
                    class="action-button"
                  >
                    <el-icon><CopyDocument /></el-icon>复制
                  </el-button>
                </div>
              </div>

              <div class="summary-preview" v-if="weekSummary">
                <MarkdownRender :content="weekSummary" />
              </div>
              <el-empty v-else description="暂无总结内容" class="empty-state">
                <template #image>
                  <el-icon><DocumentAdd /></el-icon>
                </template>
                <template #description>
                  <p class="empty-text">点击生成按钮开始创建周总结</p>
                </template>
                <el-button
                  type="primary"
                  @click="$router.push(`/summary/generate/${activeTab}`)"
                  class="generate-button"
                >
                  <el-icon><Plus /></el-icon>生成总结
                </el-button>
              </el-empty>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="月总结" name="month">
        <el-card class="summary-card" :body-style="{ padding: '0' }">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <h3 class="card-title">月总结</h3>
                <el-date-picker
                  v-model="selectedMonth"
                  type="month"
                  format="YYYY年MM月"
                  placeholder="选择月份"
                  value-format="YYYY-MM-DD"
                  @change="handleMonthChange"
                  class="date-picker"
                />
              </div>
              <div class="header-right" v-if="!monthSummary">
                <el-button
                  type="primary"
                  @click="$router.push(`/summary/generate/${activeTab}`)"
                >
                  <el-icon><Plus /></el-icon>生成总结
                </el-button>
              </div>
            </div>
          </template>

          <div class="summary-content">
            <div class="ai-summary">
              <div class="summary-header">
                <div class="summary-title">
                  <el-icon><Document /></el-icon>
                  <h3>AI 总结</h3>
                </div>
                <div class="summary-actions" v-if="monthSummary">
                  <el-button
                    text
                    type="primary"
                    @click="handleEdit('month')"
                    class="action-button"
                  >
                    <el-icon><EditPen /></el-icon>编辑
                  </el-button>
                  <el-button
                    text
                    type="info"
                    @click="copyMonthSummary"
                    class="action-button"
                  >
                    <el-icon><CopyDocument /></el-icon>复制
                  </el-button>
                </div>
              </div>

              <div class="summary-preview" v-if="monthSummary">
                <MarkdownRender :content="monthSummary" />
              </div>
              <el-empty v-else description="暂无总结内容" class="empty-state">
                <template #image>
                  <el-icon><DocumentAdd /></el-icon>
                </template>
                <template #description>
                  <p class="empty-text">点击生成按钮开始创建月总结</p>
                </template>
                <el-button
                  type="primary"
                  @click="$router.push(`/summary/generate/${activeTab}`)"
                  class="generate-button"
                >
                  <el-icon><Plus /></el-icon>生成总结
                </el-button>
              </el-empty>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑总结对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑${activeTab === 'week' ? '周' : '月'}总结`"
      width="800px"
      class="edit-dialog"
      destroy-on-close
    >
      <div class="edit-container">
        <MdEditor
          v-model="editingContent"
          :preview="isPreview"
          @onSave="handleSaveEdit"
          :noMermaid="true"
          :toolbars="toolbars"
          class="md-editor"
        />
        <div class="edit-actions">
          <div class="action-left">
            <el-tooltip content="预览模式" placement="top">
              <el-switch v-model="isPreview" />
            </el-tooltip>
          </div>
          <div class="action-right">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button
              type="primary"
              @click="handleSaveEdit"
              :loading="saving"
            >
              保存
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import MarkdownRender from '../components/MarkdownRender.vue'
import { useLogStore } from '../stores/logStore'
import dayjs from '../utils/dayjs'
import { summaryService, type GenerateSummaryParams } from '../api/summary'

const store = useLogStore()
const activeTab = ref('week')

const selectedWeek = ref<string>('')
const selectedMonth = ref<string>('')

// 生成对话框相关状态
const generateDialogVisible = ref(false)
const generating = ref(false)
const generateForm = ref({
  dateRange: '',
  prompt: '',
  style: 'concise'
})

// 预览总结内容
const previewSummary = ref('')

// AI 总结内容
const weekSummary = ref('')
const monthSummary = ref('')

// 生成状态
const generatingWeekSummary = ref(false)
const generatingMonthSummary = ref(false)

// 编辑相关状态
const editDialogVisible = ref(false)
const editingContent = ref('')
const isPreview = ref(false)
const saving = ref(false)

// 定义工具栏
const toolbars = [
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

onMounted(() => {
  // 加载日志数据
  store.fetchLogs().then(() => {
    // 默认选择本周
    selectedWeek.value = dayjs().format('YYYY-MM-DD')
    // 获取当前总结
    fetchSummary('week')
  })
})

const weeklyLogs = computed(() => {
  if (!selectedWeek.value) return []

  const start = dayjs(selectedWeek.value).startOf('week').add(1, 'day')
  const end = dayjs(selectedWeek.value).endOf('week').add(1, 'day')

  return store.getLogsByDateRange(
    start.format('YYYY-MM-DD'),
    end.format('YYYY-MM-DD')
  )
})

const monthlyLogs = computed(() => {
  if (!selectedMonth.value) return []

  const start = dayjs(selectedMonth.value).startOf('month')
  const end = dayjs(selectedMonth.value).endOf('month')

  return store.getLogsByDateRange(
    start.format('YYYY-MM-DD'),
    end.format('YYYY-MM-DD')
  )
})

// 添加获取总结的方法
const fetchSummary = (type: 'week' | 'month') => {
  try {
    const summaryType = type === 'week' ? 'weekly' : 'monthly'
    let startDate, endDate

    if (type === 'week') {
      startDate = dayjs(selectedWeek.value).startOf('week').format('YYYY-MM-DD')
      endDate = dayjs(selectedWeek.value).endOf('week').format('YYYY-MM-DD')
    } else {
      startDate = dayjs(selectedMonth.value).startOf('month').format('YYYY-MM-DD')
      endDate = dayjs(selectedMonth.value).endOf('month').format('YYYY-MM-DD')
    }

    return summaryService.getHistorySummaries(
      summaryType,
      startDate,
      endDate
    ).then(summaries => {
      if (summaries && summaries.length > 0) {
        if (type === 'week') {
          weekSummary.value = summaries[0].content
        } else {
          monthSummary.value = summaries[0].content
        }
      } else {
        if (type === 'week') {
          weekSummary.value = ''
        } else {
          monthSummary.value = ''
        }
      }
    }).catch(error => {
      console.error('获取总结失败:', error)
      ElMessage.error(error.response?.data?.message || '获取总结失败')
    })
  } catch (error: any) {
    console.error('获取总结失败:', error)
    ElMessage.error(error.response?.data?.message || '获取总结失败')
  }
}

// 日期处理函数
const handleWeekChange = (date: string | null) => {
  if (date) {
    selectedWeek.value = date
    fetchSummary('week')
  }
}

const handleMonthChange = (date: string | null) => {
  if (date) {
    selectedMonth.value = date
    fetchSummary('month')
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}

const formatDateSimple = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}

// 显示生成对话框
const showGenerateDialog = (type: 'week' | 'month') => {
  if (type === 'week') {
    generateForm.value.dateRange = selectedWeek.value
  } else {
    generateForm.value.dateRange = selectedMonth.value
  }
  generateForm.value.prompt = ''
  generateDialogVisible.value = true

  // 自动调用生成接口
  handleGenerate()
}

// 处理生成总结
const handleGenerate = () => {
  if (!generateForm.value.dateRange) {
    ElMessage.warning('请选择时间范围')
    return
  }

  generating.value = true

  let startDate: string
  let endDate: string

  if (activeTab.value === 'week') {
    startDate = dayjs(generateForm.value.dateRange).startOf('week').format('YYYY-MM-DD')
    endDate = dayjs(generateForm.value.dateRange).endOf('week').format('YYYY-MM-DD')
  } else {
    startDate = dayjs(generateForm.value.dateRange).startOf('month').format('YYYY-MM-DD')
    endDate = dayjs(generateForm.value.dateRange).endOf('month').format('YYYY-MM-DD')
  }

  const params: GenerateSummaryParams = {
    start_date: startDate,
    end_date: endDate,
    summary_type: activeTab.value === 'week' ? 'weekly' : 'monthly',
    custom_prompt: generateForm.value.prompt,
    style: generateForm.value.style as 'concise' | 'detailed' | 'technical' | 'business'
  }

  summaryService.generateSummary(params)
    .then(({ content: summary }) => {
      // 更新预览内容
      previewSummary.value = summary
    })
    .catch((error: any) => {
      ElMessage.error(error.response?.data?.message || '生成总结失败')
    })
    .finally(() => {
      generating.value = false
    })
}

// 保存预览的总结
const handleSaveSummary = () => {
  if (activeTab.value === 'week') {
    weekSummary.value = previewSummary.value
  } else {
    monthSummary.value = previewSummary.value
  }

  generateDialogVisible.value = false
  ElMessage.success('总结已保存')
}

// 复制功能
const copyWeekSummary = () => {
  navigator.clipboard.writeText(weekSummary.value)
    .then(() => ElMessage.success('已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败'))
}

const copyMonthSummary = () => {
  navigator.clipboard.writeText(monthSummary.value)
    .then(() => ElMessage.success('已复制到剪贴板'))
    .catch(() => ElMessage.error('复制失败'))
}

// 处理编辑
const handleEdit = (type: 'week' | 'month') => {
  editingContent.value = type === 'week' ? weekSummary.value : monthSummary.value
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = () => {
  if (!editingContent.value.trim()) {
    ElMessage.warning('总结内容不能为空')
    return
  }

  saving.value = true

  let startDate, endDate

  if (activeTab.value === 'week') {
    startDate = dayjs(selectedWeek.value).startOf('week').format('YYYY-MM-DD')
    endDate = dayjs(selectedWeek.value).endOf('week').format('YYYY-MM-DD')
  } else {
    startDate = dayjs(selectedMonth.value).startOf('month').format('YYYY-MM-DD')
    endDate = dayjs(selectedMonth.value).endOf('month').format('YYYY-MM-DD')
  }

  summaryService.saveSummary({
    content: editingContent.value,
    summary_type: activeTab.value === 'week' ? 'weekly' : 'monthly',
    start_date: startDate,
    end_date: endDate
  }).then(() => {
    if (activeTab.value === 'week') {
      weekSummary.value = editingContent.value
    } else {
      monthSummary.value = editingContent.value
    }

    editDialogVisible.value = false
    ElMessage.success('保存成功')
  }).catch(error => {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  }).finally(() => {
    saving.value = false
  })
}

// 修改标签页切换处理
const handleTabChange = (tab: string) => {
  if (tab === 'week' && !weekSummary.value && selectedWeek.value) {
    fetchSummary('week')
  } else if (tab === 'month' && !monthSummary.value) {
    if (!selectedMonth.value) {
      selectedMonth.value = dayjs().format('YYYY-MM-DD')
    }
    fetchSummary('month')
  }
}
</script>

<style scoped>
.summary {
  padding: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.summary-header-container {
  margin-bottom: 24px;
  text-align: center;
}

.main-title {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin-bottom: 24px;
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  transition: all 0.3s;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  height: 3px;
  border-radius: 3px;
  background-image: var(--primary-gradient);
}

.summary-card {
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  transition: all 0.3s;
  overflow: hidden;
  border: none;
}

.summary-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.header-right {
  display: flex;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.date-picker {
  width: 180px;
}

.summary-content {
  padding: var(--spacing-lg);
}

.ai-summary {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.summary-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.summary-icon {
  color: var(--primary-color);
  font-size: 20px;
}

.summary-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.summary-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-radius: var(--border-radius-md);
  transition: all 0.2s;
}

.action-button:hover {
  background-color: rgba(96, 199, 183, 0.1);
}

.summary-preview {
  background-color: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.03);
}

.empty-state {
  padding: var(--spacing-xl) 0;
}

.empty-icon {
  font-size: 60px;
  color: var(--text-light);
  margin-bottom: var(--spacing-md);
}

.empty-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: var(--spacing-md);
}

.generate-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  border-radius: var(--border-radius-md);
  transition: all 0.3s;
}

.generate-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* 编辑对话框样式 */
.edit-dialog :deep(.el-dialog__header) {
  padding: 16px 20px;
  margin: 0;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.edit-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.edit-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.edit-dialog :deep(.el-dialog__headerbtn) {
  top: 16px;
}

.edit-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.md-editor {
  flex: 1;
  border: none !important;
}

:deep(.md-editor-toolbar) {
  background-color: var(--bg-secondary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.md-editor-content) {
  background-color: var(--bg-secondary) !important;
}

.edit-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.action-left,
.action-right {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .summary {
    padding: var(--spacing-md);
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .summary-preview {
    padding: var(--spacing-md);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .header-right {
    width: 100%;
  }

  .date-picker {
    width: 100%;
  }

  .generate-button {
    width: 100%;
  }

  .custom-tabs :deep(.el-tabs__item) {
    padding: 0 16px;
  }
}
</style>
