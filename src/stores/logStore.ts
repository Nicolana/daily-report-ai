import { defineStore } from 'pinia'

interface LogEntry {
  id: string
  date: string
  content: string
  createdAt: string
  updatedAt: string
}

interface LogState {
  logs: LogEntry[]
}

const STORAGE_KEY = 'daily-report-logs'

export const useLogStore = defineStore('log', {
  state: (): LogState => ({
    logs: JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  }),
  
  getters: {
    getLogsByDate: (state) => (date: string) => {
      return state.logs.filter((log: LogEntry) => log.date === date)
    },
    
    getLogsByDateRange: (state) => (startDate: string, endDate: string) => {
      return state.logs.filter((log: LogEntry) => {
        return log.date >= startDate && log.date <= endDate
      })
    }
  },
  
  actions: {
    addLog(content: string, date: string) {
      const newLog: LogEntry = {
        id: Date.now().toString(),
        date,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.logs.push(newLog)
      this.saveToLocalStorage()
    },
    
    updateLog(id: string, content: string) {
      const log = this.logs.find((l: LogEntry) => l.id === id)
      if (log) {
        log.content = content
        log.updatedAt = new Date().toISOString()
        this.saveToLocalStorage()
      }
    },
    
    deleteLog(id: string) {
      const index = this.logs.findIndex((l: LogEntry) => l.id === id)
      if (index > -1) {
        this.logs.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    saveToLocalStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs))
    }
  }
}) 