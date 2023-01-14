export interface PaginatedResult<T> {
  data: T[]
  meta: {
    totalItems: number
  }
}