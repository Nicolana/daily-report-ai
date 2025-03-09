<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="logo-text">BayTu</h1>
        <p class="logo-subtitle">智能日报助手</p>
      </div>

      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名/邮箱"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <div class="form-options">
          <el-checkbox v-model="rememberMe">记住我</el-checkbox>
          <el-link type="primary" :underline="false" @click="$router.push('/forget')">忘记密码？</el-link>
        </div>

        <el-button
          type="primary"
          class="submit-btn"
          :loading="loading"
          @click="handleLogin"
        >
          登录
        </el-button>

        <div class="register-link">
          还没有账号？
          <el-link
            type="primary"
            :underline="false"
            @click="$router.push('/register')"
          >
            立即注册
          </el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: ''
})

const rememberMe = ref(false)
const loading = ref(false)

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  loading.value = true
  try {
    await userStore.login({
      email: loginForm.value.username,
      password: loginForm.value.password,
      remember: rememberMe.value
    })
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
}

.login-header {
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

.login-form {
  margin-top: var(--spacing-xl);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
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

.register-link {
  text-align: center;
  color: var(--text-secondary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-container {
    margin: var(--spacing-md);
    padding: var(--spacing-lg);
  }
}
</style>
