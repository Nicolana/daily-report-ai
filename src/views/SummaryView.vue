<template>
  <div class="summary">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="周总结" name="week">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>周总结</span>
              <el-date-picker
                v-model="selectedWeek"
                type="week"
                format="YYYY年第ww周"
                placeholder="选择周"
                value-format="YYYY-MM-DD"
                @change="handleWeekChange"
              />
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
                  <MarkedVue :content="log.content" />
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无日志" />
            </div>

            <div class="ai-summary">
              <h3>AI 总结</h3>
              <div class="summary-preview" v-if="weekSummary">
                <MarkedVue :content="weekSummary" />
              </div>
              <el-empty v-else description="点击生成按钮开始总结" />
              <div class="summary-actions">
                <el-button 
                  type="primary" 
                  :loading="generatingWeekSummary"
                  @click="showGenerateDialog('week')"
                >
                  {{ generatingWeekSummary ? '生成中...' : '生成总结' }}
                </el-button>
                <el-button 
                  :disabled="!weekSummary"
                  @click="copyWeekSummary"
                >
                  复制总结
                </el-button>
              </div>
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
                  <MarkedVue :content="log.content" />
                </el-timeline-item>
              </el-timeline>
              <el-empty v-else description="暂无日志" />
            </div>

            <div class="ai-summary">
              <h3>AI 总结</h3>
              <div class="summary-preview" v-if="monthSummary">
                <MarkedVue :content="monthSummary" />
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
      width="600px"
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
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="generateDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleGenerate" :loading="generating">
            开始生成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- AI 对话框 -->
    <el-dialog
      v-model="chatDialogVisible"
      title="AI 助手"
      width="800px"
      class="chat-dialog"
    >
      <div class="chat-container">
        <div class="chat-messages" ref="chatMessagesRef">
          <div 
            v-for="(message, index) in chatMessages" 
            :key="index"
            :class="['message', message.role]"
          >
            <div class="message-content">
              <MarkedVue :content="message.content" />
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <el-input
            v-model="chatInput"
            type="textarea"
            :rows="3"
            placeholder="输入您的反馈或建议..."
            @keyup.enter.ctrl="handleSendMessage"
          />
          <div class="chat-actions">
            <el-text class="tip-text" type="info">按 Ctrl + Enter 发送</el-text>
            <el-button type="primary" @click="handleSendMessage" :loading="generating">
              发送
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
import { QuestionFilled } from '@element-plus/icons-vue'
import { useLogStore } from '../stores/logStore'
import { renderMarkdown } from '../utils/markdown'
import dayjs from '../utils/dayjs'
import type { LogEntry } from '../types/log'
import { summaryService, type GenerateSummaryParams, type ChatMessage } from '../api/summary'

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

// AI 对话相关状态
const chatDialogVisible = ref(false)
const chatInput = ref('')
const chatMessages = ref<Array<{role: 'user' | 'assistant', content: string}>>([])
const chatMessagesRef = ref<HTMLElement>()

// AI 总结内容
const weekSummary = ref('')
const monthSummary = ref('')

// 生成状态
const generatingWeekSummary = ref(false)
const generatingMonthSummary = ref(false)

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

// 显示生成对话框
const showGenerateDialog = (type: 'week' | 'month') => {
  generateForm.value.dateRange = type === 'week' ? selectedWeek.value : selectedMonth.value
  generateForm.value.prompt = ''
  generateForm.value.style = 'concise'
  generateDialogVisible.value = true
}

// 处理生成总结
const handleGenerate = async () => {
  if (!generateForm.value.dateRange) {
    ElMessage.warning('请选择时间范围')
    return
  }

  generating.value = true
  try {
    const params: GenerateSummaryParams = {
      dateRange: generateForm.value.dateRange,
      prompt: generateForm.value.prompt,
      style: generateForm.value.style as 'concise' | 'detailed' | 'technical' | 'business'
    }

    const logs = activeTab.value === 'week' ? weeklyLogs.value : monthlyLogs.value
    const { content: summary } = await summaryService.generateSummary(logs, params)

    // 更新总结内容
    if (activeTab.value === 'week') {
      weekSummary.value = summary
    } else {
      monthSummary.value = summary
    }

    // 关闭生成对话框，打开聊天对话框
    generateDialogVisible.value = false
    chatDialogVisible.value = true
    
    // 初始化聊天消息
    chatMessages.value = [
      { role: 'assistant', content: '我已经生成了总结，您觉得怎么样？如果需要调整，请告诉我您的想法。' },
      { role: 'assistant', content: summary }
    ]
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '生成总结失败')
  } finally {
    generating.value = false
  }
}

// 处理发送消息
const handleSendMessage = async () => {
  if (!chatInput.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    role: 'user',
    content: chatInput.value
  })

  const userMessage = chatInput.value
  chatInput.value = ''

  // 滚动到底部
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }

  generating.value = true
  try {
    const { content: response } = await summaryService.improveSummary({
      originalSummary: activeTab.value === 'week' ? weekSummary.value : monthSummary.value,
      feedback: userMessage,
      type: activeTab.value as 'week' | 'month'
    })

    // 添加 AI 回复
    chatMessages.value.push({
      role: 'assistant',
      content: response
    })

    // 更新总结内容
    if (activeTab.value === 'week') {
      weekSummary.value = response
    } else {
      monthSummary.value = response
    }
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取回复失败')
  } finally {
    generating.value = false
  }
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

/* 聊天对话框样式 */
.chat-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 600px;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.message {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-width: 80%;
}

.message.user {
  align-self: flex-end;
}

.message.assistant {
  align-self: flex-start;
}

.message-content {
  background: var(--bg-tertiary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.message.user .message-content {
  background: var(--primary-color);
  color: white;
}

.chat-input {
  border-top: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.chat-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-text {
  font-size: 12px;
}
</style> 