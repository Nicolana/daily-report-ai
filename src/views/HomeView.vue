<template>
  <div class="home">
    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="stat-card"
        :class="stat.type"
      >
        <div class="stat-icon">
          <el-icon><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 本周概览 -->
    <div class="overview-section">
      <div class="section-header">
        <div class="header-left">
          <h3 class="section-title">本周概览</h3>
          <el-tag size="small" effect="light" class="week-tag">
            第 {{ currentWeek }} 周
          </el-tag>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="$router.push('/new')">
            <el-icon><Plus /></el-icon>写日报
          </el-button>
        </div>
      </div>

      <div class="logs-grid">
        <template v-if="weeklyLogs.length > 0">
          <div 
            v-for="log in weeklyLogs" 
            :key="log.id"
            class="log-card"
          >
            <div class="log-header">
              <div class="log-date">
                <el-tag 
                  size="small" 
                  :type="getTagType(log.report_date)"
                  effect="light"
                >
                  {{ formatDateSimple(log.report_date) }}
                </el-tag>
                <span class="weekday">{{ getDayOfWeek(log.report_date) }}</span>
              </div>
              <div class="log-actions">
                <el-tooltip content="编辑" placement="top">
                  <el-button link type="primary" @click="editLog(log)">
                    <el-icon><EditPen /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="复制" placement="top">
                  <el-button link type="info" @click="copyLog(log)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button link type="danger" @click="deleteLog(log)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>
            <div class="log-content markdown-body" v-html="renderMarkdown(log.content)" />
          </div>
        </template>

        <el-empty v-else>
          <template #description>
            <p>本周暂无日报</p>
            <p class="empty-tip">开始记录你的工作点滴吧</p>
          </template>
          <el-button type="primary" @click="$router.push('/new')">
            立即写日报
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 总结区域 -->
    <div class="summary-section">
      <el-row :gutter="24">
        <el-col :span="12">
          <div class="summary-card weekly">
            <div class="card-header">
              <div class="header-left">
                <h3 class="card-title">周总结</h3>
                <el-tag size="small" type="success" effect="light">本周</el-tag>
              </div>
              <el-button 
                text 
                type="primary" 
                @click="$router.push('/summary')"
              >
                查看更多<el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="card-content">
              <el-empty>
                <template #description>
                  <p>本周总结尚未生成</p>
                  <p class="empty-tip">周五将自动为您生成本周总结</p>
                </template>
                <el-button type="primary" plain>立即生成</el-button>
              </el-empty>
            </div>
          </div>
        </el-col>
        
        <el-col :span="12">
          <div class="summary-card monthly">
            <div class="card-header">
              <div class="header-left">
                <h3 class="card-title">月总结</h3>
                <el-tag size="small" type="warning" effect="light">
                  {{ currentMonth }}月
                </el-tag>
              </div>
              <el-button 
                text 
                type="primary" 
                @click="$router.push('/summary')"
              >
                查看更多<el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
            <div class="card-content">
              <el-empty>
                <template #description>
                  <p>本月总结尚未生成</p>
                  <p class="empty-tip">每月最后一天将自动为您生成月度总结</p>
                </template>
                <el-button type="primary" plain>立即生成</el-button>
              </el-empty>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Calendar,
  EditPen,
  CopyDocument,
  Delete,
  Plus,
  ArrowRight,
  Finished,
  Timer,
  Document
} from '@element-plus/icons-vue'
import { useLogStore } from '../stores/logStore'
import { renderMarkdown } from '../utils/markdown'
import dayjs from '../utils/dayjs'
import {
  formatDateSimple,
  getCurrentWeek,
  getCurrentMonth,
  getDaysUntilWeekend,
  getWeekRange
} from '../utils/dayjs'
import type { DailyReport } from '../api/dailyReport'

const router = useRouter()
const store = useLogStore()

onMounted(async () => {
  await store.fetchLogs()
})

// 获取本周日志
const weeklyLogs = computed(() => {
  const { start, end } = getWeekRange()
  return store.getLogsByDateRange(start, end)
})

// 统计数据
const stats = computed(() => [
  {
    label: '本周日报数',
    value: weeklyLogs.value.length,
    icon: 'Document',
    type: 'primary'
  },
  {
    label: '本周完成率',
    value: `${completionRate.value}%`,
    icon: 'Finished',
    type: 'success'
  },
  {
    label: '距离周末',
    value: `${daysUntilWeekend.value}天`,
    icon: 'Timer',
    type: 'info'
  },
  {
    label: '本月累计',
    value: monthlyTotal.value,
    icon: 'Calendar',
    type: 'warning'
  }
])

const currentWeek = computed(() => getCurrentWeek())
const currentMonth = computed(() => getCurrentMonth())
const completionRate = computed(() => {
  const workDays = 5
  const completedDays = weeklyLogs.value.length
  return Math.round((completedDays / workDays) * 100)
})
const daysUntilWeekend = computed(() => getDaysUntilWeekend())
const monthlyTotal = computed(() => {
  const now = dayjs()
  const start = now.startOf('month').format('YYYY-MM-DD')
  const end = now.endOf('month').format('YYYY-MM-DD')
  return store.getLogsByDateRange(start, end).length
})

// 获取标签类型
const getTagType = (date: string): '' | 'success' | 'warning' | 'info' => {
  const today = dayjs()
  const logDate = dayjs(date)
  
  if (logDate.isSame(today, 'day')) return 'success'
  if (logDate.isSame(today.subtract(1, 'day'), 'day')) return 'warning'
  return 'info'
}

// 获取星期几
const getDayOfWeek = (date: string) => {
  return dayjs(date).format('dddd')
}

// 编辑日志
const editLog = (log: DailyReport) => {
  router.push(`/edit/${log.id}`)
}

// 复制日志
const copyLog = async (log: DailyReport) => {
  try {
    await navigator.clipboard.writeText(log.content)
    ElMessage.success('日志内容已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 删除日志
const deleteLog = async (log: DailyReport) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条日报吗？此操作不可恢复',
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
.home {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 统计卡片样式 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card.primary .stat-icon {
  background-color: rgba(96, 199, 183, 0.1);
  color: var(--primary-color);
}

.stat-card.success .stat-icon {
  background-color: rgba(205, 245, 163, 0.1);
  color: var(--secondary-color);
}

.stat-card.info .stat-icon {
  background-color: #f0f9ff;
  color: #409eff;
}

.stat-card.warning .stat-icon {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

/* 本周概览样式 */
.overview-section {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.week-tag {
  background: rgba(96, 199, 183, 0.1);
  color: var(--primary-color);
  border: none;
}

/* 日志卡片网格 */
.logs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.log-card {
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--border-color);
}

.log-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
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

.weekday {
  color: var(--text-secondary);
  font-size: 14px;
}

.log-actions {
  display: flex;
  gap: var(--spacing-xs);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.log-card:hover .log-actions {
  opacity: 1;
}

.log-content {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
}

/* 总结卡片样式 */
.summary-section {
  margin-bottom: var(--spacing-xl);
}

.summary-card {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty 状态样式 */
.empty-tip {
  color: var(--text-secondary);
  font-size: 14px;
  margin-top: var(--spacing-xs);
}

/* Markdown 样式 */
:deep(.markdown-body) {
  background: none;
  font-size: 14px;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.markdown-body p) {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  color: var(--text-secondary);
}

/* 响应式布局优化 */
@media (max-width: 1200px) {
  .home {
    padding: 0 var(--spacing-lg);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
}

@media (max-width: 768px) {
  .home {
    padding: 0 var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .logs-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .stat-card {
    padding: var(--spacing-md);
  }
  
  .overview-section,
  .summary-card {
    padding: var(--spacing-lg);
  }
}
</style> 