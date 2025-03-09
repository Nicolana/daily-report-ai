<template>
  <div class="logs-view" v-loading="store.loading">
    <!-- 搜索和筛选区域 -->
    <div class="filter-container">
      <div class="filter-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日志内容..."
          class="search-input"
          :prefix-icon="Search"
          clearable
        />
        <el-radio-group v-model="groupBy" class="group-selector">
          <el-radio-button label="week">周</el-radio-button>
          <el-radio-button label="month">月</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY/MM/DD"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          class="date-picker"
          size="default"
        />
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-section">
      <template v-if="Object.keys(groupedLogs).length > 0">
        <div v-for="(logs, groupKey) in groupedLogs" :key="groupKey" class="log-group">
          <div class="group-header">
            <h3>{{ groupKey }}</h3>
          </div>

          <el-timeline>
            <el-timeline-item
              v-for="log in logs"
              :key="log.id"
              :timestamp="formatDateSimple(log.report_date)"
              placement="top"
              :type="getTimelineItemType(log.report_date)"
            >
              <div class="log-card">
                <div class="log-header">
                  <div class="log-date">
                    <el-tag size="small" :type="getTagType(log.report_date)">
                      {{ getDayOfWeek(log.report_date) }}
                    </el-tag>
                    <span class="date-text">{{ formatDateSimple(log.report_date) }}</span>
                  </div>
                  <div class="log-actions">
                    <el-tooltip content="编辑" placement="top">
                      <el-button
                        link
                        type="primary"
                        @click="handleEdit(log)"
                      >
                        <el-icon><EditPen /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="复制" placement="top">
                      <el-button
                        link
                        type="info"
                        @click="handleCopy(log)"
                      >
                        <el-icon><CopyDocument /></el-icon>
                      </el-button>
                    </el-tooltip>
                    <el-tooltip content="删除" placement="top">
                      <el-button
                        link
                        type="danger"
                        @click="handleDelete(log)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </el-tooltip>
                  </div>
                </div>
                <div class="log-content markdown-body" v-html="renderMarkdown(log.content)" />
                <div class="log-footer">
                  <div class="log-meta">
                    <el-text type="info" size="small">
                      创建于 {{ formatTime(log.created_at) }}
                    </el-text>
                    <template v-if="log.updated_at">
                      <el-divider direction="vertical" />
                      <el-text type="info" size="small">
                        更新于 {{ formatTime(log.updated_at) }}
                      </el-text>
                    </template>
                  </div>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>

      <el-empty
        v-else
        :description="missingDates.length > 0 ? '咦，有日报还没写完哦！' : '这段时间还没有日志呢'"
      >
        <template #image>
          <img src="../assets/empty-state.svg" class="empty-image" />
        </template>
        <template #extra>
          <template v-if="missingDates.length > 0">
            <p class="missing-dates-hint">
              还需要补充以下日期的日报：
              <el-tag
                v-for="date in missingDates"
                :key="date"
                size="small"
                class="missing-date-tag"
              >
                {{ formatDateSimple(date) }}
              </el-tag>
            </p>
          </template>
          <el-button type="primary" @click="$router.push('/new')">
            {{ missingDates.length > 0 ? '去补写日报' : '立即写日报' }}
          </el-button>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search, EditPen, CopyDocument, Delete, Calendar } from '@element-plus/icons-vue'
import { useLogStore } from '../stores/logStore'
import { formatDateSimple } from '../utils/dayjs'
import { renderMarkdown } from '../utils/markdown'
import dayjs from '../utils/dayjs'
import type { DailyReport } from '../api/dailyReport'

const router = useRouter()
const store = useLogStore()

const dateRange = ref<[string, string]>([
  dayjs().startOf('week').format('YYYY-MM-DD'),
  dayjs().endOf('week').format('YYYY-MM-DD')
])
const searchKeyword = ref('')
const groupBy = ref<'week' | 'month'>('week')

// 日期快捷选项
const dateShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '本月',
    value: () => {
      const now = dayjs()
      return [now.startOf('month').toDate(), now.endOf('month').toDate()]
    }
  }
]

onMounted(async () => {
  await store.fetchLogs()
})

// 监听搜索关键词变化
watch(searchKeyword, async (newValue) => {
  await store.fetchLogs(newValue)
})

const filteredLogs = computed(() => {
  let logs = store.logs

  if (dateRange.value[0] && dateRange.value[1]) {
    logs = logs.filter(log => {
      const date = dayjs(log.report_date)
      return date.isSameOrAfter(dateRange.value[0]) &&
             date.isSameOrBefore(dateRange.value[1])
    })
  }

  return logs
})

// 分组后的日志
const groupedLogs = computed(() => {
  const logs = filteredLogs.value
  const groups: { [key: string]: DailyReport[] } = {}

  logs.forEach(log => {
    const date = dayjs(log.report_date)
    const key = groupBy.value === 'week'
      ? `${date.year()}年第${date.week()}周`
      : date.format('YYYY年MM月')

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(log)
  })

  return groups
})

// 获取本周未填写的日期
const missingDates = computed(() => {
  if (!dateRange.value[0] || !dateRange.value[1]) return []

  const start = dayjs(dateRange.value[0])
  const end = dayjs(dateRange.value[1])
  const existingDates = new Set(filteredLogs.value.map(log => log.report_date))
  const missing: string[] = []

  let current = start
  while (current.isSameOrBefore(end)) {
    if (!existingDates.has(current.format('YYYY-MM-DD'))) {
      missing.push(current.format('YYYY-MM-DD'))
    }
    current = current.add(1, 'day')
  }

  return missing
})

// 获取星期几
const getDayOfWeek = (date: string) => {
  return dayjs(date).format('dddd')
}

// 格式化时间
const formatTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取时间线项的类型
const getTimelineItemType = (date: string): any => {
  const today = dayjs()
  const logDate = dayjs(date)

  if (logDate.isSame(today, 'day')) return 'primary'
  if (logDate.isSame(today.subtract(1, 'day'), 'day')) return 'success'
  return ''
}

// 获取标签类型
const getTagType = (date: string) => {
  const today = dayjs()
  const logDate = dayjs(date)

  if (logDate.isSame(today, 'day')) return 'primary'
  if (logDate.isSame(today.subtract(1, 'day'), 'day')) return 'success'
  return 'info'
}

const handleEdit = (log: DailyReport) => {
  router.push(`/edit/${log.id}`)
}

const handleCopy = async (log: DailyReport) => {
  try {
    await navigator.clipboard.writeText(log.content)
    ElMessage.success('日志内容已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const handleDelete = async (log: DailyReport) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条日志吗？此操作不可恢复',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    await store.deleteLog(log.id)
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(store.error || '删除失败')
    }
  }
}
</script>

<style scoped>
.logs-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--spacing-lg) 0;
}

/* 搜索和筛选区域 */
.filter-container {
  margin-bottom: var(--spacing-md);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.search-input {
  width: 240px;
}

.group-selector {
  margin: 0 var(--spacing-xs);
}

.date-picker {
  width: 260px;
}

/* 日志列表区域 */
.logs-section {
  background: #ffffff;
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
}

:deep(.el-timeline) {
  padding: var(--spacing-md) 0;
}

:deep(.el-timeline-item__node--primary) {
  background-color: var(--primary-color);
}

:deep(.el-timeline-item__node--success) {
  background-color: var(--secondary-color);
}

.log-card {
  background: #ffffff;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.log-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.log-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.date-text {
  color: var(--text-secondary);
  font-size: 14px;
}

.log-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.log-content {
  color: var(--text-primary);
  line-height: 1.6;
  margin: var(--spacing-lg) 0;
}

.log-footer {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.log-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 12px;
}

/* Markdown 样式 */
:deep(.markdown-body) {
  background: none;
  font-size: 14px;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.markdown-body p) {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .filter-row {
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }

  .search-input {
    width: 100%;
  }

  .date-picker {
    width: 100%;
  }
}

.log-group {
  margin-bottom: var(--spacing-xl);
}

.group-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--border-color);
}

.group-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.empty-image {
  width: 200px;
  height: 200px;
}

.missing-dates-hint {
  margin-bottom: var(--spacing-md);
  color: var(--text-secondary);
}

.missing-date-tag {
  margin: 0 var(--spacing-xs);
}
</style>
