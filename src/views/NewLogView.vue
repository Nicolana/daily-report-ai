<template>
  <div class="new-log">
    <el-card v-loading="store.loading">
      <template #header>
        <div class="card-header">
          <span>写日报</span>
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
      
      <div class="editor-container">
        <MdEditor
          v-model="content"
          preview
          @onSave="handleSave"
          :noMermaid="true"
        />
      </div>

      <div class="actions">
        <el-button @click="$router.push('/')">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useLogStore } from '../stores/logStore'
import { MdEditor, type ToolbarNames } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import dayjs from '../utils/dayjs'

const router = useRouter()
const store = useLogStore()

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
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-container {
  margin: 20px 0;
  min-height: 500px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

:deep(.md-editor) {
  height: 500px;
}
</style> 