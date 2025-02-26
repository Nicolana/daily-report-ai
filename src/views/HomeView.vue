<template>
  <div class="home">
    <el-row :gutter="20" class="mb-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>本周概览</span>
              <el-button type="primary" @click="$router.push('/new')">
                写日报
              </el-button>
            </div>
          </template>
          <div v-if="weeklyLogs.length === 0" class="empty-state">
            <el-empty description="本周暂无日报" />
          </div>
          <div v-else class="log-list">
            <div v-for="log in weeklyLogs" :key="log.id" class="log-item">
              <h3>{{ formatDate(log.date) }}</h3>
              <p>{{ log.content }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>周总结</span>
              <el-button text @click="$router.push('/summary')">查看更多</el-button>
            </div>
          </template>
          <!-- TODO: 显示周总结内容 -->
          <el-empty description="暂无周总结" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>月总结</span>
              <el-button text @click="$router.push('/summary')">查看更多</el-button>
            </div>
          </template>
          <!-- TODO: 显示月总结内容 -->
          <el-empty description="暂无月总结" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useLogStore } from '../stores/logStore'
import { format } from 'date-fns'

const store = useLogStore()

// 获取本周的日志
const weeklyLogs = computed(() => {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))
  
  return store.getLogsByDateRange(
    startOfWeek.toISOString().split('T')[0],
    endOfWeek.toISOString().split('T')[0]
  )
})

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'yyyy年MM月dd日')
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.mb-4 {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.log-item {
  border-bottom: 1px solid #eee;
  padding-bottom: 16px;
}

.log-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.log-item h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #666;
}

.log-item p {
  margin: 0;
  color: #333;
}

.empty-state {
  padding: 40px 0;
}
</style> 