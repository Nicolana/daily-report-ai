import { BaseService } from './core/baseService'
import type { PageResponse, Response } from '@/types/response'
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
  async getReport(id: string): Promise<Response<DailyReport>> {
    return this.get<DailyReport>(`/daily-reports/${id}`)
  }

  async create(data: CreateDailyReportDTO): Promise<Response<DailyReport>> {
    return this.post<DailyReport>('/daily-reports/', data)
  }

  async list(params?: {
    keyword?: string
    start_date?: string
    end_date?: string
  }): Promise<PageResponse<DailyReport>> {
    return this.getPage<DailyReport>('/daily-reports/', { params })
  }

  async update(id: string, data: Partial<CreateDailyReportDTO>): Promise<Response<DailyReport>> {
    return this.put<DailyReport>(`/daily-reports/${id}`, data)
  }

  async deleteReport(id: string): Promise<Response<void>> {
    return this.delete<void>(`/daily-reports/${id}`)
  }
}

export const dailyReportService = new DailyReportService()
