<template>
  <div class="new-log">
    <el-card v-loading="store.loading" class="new-log-cream-card">
      <template #header>
        <div class="new-log-card-header">
          <div class="new-log-header-content">
            <h2>{{ greeting }}</h2>
            <div class="new-log-description">记录今天的工作点滴</div>
          </div>
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            :disabled-date="disableFutureDates"
            format="YYYY年MM月DD日"
            value-format="YYYY-MM-DD"
          />
        </div>
      </template>
      
      <div class="new-log-editor-container">
        <MdEditor
          v-model="content"
          preview
          @onSave="handleSave"
          :noMermaid="true"
        />
      </div>

      <div class="new-log-actions">
        <el-button @click="$router.push('/')">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLogStore } from '../stores/logStore'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import dayjs from '../utils/dayjs'

const router = useRouter()
const store = useLogStore()

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 12) return '早安'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const selectedDate = ref(dayjs().format('YYYY-MM-DD'))
const content = ref('')

const toolbars = [
  'bold',
  'underline',
  'italic',
  'strikeThrough',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'codeRow',
  'code',
  'link',
  'table',
  'fullscreen'
] as Array<ToolbarNames>

const disableFutureDates = (date: Date) => {
  return dayjs(date).isAfter(dayjs())
}

const handleSave = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入日报内容')
    return
  }

  try {
    await store.addLog(content.value, selectedDate.value)
    ElMessage.success('保存成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(store.error || '保存失败')
  }
}
</script>

<style scoped>
.new-log {
  padding: 20px;
  background-color: #F8FBFF;  /* 淡淡的天空蓝 */
  min-height: 100vh;
}

.new-log-cream-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(176, 196, 222, 0.08);
  background-color: #FFFFFF;
  border: none;
}

.new-log-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.new-log-header-content h2 {
  margin: 0;
  font-size: 24px;
  color: rgba(0, 0, 0);
  font-weight: 600;
}

.new-log-description {
  margin: 0;
  color: #525252;
  font-size: 14px;
  margin-top: 8px;
}

.new-log-editor-container {
  margin: 20px 0;
  min-height: 500px;
}

:deep(.md-editor) {
  height: 500px;
  border-radius: 12px;
  border-color: #E8F1F8;  /* 浅蓝色边框 */
}

:deep(.md-editor-toolbar) {
  background-color: #F8FBFF !important;
  border-color: #E8F1F8 !important;
  border-radius: 12px 12px 0 0;
}

:deep(.md-editor-content) {
  background-color: #FFFFFF !important;
}

.new-log-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

:deep(.el-button) {
  border-radius: 8px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background-color: #5B8FB9;
  border-color: #5B8FB9;
}

:deep(.el-button--primary:hover) {
  background-color: #7BA7C7;
  border-color: #7BA7C7;
}

:deep(.el-date-picker) {
  --el-color-primary: #5B8FB9;
}
</style> 