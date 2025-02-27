import { ApiClient } from './apiClient'

export class BaseService extends ApiClient {
  constructor() {
    super('/api')
  }
} 