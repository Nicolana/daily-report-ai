import { BaseService } from './core/baseService'
import type { Response, PageResponse } from '@/types/response'
export interface SummaryBase {
  content: string
  summary_type: 'weekly' | 'monthly'
  start_date: string
  end_date: string
}

export interface GenerateSummaryParams {
  start_date: string
  end_date: string
  custom_prompt?: string
  summary_type: 'weekly' | 'monthly'
  style?: 'concise' | 'detailed' | 'technical' | 'business'
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

export interface EditSummaryParams {
  content: string
  type: 'week' | 'month'
  dateRange: string
}

export class SummaryService extends BaseService {
  async generateSummary(
    params: GenerateSummaryParams
  ): Promise<Response<SummaryResponse>> {
    return this.post<SummaryResponse>('/generate-summary/', {
      ...params
    })
  }

  async improveSummary(params: ImproveSummaryParams): Promise<Response<SummaryResponse>> {
    return this.post<SummaryResponse>('/summary/improve', params)
  }

  async getHistorySummaries(
    summary_type: 'weekly' | 'monthly',
    startDate: string,
    endDate: string
  ): Promise<Response<SummaryResponse[]>> {
    return this.get<SummaryResponse[]>('/summaries', {
      params: { summary_type, start_date: startDate, end_date: endDate }
    })
  }

  async saveSummary(params: SummaryBase): Promise<Response<SummaryResponse>> {
    return this.post<SummaryResponse>('/summaries', params)
  }

  async getCurrentSummary(summary_type: 'weekly' | 'monthly'): Promise<Response<SummaryResponse>> {
    return this.get<SummaryResponse>('/summaries/current', {
      params: { summary_type }
    })
  }
}

export const summaryService = new SummaryService()
