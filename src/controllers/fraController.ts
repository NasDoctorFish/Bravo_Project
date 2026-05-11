// fraController.ts - Control layer for FRA History (FR-5-01, FR-5-02, FR-5-05)
import { fraService } from '../services/fraService.ts'

export const fraController = {
  // FR-5-01: Filter by category
  searchFraByFilter(categoryId: string, fraList: any[]) {
    return fraService.filterByCategoryId(categoryId, fraList)
  },

  // FR-5-02: Filter by date range
  searchFraByDateRange(startDate: string, endDate: string, fraList: any[]) {
    return fraService.filterByDateRange(startDate, endDate, fraList)
  },

  // FR-5-01 + FR-5-02: Combined filter
  searchFraByAllFilters(categoryId: string, startDate: string, endDate: string, fraList: any[]) {
    return fraService.filterByAllFilters(categoryId, startDate, endDate, fraList)
  },

  // FR-5-05: Get FRA detail by ID
  getFraById(fraId: string, fraList: any[]) {
    return fraService.getFraById(fraId, fraList)
  }
}