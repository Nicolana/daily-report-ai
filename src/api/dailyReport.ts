import axios from 'axios'

const API_BASE_URL = '/api'

export interface CreateDailyReportDTO {
  content: string
  report_date: string
}

export interface DailyReport {
  id: string
  content: string
  report_date: string
  created_at: string
  updated_at: string
}

export const dailyReportApi = {
  create: async (data: CreateDailyReportDTO): Promise<DailyReport> => {
    const response = await axios.post(`${API_BASE_URL}/daily-reports/`, data)
    return response.data
  },

  list: async (): Promise<DailyReport[]> => {
    const response = await axios.get(`${API_BASE_URL}/daily-reports/`)
    return response.data
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<DailyReport[]> => {
    const response = await axios.get(`${API_BASE_URL}/daily-reports/`, {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/daily-reports/${id}`)
  },

  update: async (id: string, data: Partial<CreateDailyReportDTO>): Promise<DailyReport> => {
    const response = await axios.put(`${API_BASE_URL}/daily-reports/${id}`, data)
    return response.data
  }
}
