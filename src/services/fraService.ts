import type { FundRaisingActivity } from '../models/FundRaisingActivity'

const mockData: FundRaisingActivity[] = [
  {
    fraId: 1,
    userId: 1,
    title: 'Help Children',
    description: 'Support education',
    targetAmount: 10000,
    currentAmount: 5000,
    status: 'active',
    createdBy: 'Jane',
    categoryId: 1,
    createdAt: '2026-01-01',
    name: 'Campaign 1'
  },
  {
    fraId: 2,
    userId: 2,
    title: 'Medical Aid',
    description: 'Help hospital bills',
    targetAmount: 20000,
    currentAmount: 12000,
    status: 'active',
    createdBy: 'John',
    categoryId: 2,
    createdAt: '2026-01-02',
    name: 'Campaign 2'
  }
]

// fraService.ts - Service layer for FRA filtering logic (FR-5-01, FR-5-02, FR-5-05)
export const fraService = {
  // FR-5-01: Filter by category
  filterByCategoryId(categoryId: string | number, fraList: any[] = mockData) {
    if (!categoryId) return fraList
    return fraList.filter(f => f.categoryId === categoryId)
  },

  search(query: string): FundRaisingActivity[] {
    const q = query.toLowerCase()

    return mockData.filter(fra =>
      fra.title.toLowerCase().includes(q) ||
      fra.description.toLowerCase().includes(q) ||
      fra.createdBy.toLowerCase().includes(q)
    )
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
    if (categoryId) result = result.filter(f => f.categoryId === categoryId)
    if (startDate) result = result.filter(f => f.completedAt >= startDate)
    if (endDate) result = result.filter(f => f.completedAt <= endDate)
    return result
  },

  // FR-5-05: Get FRA detail by ID
  getFraById(fraId: string, fraList: any[]) {
    return fraList.find(f => f.fraId === fraId) || null
  }
}