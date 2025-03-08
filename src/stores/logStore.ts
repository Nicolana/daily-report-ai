import { defineStore } from 'pinia'
import { dailyReportService, type DailyReport } from '../api/dailyReport'
import dayjs from '../utils/dayjs'

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
      return state.logs.filter((log) => dayjs(log.report_date).format('YYYY-MM-DD') === date)
    },

    getLogsByDateRange: (state) => (startDate: string, endDate: string) => {
      return state.logs.filter((log) => {
        const reportDate = dayjs(log.report_date).format('YYYY-MM-DD')
        return reportDate >= startDate && reportDate <= endDate
      }).sort((a, b) => dayjs(b.report_date).valueOf() - dayjs(a.report_date).valueOf())
    }
  },

  actions: {
    async fetchLogs(keyword?: string, startDate?: string, endDate?: string) {
      this.loading = true
      this.error = null
      try {
        const res = await dailyReportService.list({ keyword, start_date: startDate, end_date: endDate })
        this.logs = res.data?.items || []
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
        const newLog = await dailyReportService.create({
          content,
          report_date: dayjs(date).toISOString()
        })
        this.logs.unshift(newLog.data)
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
        const updatedLog = await dailyReportService.update(id, { content })
        const index = this.logs.findIndex(log => log.id === id)
        if (index > -1) {
          this.logs[index] = updatedLog.data
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
        await dailyReportService.deleteReport(id)
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
