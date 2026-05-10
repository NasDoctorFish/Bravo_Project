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

export const fraService = {
  filterByCategoryId(categoryId: number): FundRaisingActivity[] {
    return mockData.filter(fra => fra.categoryId === categoryId)
  },

  search(query: string): FundRaisingActivity[] {
    const q = query.toLowerCase()

    return mockData.filter(fra =>
      fra.title.toLowerCase().includes(q) ||
      fra.description.toLowerCase().includes(q) ||
      fra.createdBy.toLowerCase().includes(q)
    )
  }
}