// fraController.ts
// Create campaign (FR-2-01), Edit existing campaign details (FR-2-02), Mark campaign as completed (FR-2-08)
import type { FundRaisingActivity } from '../models/FundRaisingActivity'
import { FundRaisingActivityClass } from '../models/FundRaisingActivity' // Requirement 2
import { fraService } from '../services/fraService'
import { supabase } from '../lib/supabaseClient'

export async function searchFraByFilter(categoryId: string, query = '', status = ''): Promise<FundRaisingActivity[]> {
  // Select all columns; we'll map snake_case DB fields to camelCase in JS
  let request = supabase
    .from('fundraisingactivity')
    .select('*')

  const categoryIdNumber = Number(categoryId)
  if (categoryId && !Number.isNaN(categoryIdNumber)) {
    request = request.eq('categoryId', categoryIdNumber)
  }

  if (status) {
    // DB stores status in uppercase (e.g. ACTIVE) — normalize
    request = request.eq('status', String(status).toUpperCase())
  }

  if (query) {
    const sanitizedQuery = query.trim()
    // use actual DB column names in `or` expressions
    request = request.or(
      `title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%,createdby.ilike.%${sanitizedQuery}%`
    )
  }

  request = request.order('createdat', { ascending: false })

  const { data, error } = await request
  if (error) {
    console.error('Supabase search failed:', error.message)
    return []
  }
  const rows = (data || []) as any[]
  console.debug('[fraController] searchFraByFilter -> rows:', rows.length)
  const mapped = rows.map(r => ({
    fraId: r.fraid,
    userId: r.userid,
    title: r.title,
    description: r.description,
    targetAmount: r.targetamount,
    currentAmount: r.currentamount,
    status: r.status,
    createdBy: r.createdby,
    categoryId: r.categoryid,
    createdAt: r.createdat,
    name: r.name,
    image: r.image,
  }))
  return mapped as FundRaisingActivity[]
}

export async function searchFra(query: string): Promise<FundRaisingActivity[]> {
  const sanitizedQuery = query.trim()
  if (!sanitizedQuery) return []
  const { data, error } = await supabase
    .from('fundraisingactivity')
    .select('*')
    .or(
      `title.ilike.%${sanitizedQuery}%,description.ilike.%${sanitizedQuery}%,createdby.ilike.%${sanitizedQuery}%`
    )
    .order('createdat', { ascending: false })

  if (error) {
    console.error('Supabase search failed:', error.message)
    return []
  }
  const rows = (data || []) as any[]
  console.debug('[fraController] searchFra -> rows:', rows.length)
  const mapped = rows.map(r => ({
    fraId: r.fraid,
    userId: r.userid,
    title: r.title,
    description: r.description,
    targetAmount: r.targetamount,
    currentAmount: r.currentamount,
    status: r.status,
    createdBy: r.createdby,
    categoryId: r.categoryid,
    createdAt: r.createdat,
    name: r.name,
    image: r.image,
  }))
  return mapped as FundRaisingActivity[]
}


export class fraController {
  public createdBy!: string

  // Validate details for FR-2-01 and FR-2-02
  private validateDetails(
    title: string, 
    description: string, 
    targetAmount: number, 
    categoryId: number
  ): boolean {
    if (!title || title.trim().length === 0) return false;
    if (!description || description.trim().length === 0) return false;
    if (isNaN(targetAmount) || targetAmount <= 0) return false;
    if (!categoryId) return false;
    return true;
  }

  // Validate status for FR-2-08
  private validateStatus(status: string): boolean {
    const validStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED', 'PENDING_APPROVAL', 'REJECTED', 'CANCELLED'];
    return validStatuses.includes(status);
  }

  // FR-2-01: Create a new fundraising campaign
  async createFra(
    userId: string,
    details: { title: string; description: string; targetAmount: number; categoryId: string }
  ): Promise<FundRaisingActivityClass> {
    console.log('details:', details)
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .insert({
        userId: userId,
        createdBy: userId,
        title: details.title,
        description: details.description,
        targetAmount: details.targetAmount,
        categoryId: details.categoryId,
        status: 'Active',
        currentAmount: 0.0
      })
      .select()
      .single();

    if (error) throw error;
    return new FundRaisingActivityClass(data)
  }

  // FR-2-02: Fetch a single FRA by ID
  async getFraById(fraId: number): Promise<FundRaisingActivityClass> {
    if (!fraId) {
      throw new Error('fraId is required')
    }

    const activity = await FundRaisingActivityClass.readByFraId(fraId);

    if (!activity) {
      throw new Error(`Target fundraising activity with ID "${fraId}" could not be found.`);
    }
    return new FundRaisingActivityClass(activity)
  }

  // FR-2-02: Update title, description, targetAmount, categoryId of an existing campaign
  async updateFra(
    fraId:        number,
    title:        string,
    description:  string,
    targetAmount: number,
    categoryId:   number
  ): Promise<FundRaisingActivityClass> {
    if (!fraId) {
      throw new Error('fraId is required')
    }

    if (!this.validateDetails(title, description, targetAmount, categoryId)) {
      throw new Error('Invalid fundraising activity details. Please check all fields.')
    }

    const existingFra = await this.getFraById(fraId);
    existingFra.title = title;
    existingFra.description = description;
    existingFra.targetAmount = targetAmount;
    existingFra.categoryId = categoryId;

    const updatedFra = await FundRaisingActivityClass.update(existingFra as unknown as FundRaisingActivity)

    return new FundRaisingActivityClass(updatedFra)
  }

  // FR-2-08: Update campaign status (mark as completed)
  async updateFraStatus(
    fraId:  number,
    status: string
  ): Promise<FundRaisingActivityClass> {
    if (!fraId) {
      throw new Error('fraId is required')
    }

    if (!this.validateStatus(status)) {
      throw new Error(`Invalid status "${status}" is not a recognized campaign state.`);
    }
    const targetFra = await this.getFraById(fraId);
    const upperStatus = status.toUpperCase();
    await targetFra.updateStatus(upperStatus);
    if (upperStatus === 'COMPLETED') {
      await this.notifyDonors(fraId);
    }
    return targetFra;
  }

  // FR-2-08: Notify all donors of a campaign
  private async notifyDonors(fraId: number): Promise<void> {
    try {
      const { data: donations, error } = await supabase
        .from('donation')
        .select('donorEmail, donorName')
        .eq('fraId', fraId);

      if (error) {
        throw new Error(`Failed to retrieve donor list for notification: ${error.message}`);
      }

      if (!donations || donations.length === 0) {
        console.log(`No active donors found to notify for campaign ID: ${fraId}`);
        return;
      }

      const uniqueDonors = Array.from(
        new Map(donations.map(d => [d.donorEmail, d])).values()
      );

      console.log(`Dispatching completion announcements to ${uniqueDonors.length} unique donors...`);
      
      for (const donor of uniqueDonors) {
        console.log(`[Email Sent] To: ${donor.donorName} (${donor.donorEmail}) - Campaign ${fraId} has been successfully completed!`);
      }

    } catch (err: any) {
      console.error(`Side-effect Notification Warning: ${err.message}`);
    }
  }
}
// fraController.ts - Control layer for FRA History (FR-5-01, FR-5-02, FR-5-05)

export const fraHistoryController = {
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
