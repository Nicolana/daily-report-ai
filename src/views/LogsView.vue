<template>
  <div class="logs-view" v-loading="store.loading">
    <!-- 搜索和筛选区域 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索日志内容..."
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      
      <div class="filter-right">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          format="YYYY年MM月DD日"
          value-format="YYYY-MM-DD"
          :shortcuts="dateShortcuts"
          class="date-picker"
        />
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-section">
      <el-timeline v-if="filteredLogs.length > 0">
        <el-timeline-item
          v-for="log in filteredLogs"
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
                <el-divider direction="vertical" />
                <el-text type="info" size="small">
                  更新于 {{ formatTime(log.updated_at) }}
                </el-text>
              </div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>

      <el-empty
        v-else
        description="暂无日志"
      >
        <template #extra>
          <el-button type="primary" @click="$router.push('/new')">
            立即写日报
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
import { Search, EditPen, CopyDocument, Delete } from '@element-plus/icons-vue'
import { useLogStore } from '../stores/logStore'
import { formatDateSimple } from '../utils/dayjs'
import { renderMarkdown } from '../utils/markdown'
import dayjs from '../utils/dayjs'
import type { DailyReport } from '../api/dailyReport'

const router = useRouter()
const store = useLogStore()

const dateRange = ref<[string, string]>(['', ''])
const searchKeyword = ref('')

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

// 获取星期几
const getDayOfWeek = (date: string) => {
  return dayjs(date).format('dddd')
}

// 格式化时间
const formatTime = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取时间线项的类型
const getTimelineItemType = (date: string) => {
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
.filter-section {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.filter-left {
  flex: 1;
}

.search-input {
  max-width: 300px;
}

.date-picker {
  width: 360px;
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
  .filter-section {
    flex-direction: column;
  }
  
  .search-input,
  .date-picker {
    width: 100%;
    max-width: none;
  }
}
</style> 