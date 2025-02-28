<template>
  <div class="summary">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="周总结" name="week">
        <el-card>
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
                />
              </div>
            </div>
          </template>

          <div class="summary-content">
            <div class="logs-section">
              <h3>本周日志</h3>
              <el-timeline v-if="weeklyLogs.length > 0">
                <el-timeline-item
                  v-for="log in weeklyLogs"
                  :key="log.id"
                  :timestamp="formatDateSimple(log.report_date)"
                  placement="top"
                >
                  <MarkdownRender :content="log.content" />
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无日志" />
            </div>

            <div class="ai-summary">
              <div class="summary-header">
                <h3>AI 总结</h3>
                <div class="summary-actions" v-if="weekSummary">
                  <el-button 
                    text 
                    type="primary" 
                    @click="handleEdit('week')"
                  >
                    <el-icon><EditPen /></el-icon>编辑
                  </el-button>
                  <el-button 
                    text 
                    type="info" 
                    @click="copyWeekSummary"
                  >
                    <el-icon><CopyDocument /></el-icon>复制
                  </el-button>
                </div>
              </div>
              
              <div class="summary-preview" v-if="weekSummary">
                <MarkdownRender :content="weekSummary" />
              </div>
              <el-empty v-else description="点击生成按钮开始总结">
                <el-button type="primary" @click="showGenerateDialog('week')">
                  生成总结
                </el-button>
              </el-empty>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="月总结" name="month">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>月总结</span>
              <el-date-picker
                v-model="selectedMonth"
                type="month"
                format="YYYY年MM月"
                placeholder="选择月份"
                value-format="YYYY-MM-DD"
                @change="handleMonthChange"
              />
            </div>
          </template>

          <div class="summary-content">
            <div class="logs-section">
              <h3>本月日志</h3>
              <el-timeline v-if="monthlyLogs.length > 0">
                <el-timeline-item
                  v-for="log in monthlyLogs"
                  :key="log.id"
                  :timestamp="formatDateSimple(log.report_date)"
                  placement="top"
                >
                  <MarkdownRender :content="log.content" />
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无日志" />
            </div>

            <div class="ai-summary">
              <h3>AI 总结</h3>
              <div class="summary-preview" v-if="monthSummary">
                <MarkdownRender :content="monthSummary" />
              </div>
              <el-empty v-else description="点击生成按钮开始总结" />
              <div class="summary-actions">
                <el-button 
                  type="primary" 
                  :loading="generatingMonthSummary"
                  @click="showGenerateDialog('month')"
                >
                  {{ generatingMonthSummary ? '生成中...' : '生成总结' }}
                </el-button>
                <el-button 
                  :disabled="!monthSummary"
                  @click="copyMonthSummary"
                >
                  复制总结
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 生成总结对话框 -->
    <el-dialog
      v-model="generateDialogVisible"
      :title="`生成${activeTab === 'week' ? '周' : '月'}总结`"
      width="800px"
    >
      <div class="generate-form">
        <!-- 时间范围选择 -->
        <div class="form-item">
          <div class="form-label">时间范围</div>
          <el-date-picker
            v-if="activeTab === 'week'"
            v-model="generateForm.dateRange"
            type="week"
            format="YYYY年第ww周"
            placeholder="选择周"
            value-format="YYYY-MM-DD"
          />
          <el-date-picker
            v-else
            v-model="generateForm.dateRange"
            type="month"
            format="YYYY年MM月"
            placeholder="选择月份"
            value-format="YYYY-MM-DD"
          />
        </div>

        <!-- 提示词输入 -->
        <div class="form-item">
          <div class="form-label">
            提示词
            <el-tooltip content="添加提示词可以帮助 AI 更好地理解您的需求" placement="top">
              <el-icon class="help-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
          <el-input
            v-model="generateForm.prompt"
            type="textarea"
            :rows="3"
            placeholder="例如：请着重关注项目进展和技术难点，以及解决方案"
          />
        </div>

        <!-- 总结风格 -->
        <div class="form-item">
          <div class="form-label">总结风格</div>
          <el-radio-group v-model="generateForm.style">
            <el-radio-button label="concise">简洁</el-radio-button>
            <el-radio-button label="detailed">详细</el-radio-button>
            <el-radio-button label="technical">技术导向</el-radio-button>
            <el-radio-button label="business">业务导向</el-radio-button>
          </el-radio-group>
        </div>
        
        <!-- 预览区域 -->
        <div class="form-item preview-section" v-if="previewSummary">
          <div class="form-label">预览</div>
          <div class="summary-preview">
            <MarkdownEditor v-model="previewSummary" />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="generateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGenerate" :loading="generating">
            {{ previewSummary ? '重新生成' : '生成总结' }}
          </el-button>
          <el-button 
            type="success" 
            @click="handleSaveSummary" 
            :disabled="!previewSummary"
          >
            保存总结
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑总结对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="`编辑${activeTab === 'week' ? '周' : '月'}总结`"
      width="800px"
      class="edit-dialog"
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { QuestionFilled, EditPen, CopyDocument } from '@element-plus/icons-vue'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import { useLogStore } from '../stores/logStore'
import dayjs from '../utils/dayjs'
import { summaryService, type GenerateSummaryParams } from '../api/summary'
import 'md-editor-v3/lib/style.css'
import MarkdownRender from '../components/MarkdownRender.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'

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

onMounted(async () => {
  await store.fetchLogs()
  // 默认选择本周
  selectedWeek.value = dayjs().format('YYYY-MM-DD')
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

// 日期处理函数
const handleWeekChange = (date: string | null) => {
  if (date) {
    selectedWeek.value = date
    weekSummary.value = ''
  }
}

const handleMonthChange = (date: string | null) => {
  if (date) {
    selectedMonth.value = date
    monthSummary.value = ''
  }
}

// 格式化日期
const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}

const formatDateSimple = (dateStr: string) => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}

// 处理生成总结
const handleGenerate = async () => {
  if (!generateForm.value.dateRange) {
    ElMessage.warning('请选择时间范围')
    return
  }

  generating.value = true
  try {
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

    const { content: summary } = await summaryService.generateSummary(params)

    // 更新预览内容
    previewSummary.value = summary
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '生成总结失败')
  } finally {
    generating.value = false
  }
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

// 显示生成对话框
const showGenerateDialog = (type: 'week' | 'month') => {
  if (type === 'week') {
    generateForm.value.dateRange = selectedWeek.value
  } else {
    generateForm.value.dateRange = selectedMonth.value
  }
  generateForm.value.prompt = ''
  generateForm.value.style = 'concise'
  previewSummary.value = '' // 清空预览内容
  generateDialogVisible.value = true
}

// 复制功能
const copyWeekSummary = async () => {
  try {
    await navigator.clipboard.writeText(weekSummary.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const copyMonthSummary = async () => {
  try {
    await navigator.clipboard.writeText(monthSummary.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 处理编辑
const handleEdit = (type: 'week' | 'month') => {
  editingContent.value = type === 'week' ? weekSummary.value : monthSummary.value
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!editingContent.value.trim()) {
    ElMessage.warning('总结内容不能为空')
    return
  }

  saving.value = true
  try {
    const response = await summaryService.saveSummary({
      content: editingContent.value,
      type: activeTab.value,
      dateRange: activeTab.value === 'week' ? selectedWeek.value : selectedMonth.value
    })

    if (activeTab.value === 'week') {
      weekSummary.value = response.content
    } else {
      monthSummary.value = response.content
    }

    editDialogVisible.value = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.summary {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.logs-section,
.ai-summary {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
}

h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 16px;
  color: #666;
}

.log-content {
  margin: 10px 0;
}

.summary-preview {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.preview-content {
  white-space: pre-wrap;
}

.summary-actions {
  margin-top: 12px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

:deep(.el-timeline-item__content) {
  max-width: 100%;
}

:deep(.markdown-body) {
  background: none;
}

/* 生成对话框样式 */
.generate-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.form-label {
  font-weight: 500;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.help-icon {
  color: var(--text-secondary);
  font-size: 16px;
  cursor: help;
}

.preview-section {
  margin-top: 16px;
  border-top: 1px solid var(--border-color);
  padding-top: 16px;
}

.summary-preview {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

/* 编辑对话框样式 */
.edit-dialog :deep(.el-dialog__body) {
  padding: 0;
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
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.action-left,
.action-right {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

/* 总结预览区域样式 */
.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.summary-actions {
  display: flex;
  gap: var(--spacing-xs);
}
</style> 