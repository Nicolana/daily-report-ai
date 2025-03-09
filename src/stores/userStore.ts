import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userService, type UserInfo as ApiUserInfo } from '../api/user'

export interface UserInfo extends Required<ApiUserInfo> {
  avatar?: string
}

export interface LoginParams {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterParams {
  email: string
  password: string
  code: string
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 登录
  const login = async (params: LoginParams) => {
    loading.value = true
    error.value = null
    try {
      const { access_token, user } = await userService.login(params)
      token.value = access_token
      userInfo.value = user as UserInfo
      localStorage.setItem('token', access_token)
      if (params.remember) {
        localStorage.setItem('userInfo', JSON.stringify(user))
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 注册
  const register = async (params: RegisterParams) => {
    loading.value = true
    error.value = null
    try {
      await userService.register(params)
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 登出
  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 获取用户信息
  const getUserInfo = async () => {
    if (!token.value) return null

    loading.value = true
    error.value = null
    try {
      const user = await userService.getUserInfo()
      userInfo.value = user as UserInfo
      return user
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // 检查是否已登录
  const isLoggedIn = computed(() => !!token.value)

  return {
    token,
    userInfo,
    loading,
    error,
    isLoggedIn,
    login,
    register,
    logout,
    getUserInfo
  }
})
