/**
 * Global types shared across the application.
 * Add app-wide interfaces, type aliases, and utility types here.
 */

// Example: Pagination params used across modules
export interface PaginationParams {
  page: number;
  limit: number;
}

// Example: Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Add more global types as needed
