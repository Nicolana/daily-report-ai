<template>
  <div class="generate-summary">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">生成{{ type === 'week' ? '周' : '月' }}总结</h2>
          <div class="page-subtitle">AI 助手将帮您总结工作内容</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 预览区域 -->
      <div class="preview-section">
        <div class="preview-content">
          <el-skeleton v-if="generating" :rows="10" animated />
          <MarkdownEditor v-else-if="previewContent" v-model="previewContent" />
          <div v-else class="empty-preview">
            <el-icon class="empty-icon"><Document /></el-icon>
            <p class="empty-title">暂无总结内容</p>
            <p class="empty-desc">选择时间范围并点击"生成总结"按钮开始生成</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 固定在底部的操作区域 -->
    <div style="height: 132px"></div>
    <div class="bottom-panel">
      <div class="panel-content">
        <div class="input-area">
          <el-input
            v-model="prompt"
            type="textarea"
            :rows="1"
            placeholder="输入您的需求进行调整..."
            resize="none"
            class="custom-input"
          />
          <div>
            <div class="generate-summary-footer">
              <el-date-picker
                v-if="type === 'week'"
                v-model="dateRange"
                type="week"
                format="YYYY年第ww周"
                placeholder="选择周"
                value-format="YYYY-MM-DD"
                class="date-picker"
              />
            <el-date-picker
              v-else
              v-model="dateRange"
              type="month"
              format="YYYY年MM月"
              placeholder="选择月份"
              value-format="YYYY-MM-DD"
              class="date-picker"
            />
          <div class="action-buttons">
            <el-button @click="$router.back()" class="cancel-btn">返回</el-button>
            <el-button
              type="primary"
              @click="handleGenerate"
              :loading="generating"
              class="generate-btn"
            >
              {{ generating ? '生成中...' : '生成总结' }}
            </el-button>
            <el-button
              type="success"
              @click="handleSave"
              :disabled="!previewContent"
              class="save-btn"
            >
              保存总结
            </el-button>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import { summaryService, type GenerateSummaryParams } from '../api/summary'
import dayjs from '../utils/dayjs'
import MarkdownEditor from '../components/MarkdownEditor.vue'

const route = useRoute()
const router = useRouter()

// 页面状态
const type = computed(() => route.params.type as 'week' | 'month')
const dateRange = ref('')
const prompt = ref('')
const style = ref<'concise' | 'detailed' | 'technical' | 'business'>('concise')
const generating = ref(false)
const previewContent = ref('')

// 初始化
onMounted(async () => {
  // 默认选择当前周/月
  dateRange.value = dayjs().format('YYYY-MM-DD')

  await handleGenerate();
})

// 生成总结
const handleGenerate = async () => {
  if (!dateRange.value) {
    ElMessage.warning('请选择时间范围')
    return
  }

  generating.value = true
  try {
    const start = type.value === 'week'
      ? dayjs(dateRange.value).startOf('week').format('YYYY-MM-DD')
      : dayjs(dateRange.value).startOf('month').format('YYYY-MM-DD')

    const end = type.value === 'week'
      ? dayjs(dateRange.value).endOf('week').format('YYYY-MM-DD')
      : dayjs(dateRange.value).endOf('month').format('YYYY-MM-DD')

    const params: GenerateSummaryParams = {
      start_date: start,
      end_date: end,
      summary_type: type.value === 'week' ? 'weekly' : 'monthly',
      custom_prompt: prompt.value,
      style: style.value
    }

    const res = await summaryService.generateSummary(params)
    previewContent.value = res.data?.content || ''
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '生成总结失败')
  } finally {
    generating.value = false
  }
}

// 保存总结
const handleSave = async () => {
  if (!dateRange.value || !previewContent.value) {
    ElMessage.warning('请先生成总结内容')
    return
  }

  try {
    const start = type.value === 'week'
      ? dayjs(dateRange.value).startOf('week').format('YYYY-MM-DD')
      : dayjs(dateRange.value).startOf('month').format('YYYY-MM-DD')

    const end = type.value === 'week'
      ? dayjs(dateRange.value).endOf('week').format('YYYY-MM-DD')
      : dayjs(dateRange.value).endOf('month').format('YYYY-MM-DD')

    await summaryService.saveSummary({
      content: previewContent.value,
      summary_type: type.value === 'week' ? 'weekly' : 'monthly',
      start_date: start,
      end_date: end
    })

    ElMessage.success('保存成功')
    router.push('/summary')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '保存失败')
  }
}
</script>

<style scoped>
.generate-summary {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  padding: var(--spacing-lg) var(--spacing-lg) 0;
  flex-shrink: 0;
}

.page-subtitle {
  margin-left: var(--spacing-md);
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.preview-section {
  margin: 0 auto;
}

.preview-content {
  background-color: var(--bg-secondary);
  border-radius: 8px;
  padding: var(--spacing-lg);
  min-height: 200px;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid var(--border-color);
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  border-radius: 8px;
  padding: var(--spacing-xl);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  color: var(--color-primary-light);
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: var(--spacing-xs);
  color: var(--primary-dark);
}

.empty-desc {
  font-size: 14px;
  color: var(--color-info);
}

/* 底部面板 */
.bottom-panel {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  flex-shrink: 0;
  position: fixed;
  bottom: 0;
  left: 240px;
  right: 0;
}

.panel-content {
  max-width: 800px;
  margin: 0 auto;
}

.top-controls {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.date-picker {
  width: 180px;
}

.input-area {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.custom-input :deep(.el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  font-size: 14px;
  line-height: 1.6;
  padding: 12px;
  min-height: 50px!important;
  box-shadow: none;
}

.custom-input :deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}

.style-group :deep(.el-radio-button__inner) {
  border-radius: 6px;
  margin-right: 8px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-tertiary);
  padding: 8px 16px;
  height: auto;
  font-size: 14px;
}

.style-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid var(--border-color);
}

.style-group :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  box-shadow: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-header {
    padding: var(--spacing-md);
  }

  .main-content {
    padding: var(--spacing-md);
  }

  .bottom-panel {
    padding: var(--spacing-md);
  }

  .top-controls {
    flex-direction: column;
  }

  .date-picker {
    width: 100%;
  }

  .style-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .style-group :deep(.el-radio-button__inner) {
    width: 100%;
    margin-right: 0;
    text-align: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}

.generate-summary-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
