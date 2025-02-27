<template>
  <div class="home">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6" v-for="stat in stats" :key="stat.label">
        <div class="stat-card" :class="stat.type">
          <div class="stat-icon">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 本周概览部分 -->
    <div class="weekly-overview">
      <el-card class="overview-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <span class="section-title">本周概览</span>
              <el-tag size="small" effect="plain" class="week-tag">
                第 {{ currentWeek }} 周
              </el-tag>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="$router.push('/new')">
                <el-icon><Plus /></el-icon>写日报
              </el-button>
            </div>
          </div>
        </template>
        
        <div v-if="weeklyLogs.length === 0" class="empty-state">
          <el-empty>
            <template #description>
              <p>本周暂无日报</p>
              <p class="empty-tip">开始记录你的工作点滴吧</p>
            </template>
            <el-button type="primary" @click="$router.push('/new')">
              立即写日报
            </el-button>
          </el-empty>
        </div>
        
        <div v-else class="log-list">
          <div v-for="log in weeklyLogs" :key="log.id" class="log-item">
            <div class="log-header">
              <div class="log-date">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(log.report_date) }}</span>
              </div>
              <div class="log-actions">
                <el-button 
                  link 
                  type="primary" 
                  @click="editLog(log)"
                >
                  <el-icon><EditPen /></el-icon>
                </el-button>
                <el-button 
                  link 
                  type="primary" 
                  @click="copyLog(log)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button 
                  link 
                  type="danger" 
                  @click="deleteLog(log)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="log-content markdown-body" v-html="renderMarkdown(log.content)" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 总结部分 -->
    <el-row :gutter="20" class="summary-row">
      <el-col :span="12">
        <el-card class="summary-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="section-title">周总结</span>
                <el-tag size="small" type="success" effect="plain" class="ml-2">
                  本周
                </el-tag>
              </div>
              <el-button text type="primary" @click="$router.push('/summary')">
                查看更多<el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="summary-content">
            <el-empty>
              <template #description>
                <p>本周总结尚未生成</p>
                <p class="empty-tip">周五将自动为您生成本周总结</p>
              </template>
              <el-button type="primary" plain>立即生成</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="summary-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="section-title">月总结</span>
                <el-tag size="small" type="warning" effect="plain" class="ml-2">
                  {{ currentMonth }}月
                </el-tag>
              </div>
              <el-button text type="primary" @click="$router.push('/summary')">
                查看更多<el-icon class="el-icon--right"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="summary-content">
            <el-empty>
              <template #description>
                <p>本月总结尚未生成</p>
                <p class="empty-tip">每月最后一天将自动为您生成月度总结</p>
              </template>
              <el-button type="primary" plain>立即生成</el-button>
            </el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useLogStore } from '../stores/logStore'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { renderMarkdown } from '../utils/markdown'
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
import {
  formatDate,
  getCurrentWeek,
  getCurrentMonth,
  getDaysUntilWeekend,
  getWeekRange
} from '../utils/dayjs'
import type { DailyReport } from '../api/dailyReport'

const store = useLogStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchLogs()
})

const weeklyLogs = computed(() => {
  const { start, end } = getWeekRange()
  return store.getLogsByDateRange(start, end)
})

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
    label: '距离周末还有',
    value: daysUntilWeekend.value,
    icon: 'Timer',
    type: 'info'
  },
  {
    label: '本月累计',
    value: store.logs.length,
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

const editLog = (log: DailyReport) => {
  router.push(`/edit/${log.id}`)
}

const copyLog = async (log: DailyReport) => {
  try {
    await navigator.clipboard.writeText(log.content)
    ElMessage.success('日志内容已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

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
}

/* 统计卡片样式 */
.stats-row {
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon .el-icon {
  font-size: 24px;
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

/* 周概览卡片样式 */
.weekly-overview {
  margin-bottom: var(--spacing-lg);
}

.overview-card {
  background: var(--bg-secondary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.week-tag {
  background: var(--bg-tertiary);
  color: var(--primary-color);
  border-color: var(--primary-light);
}

/* 日志列表样式 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.log-item {
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

.log-item:hover {
  background: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
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
}

/* 总结卡片样式 */
.summary-row {
  margin-bottom: var(--spacing-lg);
}

.summary-card {
  height: 100%;
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
}

.summary-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Empty 状态样式 */
.empty-state {
  padding: var(--spacing-xl) 0;
}

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
</style> 