import { BaseService } from './core/baseService'

export interface DailyReport {
  id: string
  content: string
  report_date: string
  created_at: string
  updated_at: string
}

export interface CreateDailyReportDTO {
  content: string
  report_date: string
}

export class DailyReportService extends BaseService {
  async getReport(id: string): Promise<DailyReport> {
    return this.get<DailyReport>(`/daily-reports/${id}`)
  }

  async create(data: CreateDailyReportDTO): Promise<DailyReport> {
    return this.post<DailyReport>('/daily-reports/', data)
  }

  async list(params?: {
    keyword?: string
    start_date?: string
    end_date?: string
  }): Promise<DailyReport[]> {
    return this.get<DailyReport[]>('/daily-reports/', { params })
  }

  async update(id: string, data: Partial<CreateDailyReportDTO>): Promise<DailyReport> {
    return this.put<DailyReport>(`/daily-reports/${id}`, data)
  }

  async deleteReport(id: string): Promise<void> {
    return this.delete<void>(`/daily-reports/${id}`)
  }
}

export const dailyReportService = new DailyReportService()
