import { defineStore } from 'pinia'
import { dailyReportApi, type DailyReport } from '../api/dailyReport'

interface LogState {
  logs: DailyReport[]
  loading: boolean
  error: string | null
}

export const useLogStore = defineStore('log', {
  state: (): LogState => ({
    logs: [],
    loading: false,
    error: null
  }),
  
  getters: {
    getLogsByDate: (state) => (date: string) => {
      return state.logs.filter((log) => log.report_date.startsWith(date))
    },
    
    getLogsByDateRange: (state) => (startDate: string, endDate: string) => {
      return state.logs.filter((log) => {
        const reportDate = log.report_date.split('T')[0]
        return reportDate >= startDate && reportDate <= endDate
      })
    }
  },
  
  actions: {
    async fetchLogs(keyword?: string) {
      this.loading = true
      this.error = null
      try {
        this.logs = await dailyReportApi.list(keyword)
      } catch (error) {
        this.error = '获取日志列表失败'
        console.error('Failed to fetch logs:', error)
      } finally {
        this.loading = false
      }
    },

    async addLog(content: string, date: string) {
      this.loading = true
      this.error = null
      try {
        const newLog = await dailyReportApi.create({
          content,
          report_date: new Date(date).toISOString()
        })
        this.logs.push(newLog)
      } catch (error) {
        this.error = '添加日志失败'
        console.error('Failed to add log:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateLog(id: string, content: string) {
      this.loading = true
      this.error = null
      try {
        const updatedLog = await dailyReportApi.update(id, { content })
        const index = this.logs.findIndex(log => log.id === id)
        if (index > -1) {
          this.logs[index] = updatedLog
        }
      } catch (error) {
        this.error = '更新日志失败'
        console.error('Failed to update log:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async deleteLog(id: string) {
      this.loading = true
      this.error = null
      try {
        await dailyReportApi.delete(id)
        const index = this.logs.findIndex(log => log.id === id)
        if (index > -1) {
          this.logs.splice(index, 1)
        }
      } catch (error) {
        this.error = '删除日志失败'
        console.error('Failed to delete log:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
}) 