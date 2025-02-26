<template>
  <div class="logs">
    <el-card>
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
          :timestamp="formatDate(log.date)"
          placement="top"
        >
          <el-card>
            <div class="log-content">
              <div class="log-text">{{ log.content }}</div>
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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { useLogStore } from '../stores/logStore'
import { format } from 'date-fns'
import type { LogEntry } from '../types/log'

const router = useRouter()
const store = useLogStore()

const dateRange = ref<string[]>([])
const searchKeyword = ref('')

const filteredLogs = computed(() => {
  let logs = store.logs

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    logs = logs.filter(log => log.date >= start && log.date <= end)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    logs = logs.filter(log => 
      log.content.toLowerCase().includes(keyword)
    )
  }

  return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
})

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'yyyy年MM月dd日')
}

const handleEdit = (log: LogEntry) => {
  // TODO: 实现编辑功能
  router.push(`/edit/${log.id}`)
}

const handleDelete = async (log: LogEntry) => {
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
    store.deleteLog(log.id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
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
</style> 