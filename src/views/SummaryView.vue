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
                  @click="generateWeekSummary"
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
                  @click="generateMonthSummary"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useLogStore } from '../stores/logStore'
import { renderMarkdown } from '../utils/markdown'
import dayjs from '../utils/dayjs'
import type { LogEntry } from '../types/log'

const store = useLogStore()
const activeTab = ref('week')

const selectedWeek = ref<string>('')
const selectedMonth = ref<string>('')

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

// AI 总结生成
const generateWeekSummary = async () => {
  if (weeklyLogs.value.length === 0) {
    ElMessage.warning('没有找到本周的日志记录')
    return
  }

  generatingWeekSummary.value = true
  try {
    // TODO: 调用 AI API 生成总结
    const summary = generateSummary(weeklyLogs.value, '周')
    weekSummary.value = summary
    ElMessage.success('周报总结已生成')
  } catch (error) {
    ElMessage.error('生成总结失败')
  } finally {
    generatingWeekSummary.value = false
  }
}

const generateMonthSummary = async () => {
  if (monthlyLogs.value.length === 0) {
    ElMessage.warning('没有找到本月的日志记录')
    return
  }

  generatingMonthSummary.value = true
  try {
    // TODO: 调用 AI API 生成总结
    const summary = generateSummary(monthlyLogs.value, '月')
    monthSummary.value = summary
    ElMessage.success('月报总结已生成')
  } catch (error) {
    ElMessage.error('生成总结失败')
  } finally {
    generatingMonthSummary.value = false
  }
}

// 临时的总结生成函数（后续替换为 AI API）
const generateSummary = (logs: LogEntry[], type: '周' | '月') => {
  const tasks = logs.map(log => log.content).join('\n\n')
  return `# ${type}报总结\n\n## 工作内容\n\n${tasks}\n\n## 主要成果\n\n1. 完成了预定任务\n2. 解决了若干问题\n\n## 下${type}计划\n\n1. 继续推进项目进度\n2. 优化现有功能`
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
</style> 