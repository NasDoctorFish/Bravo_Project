export type FundRaisingActivity = {
  fraId: number
  userId: number
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  status: 'active' | 'completed' | 'pending'
  createdBy: string
  categoryId: number
  createdAt: string
  name: string
  image?: string
}