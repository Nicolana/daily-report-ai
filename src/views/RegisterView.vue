<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1 class="logo-text">BayTu</h1>
        <p class="logo-subtitle">智能日报助手</p>
      </div>

      <el-form
        ref="registerForm"
        :model="registerForm"
        :rules="registerRules"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="email">
          <div class="email-input-group">
            <el-input
              v-model="registerForm.email"
              placeholder="邮箱"
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
            v-model="registerForm.verifyCode"
            placeholder="验证码"
            :prefix-icon="Key"
            maxlength="6"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </el-button>

        <div class="login-link">
          已有账号？
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/login')"
          >
            立即登录
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormItemRule } from 'element-plus'
import { useUserStore } from '../stores/userStore'
import { User, Message, Lock, Key } from '@element-plus/icons-vue'
import { userService } from '../api/user'

const router = useRouter()
const userStore = useUserStore()

const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  verifyCode: ''
})

const loading = ref(false)
const codeSending = ref(false)
const countdown = ref(0)
const countdownTimer = ref<number | null>(null)

// 验证邮箱格式
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(registerForm.value.email)
})

// 发送验证码
const handleSendCode = () => {
  if (!isEmailValid.value) {
    ElMessage.warning('请输入正确的邮箱地址')
    return
  }

  codeSending.value = true
  userService.sendVerificationCode(registerForm.value.email)
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
    if (registerForm.value.confirmPassword !== '') {
      if (registerForm.value.password !== registerForm.value.confirmPassword) {
        callback(new Error('两次输入密码不一致!'))
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: Function) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.value.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules: Record<string, FormItemRule[]> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  verifyCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度必须为6位', trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerForm.value.verifyCode) {
    ElMessage.warning('请输入验证码')
    return
  }

  loading.value = true
  try {
    await userStore.register({
      username: registerForm.value.username,
      email: registerForm.value.email,
      password: registerForm.value.password,
      code: registerForm.value.verifyCode
    })
    ElMessage.success('注册成功')
    router.push('/login')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.register-container {
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
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

.register-form {
  margin-top: var(--spacing-xl);
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

.login-link {
  text-align: center;
  color: var(--text-secondary);
}

.email-input-group {
  display: flex;
  gap: var(--spacing-sm);
}

.send-code-btn {
  flex-shrink: 0;
  width: 120px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .register-container {
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
