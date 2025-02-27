import { BaseService } from './core/baseService'
import type { DailyReport } from './dailyReport'

export interface GenerateSummaryParams {
  dateRange: string
  prompt?: string
  style: 'concise' | 'detailed' | 'technical' | 'business'
}

export interface SummaryResponse {
  content: string
  metadata?: {
    wordCount: number
    topicCount: number
    keyPoints: string[]
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ImproveSummaryParams {
  originalSummary: string
  feedback: string
  type: 'week' | 'month'
}

export class SummaryService extends BaseService {
  async generateSummary(
    logs: DailyReport[],
    params: GenerateSummaryParams
  ): Promise<SummaryResponse> {
    return this.post<SummaryResponse>('/summary/generate', {
      logs,
      ...params
    })
  }

  async improveSummary(params: ImproveSummaryParams): Promise<SummaryResponse> {
    return this.post<SummaryResponse>('/summary/improve', params)
  }

  async getHistorySummaries(
    type: 'week' | 'month',
    startDate: string,
    endDate: string
  ): Promise<SummaryResponse[]> {
    return this.get<SummaryResponse[]>('/summary/history', {
      params: { type, start_date: startDate, end_date: endDate }
    })
  }
}

export const summaryService = new SummaryService()
