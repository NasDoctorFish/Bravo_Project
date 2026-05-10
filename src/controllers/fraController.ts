import type { FundRaisingActivity } from '../models/FundRaisingActivity'
import { fraService } from '../services/fraService'

export function searchFraByFilter(categoryId: number): FundRaisingActivity[] {
  return fraService.filterByCategoryId(categoryId)
}

export function searchFra(query: string): FundRaisingActivity[] {
  return fraService.search(query)
}