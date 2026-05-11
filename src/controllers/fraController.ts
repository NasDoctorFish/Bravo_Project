// fraController.ts
// Create campaign (FR-2-01), Edit existing campaign details (FR-2-02), Mark campaign as completed (FR-2-08)

import { supabase } from '../utils/supabaseClient';
import { FundRaisingActivity } from '../models/FundRaisingActivity'

const VALID_STATUSES = ['active', 'completed', 'pending', 'suspended'] as const

export class fraController {
  createdBy:           string
  private accessToken: string

  constructor(createdBy: string, accessToken: string) {
    this.createdBy   = createdBy
    this.accessToken = accessToken
  }

  // FR-2-01: Create a new fundraising campaign
  async createFra(
    title:        string,
    description:  string,
    targetAmount: number,
    categoryId:   string
  ): Promise<FundRaisingActivity> {
    if (!this.validateDetails(title, description, targetAmount, categoryId)) {
      throw new Error('Invalid fundraising activity details. Please check all fields.')
    }

    return await FundRaisingActivity.create(
      this.createdBy,
      { title, description, targetAmount, categoryId },
      this.accessToken
    )
  }

  // FR-2-02: Fetch a single FRA by ID
  async getFraById(fraId: string): Promise<FundRaisingActivity> {
    if (!fraId || fraId.trim().length === 0) {
      throw new Error('fraId is required')
    }

    return await FundRaisingActivity.readById(fraId, this.accessToken)
  }

  // FR-2-02: Update title, description, targetAmount, categoryId of an existing campaign
  async updateFra(
    fraId:        string,
    title:        string,
    description:  string,
    targetAmount: number,
    categoryId:   string
  ): Promise<FundRaisingActivity> {
    if (!fraId || fraId.trim().length === 0) {
      throw new Error('fraId is required')
    }

    if (!this.validateDetails(title, description, targetAmount, categoryId)) {
      throw new Error('Invalid fundraising activity details. Please check all fields.')
    }

    return await FundRaisingActivity.update(
      { fraId, title, description, targetAmount, categoryId },
      this.accessToken
    )
  }

  // FR-2-08: Update campaign status (mark as completed)
  async updateFraStatus(
    fraId:  string,
    status: string
  ): Promise<FundRaisingActivity> {
    if (!fraId || fraId.trim().length === 0) {
      throw new Error('fraId is required')
    }

    if (!this.validateStatus(status)) {
      throw new Error(`Invalid status "${status}". Allowed: ${VALID_STATUSES.join(', ')}`)
    }

    const fra = await FundRaisingActivity.readById(fraId, this.accessToken)
    await fra.updateStatus(status, this.accessToken)
    return fra
  }

  // FR-2-08: Notify all donors of a campaign
  async notifyDonors(fraId: string): Promise<void> {
    if (!fraId || fraId.trim().length === 0) {
      throw new Error('fraId is required')
    }

    const response = await fetch(
      `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-f9d90081/fra/${fraId}/notify`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.accessToken}` },
      }
    )

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Failed to notify donors')
    }
  }

  // Shared validation (FR-2-01, FR-2-02)
  validateDetails(
    title:        string,
    description:  string,
    targetAmount: number,
    categoryId:   string
  ): boolean {
    if (!title || title.trim().length === 0) {
      console.error('Validation failed: title is required')
      return false
    }

    if (title.trim().length > 100) {
      console.error('Validation failed: title must be 100 characters or fewer')
      return false
    }

    if (!description || description.trim().length === 0) {
      console.error('Validation failed: description is required')
      return false
    }

    if (!targetAmount || targetAmount <= 0) {
      console.error('Validation failed: targetAmount must be greater than 0')
      return false
    }

    if (!categoryId || categoryId.trim().length === 0) {
      console.error('Validation failed: categoryId is required')
      return false
    }

    return true
  }

  // FR-2-08: Validate allowed statuses
  validateStatus(status: string): boolean {
    if (!status || status.trim().length === 0) {
      console.error('Validation failed: status is required')
      return false
    }

    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      console.error(`Validation failed: "${status}" is not a valid status`)
      return false
    }

    return true
  }
}