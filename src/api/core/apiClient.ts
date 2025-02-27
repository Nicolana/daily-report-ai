import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export class ApiClient {
  private client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 这里可以添加token等认证信息
        // const token = localStorage.getItem('token')
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`
        // }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        // 统一错误处理
        const message = error.response?.data?.message || '请求失败'
        ElMessage.error(message)
        return Promise.reject(error)
      }
    )
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }
} 