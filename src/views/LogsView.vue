<template>
  <div class="logs">
    <el-card v-loading="store.loading">
      <template #header>
        <div class="card-header">
          <span>日志列表</span>
          <div class="header-actions">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY年MM月DD日"
              value-format="YYYY-MM-DD"
              :shortcuts="[
                {
                  text: '本周',
                  value: () => {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
                    return [start, end]
                  },
                },
                {
                  text: '本月',
                  value: () => {
                    const end = new Date()
                    const start = new Date()
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
                    return [start, end]
                  },
                }
              ]"
            />
            <el-input
              v-model="searchKeyword"
              placeholder="搜索关键词"
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-timeline v-if="filteredLogs.length > 0">
        <el-timeline-item
          v-for="log in filteredLogs"
          :key="log.id"
          :timestamp="formatDateSimple(log.report_date)"
          placement="top"
        >
          <el-card>
            <div class="log-content">
              <div class="log-text markdown-body" v-html="renderMarkdown(log.content)" />
              <div class="log-actions">
                <el-button
                  type="primary"
                  link
                  @click="handleEdit(log)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleDelete(log)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty
        v-else
        description="暂无日志"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useLogStore } from '../stores/logStore'
import { formatDateSimple } from '../utils/dayjs'
import { renderMarkdown } from '../utils/markdown'
import type { DailyReport } from '../api/dailyReport'

const router = useRouter()
const store = useLogStore()

onMounted(async () => {
  await store.fetchLogs()
})

const dateRange = ref<[string, string]>(['', ''])
const searchKeyword = ref('')

const filteredLogs = computed(() => {
  let logs = store.logs

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    logs = store.getLogsByDateRange(start, end)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    logs = logs.filter(log => 
      log.content.toLowerCase().includes(keyword)
    )
  }

  return logs.sort((a, b) => 
    new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
  )
})

const handleEdit = (log: DailyReport) => {
  // TODO: 实现编辑功能
  router.push(`/edit/${log.id}`)
}

const handleDelete = async (log: DailyReport) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条日志吗？',
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
.logs {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 200px;
}

.log-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.log-text {
  flex: 1;
  white-space: pre-wrap;
}

.log-actions {
  display: flex;
  gap: 8px;
}

:deep(.markdown-body) {
  font-size: 14px;
  line-height: 1.6;
}

:deep(.markdown-body h1),
:deep(.markdown-body h2),
:deep(.markdown-body h3) {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

:deep(.markdown-body p) {
  margin-top: 0;
  margin-bottom: 16px;
}

:deep(.markdown-body ul),
:deep(.markdown-body ol) {
  padding-left: 2em;
  margin-bottom: 16px;
}
</style> 