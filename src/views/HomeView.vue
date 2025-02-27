<template>
  <div class="home">
    <!-- 顶部统计卡片 -->
    <el-row :gutter="20" class="mb-4" v-loading="store.loading">
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ weeklyLogs.length }}</div>
              <div class="stat-label">本周日报数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon green">
              <el-icon><Finished /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ completionRate }}%</div>
              <div class="stat-label">本周完成率</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon blue">
              <el-icon><Timer /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ daysUntilWeekend }}</div>
              <div class="stat-label">距离周末还有</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 本周概览部分 -->
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="section-title">本周概览</span>
                <el-tag size="small" effect="plain" class="ml-2">
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
                <p class="empty-tip">点击右上角按钮开始写今天的日报吧</p>
              </template>
              <el-button type="primary" @click="$router.push('/new')">
                立即写日报
              </el-button>
            </el-empty>
          </div>
          
          <div v-else class="log-list">
            <div v-for="log in weeklyLogs" :key="log.id" class="log-item">
              <div class="log-header">
                <h3>
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(log.report_date) }}
                </h3>
                <el-dropdown>
                  <el-button link>
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="editLog(log)">编辑</el-dropdown-item>
                      <el-dropdown-item @click="copyLog(log)">复制</el-dropdown-item>
                      <el-dropdown-item divided danger @click="deleteLog(log)">
                        删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div class="log-content markdown-body" v-html="renderMarkdown(log.content)" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 总结部分 -->
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover" class="summary-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="section-title">周总结</span>
                <el-tag size="small" type="success" effect="plain" class="ml-2">
                  本周
                </el-tag>
              </div>
              <el-button text @click="$router.push('/summary')">
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
        <el-card shadow="hover" class="summary-card">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="section-title">月总结</span>
                <el-tag size="small" type="warning" effect="plain" class="ml-2">
                  {{ currentMonth }}月
                </el-tag>
              </div>
              <el-button text @click="$router.push('/summary')">
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
import { Calendar, Finished, Timer, Plus, More, ArrowRight } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { renderMarkdown } from '../utils/markdown'
import {
  formatDate,
  getCurrentWeek,
  getCurrentMonth,
  getDaysUntilWeekend,
  getWeekRange
} from '../utils/dayjs'
import type { DailyReport } from '../api/dailyReport'
import { useRouter } from 'vue-router'

const store = useLogStore()
const router = useRouter()

onMounted(async () => {
  await store.fetchLogs()
})

const weeklyLogs = computed(() => {
  const { start, end } = getWeekRange()
  return store.getLogsByDateRange(start, end)
})

const currentWeek = computed(() => getCurrentWeek())
const currentMonth = computed(() => getCurrentMonth())
const completionRate = computed(() => {
  const workDays = 5
  const completedDays = weeklyLogs.value.length
  return Math.round((completedDays / workDays) * 100)
})
const daysUntilWeekend = computed(() => getDaysUntilWeekend())

const handleEdit = (log: DailyReport) => {
  router.push(`/edit/${log.id}`)
}

// 日志操作方法
const editLog = (log: any) => {
  // TODO: 实现编辑功能
}

const copyLog = async (log: any) => {
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
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.mb-4 {
  margin-bottom: 24px;
}

.ml-2 {
  margin-left: 8px;
}

/* 统计卡片样式 */
.stat-card {
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-icon.green {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.stat-icon.blue {
  background-color: var(--el-color-info-light-9);
  color: var(--el-color-info);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
}

/* 日志列表样式 */
.log-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.log-item {
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 24px;
}

.log-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-content {
  color: var(--el-text-color-regular);
  line-height: 1.6;
}

/* 空状态样式 */
.empty-state {
  padding: 48px 0;
}

.empty-tip {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 8px;
}

/* Markdown 预览样式 */
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin-bottom: 16px;
}

/* 总结卡片样式 */
.summary-card {
  height: 100%;
}

.summary-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 