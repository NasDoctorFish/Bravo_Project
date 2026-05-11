// fraService.ts - Service layer for FRA filtering logic (FR-5-01, FR-5-02, FR-5-05)
export const fraService = {
  // FR-5-01: Filter by category
  filterByCategoryId(categoryId: string, fraList: any[]) {
    if (!categoryId) return fraList
    return fraList.filter(f => f.category === categoryId)
  },

  // FR-5-02: Filter by date range
  filterByDateRange(startDate: string, endDate: string, fraList: any[]) {
    let result = [...fraList]
    if (startDate) result = result.filter(f => f.completedAt >= startDate)
    if (endDate) result = result.filter(f => f.completedAt <= endDate)
    return result
  },

  // FR-5-01 + FR-5-02: Combined filter
  filterByAllFilters(categoryId: string, startDate: string, endDate: string, fraList: any[]) {
    let result = [...fraList]
    if (categoryId) result = result.filter(f => f.category === categoryId)
    if (startDate) result = result.filter(f => f.completedAt >= startDate)
    if (endDate) result = result.filter(f => f.completedAt <= endDate)
    return result
  },

  // FR-5-05: Get FRA detail by ID
  getFraById(fraId: string, fraList: any[]) {
    return fraList.find(f => f.fraId === fraId) || null
  }
}