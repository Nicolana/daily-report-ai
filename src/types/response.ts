export interface Response<T> {
  code: number
  message: string
  data: T
}

export interface Pagination {
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface PageResponse<T> {
  code: number
  message: string
  data: {
    items: T[],
    pagination: Pagination
  }
}
