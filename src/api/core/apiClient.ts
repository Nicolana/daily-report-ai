import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import type { Response, PageResponse } from '@/types/response'

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
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        const res = response.data
        if (res.code !== 200) { // 假设 0 是成功状态码
          ElMessage.error(res.message || '请求失败')
          return Promise.reject(new Error(res.message || '请求失败'))
        }
        return response
      },
      (error) => {
        const message = error.response?.data?.message || '请求失败'
        ElMessage.error(message)
        return Promise.reject(error)
      }
    )
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<Response<T>> {
    const response = await this.client.get<Response<T>>(url, config)
    return response.data
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Response<T>> {
    const response = await this.client.post<Response<T>>(url, data, config)
    return response.data
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<Response<T>> {
    const response = await this.client.put<Response<T>>(url, data, config)
    return response.data
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<Response<T>> {
    const response = await this.client.delete<Response<T>>(url, config)
    return response.data
  }

  // 添加分页请求方法
  protected async getPage<T>(url: string, config?: AxiosRequestConfig): Promise<PageResponse<T>> {
    const response = await this.client.get<PageResponse<T>>(url, config)
    return response.data
  }
}
