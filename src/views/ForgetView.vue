<template>
  <div class="forget-page">
    <div class="forget-container">
      <div class="forget-header">
        <h1 class="logo-text">BayTu</h1>
        <p class="logo-subtitle">智能日报助手</p>
      </div>

      <div class="steps-container">
        <el-steps :active="currentStep" finish-status="success" simple>
          <el-step title="验证邮箱" />
          <el-step title="重置密码" />
          <el-step title="完成" />
        </el-steps>
      </div>

      <!-- 步骤1：验证邮箱 -->
      <el-form
        v-if="currentStep === 0"
        ref="emailForm"
        :model="formData"
        :rules="emailRules"
        class="forget-form"
      >
        <el-form-item prop="email">
          <div class="email-input-group">
            <el-input
              v-model="formData.email"
              placeholder="请输入注册邮箱"
              :prefix-icon="Message"
            />
            <el-button
              type="primary"
              :disabled="!isEmailValid || codeSending || countdown > 0"
              @click="handleSendCode"
              class="send-code-btn"
            >
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item prop="verifyCode">
          <el-input
            v-model="formData.verifyCode"
            placeholder="验证码"
            :prefix-icon="Key"
            maxlength="6"
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="verifyEmail"
        >
          下一步
        </el-button>
      </el-form>

      <!-- 步骤2：重置密码 -->
      <el-form
        v-if="currentStep === 1"
        ref="passwordForm"
        :model="formData"
        :rules="passwordRules"
        class="forget-form"
      >
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="新密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="确认新密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="resetPassword"
        >
          重置密码
        </el-button>
      </el-form>

      <!-- 步骤3：完成 -->
      <div v-if="currentStep === 2" class="success-container">
        <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
        <h2 class="success-title">密码重置成功</h2>
        <p class="success-desc">您的密码已成功重置，请使用新密码登录</p>
        <el-button
          type="primary"
          class="submit-btn"
          @click="$router.push('/login')"
        >
          返回登录
        </el-button>
      </div>

      <div class="back-link">
        <el-link
          type="primary"
          :underline="false"
          @click="$router.push('/login')"
        >
          返回登录
        </el-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormItemRule } from 'element-plus'
import { Message, Lock, Key, CircleCheckFilled } from '@element-plus/icons-vue'
import { userService } from '@/api/user'

const router = useRouter()
const currentStep = ref(0)
const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const countdownTimer = ref<number | null>(null)

const formData = ref({
  email: '',
  verifyCode: '',
  password: '',
  confirmPassword: ''
})

// 验证邮箱格式
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formData.value.email)
})

// 发送验证码
const handleSendCode = () => {
  if (!isEmailValid.value) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }

  codeSending.value = true
  userService.forgotPassword(formData.value.email)
    .then(() => {
      ElMessage.success('验证码已发送')
      startCountdown()
    })
    .catch((error) => {
      ElMessage.error(error.response?.data?.message || '发送验证码失败')
    })
    .finally(() => {
      codeSending.value = false
    })
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  countdownTimer.value = window.setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (countdownTimer.value) {
        clearInterval(countdownTimer.value)
        countdownTimer.value = null
      }
    }
  }, 1000)
}

// 组件卸载时清除定时器
onUnmounted(() => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
  }
})

const validatePass = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    if (formData.value.confirmPassword !== '') {
      if (formData.value.password !== formData.value.confirmPassword) {
        callback(new Error('两次输入密码不一致!'))
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== formData.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const emailRules: Record<string, FormItemRule[]> = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度必须为6位', trigger: 'blur' }
  ]
}

const passwordRules: Record<string, FormItemRule[]> = {
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

// 验证邮箱和验证码
const verifyEmail = async () => {
  if (!formData.value.email || !formData.value.verifyCode) {
    ElMessage.warning('请填写邮箱和验证码')
    return
  }

  loading.value = true
  currentStep.value = 1
}

// 重置密码
const resetPassword = async () => {
  if (!formData.value.password || !formData.value.confirmPassword) {
    ElMessage.warning('请填写新密码')
    return
  }

  if (formData.value.password !== formData.value.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    // 这里调用重置密码的API
    await userService.resetPassword(formData.value.email, formData.value.verifyCode, formData.value.password)
    currentStep.value = 2
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '重置密码失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.forget-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.forget-container {
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.forget-header {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.logo-text {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  background: var(--primary-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-subtitle {
  margin: var(--spacing-xs) 0 0;
  color: var(--text-secondary);
  font-size: 16px;
}

.steps-container {
  margin-bottom: var(--spacing-xl);
}

.forget-form {
  margin-top: var(--spacing-lg);
}

.email-input-group {
  display: flex;
  gap: var(--spacing-sm);
}

.send-code-btn {
  flex-shrink: 0;
  width: 120px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  background-image: var(--primary-gradient);
  border: none;
  margin-bottom: var(--spacing-lg);
}

.submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.back-link {
  text-align: center;
  color: var(--text-secondary);
}

.success-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.success-icon {
  font-size: 64px;
  color: var(--success-color);
  margin-bottom: var(--spacing-lg);
}

.success-title {
  font-size: 24px;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
}

.success-desc {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .forget-container {
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .email-input-group {
    flex-direction: column;
  }

  .send-code-btn {
    width: 100%;
  }
}
</style>
