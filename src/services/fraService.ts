import type { FundRaisingActivity } from '../models/FundRaisingActivity'

const mockData: FundRaisingActivity[] = [
  {
    fraid: 1,
    userid: 1,
    title: 'Help Children',
    description: 'Support education',
    target_amount: 10000,
    current_amount: 5000,
    status: 'active',
    createdby: 'Jane',
    categoryid: 1,
    createdat: '2026-01-01',
    name: 'Campaign 1'
  },
  {
    fraid: 2,
    userid: 2,
    title: 'Medical Aid',
    description: 'Help hospital bills',
    target_amount: 20000,
    current_amount: 12000,
    status: 'active',
    createdby: 'John',
    categoryid: 2,
    createdat: '2026-01-02',
    name: 'Campaign 2'
  }
]

// fraService.ts - Service layer for FRA filtering logic (FR-5-01, FR-5-02, FR-5-05)
export const fraService = {
  // FR-5-01: Filter by category
  filterBycategoryid(categoryid: string | number, fraList: any[] = mockData) {
    if (!categoryid) return fraList
    return fraList.filter(f => f.categoryid === categoryid)
  },

  search(query: string): FundRaisingActivity[] {
    const q = query.toLowerCase()

    return mockData.filter(fra =>
      fra.title.toLowerCase().includes(q) ||
      fra.description.toLowerCase().includes(q) ||
      fra.createdby.toLowerCase().includes(q)
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
  filterByAllFilters(categoryid: string, startDate: string, endDate: string, fraList: any[]) {
    let result = [...fraList]
    if (categoryid) result = result.filter(f => f.categoryid === categoryid)
    if (startDate) result = result.filter(f => f.completedAt >= startDate)
    if (endDate) result = result.filter(f => f.completedAt <= endDate)
    return result
  },

  // FR-5-05: Get FRA detail by ID
  getFraById(fraid: string, fraList: any[]) {
    return fraList.find(f => f.fraid === fraid) || null
  }
}