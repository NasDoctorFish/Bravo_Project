import type { FundRaisingActivity } from '../models/FundRaisingActivity'
import { FundRaisingActivityClass } from '../models/FundRaisingActivity' // Requirement 2
import { fraService } from '../services/fraService'
// fraController.ts
// Create campaign (FR-2-01), Edit existing campaign details (FR-2-02), Mark campaign as completed (FR-2-08)

import { supabase } from '../lib/supabaseClient'

export async function searchFraByFilter(categoryid: string, query = '', status = ''): Promise<FundRaisingActivity[]> {
  // Select all columns; we'll map snake_case DB fields to camelCase in JS
  let request = supabase
    .from('fundraisingactivity')
    .select('*, category(categoryname)')

  const categoryidNumber = Number(categoryid)
  if (categoryid && !Number.isNaN(categoryidNumber)) {
    request = request.eq('categoryid', categoryidNumber)
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
    fraid: r.fraid,
    userid: r.userid,
    title: r.title,
    description: r.description,
    target_amount: r.target_amount,
    current_amount: r.current_amount,
    status: r.status,
    createdby: r.createdby,
    categoryid: r.categoryid,
    createdat: r.createdat,
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
    fraid: r.fraid,
    userid: r.userid,
    title: r.title,
    description: r.description,
    target_amount: r.target_amount,
    current_amount: r.current_amount,
    status: r.status,
    createdby: r.createdby,
    categoryid: r.categoryid,
    createdat: r.createdat,
    name: r.name,
    image: r.image,
  }))
  return mapped as FundRaisingActivity[]
}


export class fraController {
  public createdby!: string

  // Validate details for FR-2-01 and FR-2-02
  private validateDetails(
    title: string, 
    description: string, 
    target_amount: number, 
    categoryid: number
  ): boolean {
    if (!title || title.trim().length === 0) return false;
    if (!description || description.trim().length === 0) return false;
    if (isNaN(target_amount) || target_amount <= 0) return false;
    if (!categoryid) return false;
    return true;
  }

  // Validate status for FR-2-08
  private validateStatus(status: string): boolean {
    const validStatuses = ['DRAFT', 'ACTIVE', 'COMPLETED', 'PAUSED', 'PENDING_APPROVAL', 'REJECTED', 'CANCELLED'];
    return validStatuses.includes(status);
  }

  // FR-2-01: Create a new fundraising campaign
  async createFra(
    userid: string,
    details: { title: string; description: string; target_amount: number; categoryid: string }
  ): Promise<FundRaisingActivityClass> {
    console.log('details:', details)
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .insert({
        userid: userid,
        createdby: userid,
        title: details.title,
        description: details.description,
        target_amount: details.target_amount,
        categoryid: details.categoryid,
        status: 'Active',
        current_amount: 0.0
      })
      .select()
      .single();

    if (error) throw error;
    return new FundRaisingActivityClass(data)
  }

  // FR-2-02: Fetch a single FRA by ID
  async getFraById(fraid: number): Promise<FundRaisingActivityClass> {
    if (!fraid) {
      throw new Error('fraid is required')
    }

    const activity = await FundRaisingActivityClass.readByfraid(fraid);

    if (!activity) {
      throw new Error(`Target fundraising activity with ID "${fraid}" could not be found.`);
    }
    return new FundRaisingActivityClass(activity)
  }

  // FR-2-02: Update title, description, target_amount, categoryid of an existing campaign
  async updateFra(
    fraid:        number,
    title:        string,
    description:  string,
    target_amount: number,
    categoryid:   number
  ): Promise<FundRaisingActivityClass> {
    if (!fraid) {
      throw new Error('fraid is required')
    }

    if (!this.validateDetails(title, description, target_amount, categoryid)) {
      throw new Error('Invalid fundraising activity details. Please check all fields.')
    }

    const existingFra = await this.getFraById(fraid);
    existingFra.title = title;
    existingFra.description = description;
    existingFra.target_amount = target_amount;
    existingFra.categoryid = categoryid;

    const updatedFra = await FundRaisingActivityClass.update(existingFra as unknown as FundRaisingActivity)

    return new FundRaisingActivityClass(updatedFra)
  }

  // FR-2-08: Update campaign status (mark as completed)
  async updateFraStatus(
    fraid:  number,
    status: string
  ): Promise<FundRaisingActivityClass> {
    if (!fraid) {
      throw new Error('fraid is required')
    }

    if (!this.validateStatus(status)) {
      throw new Error(`Invalid status "${status}" is not a recognized campaign state.`);
    }
    const targetFra = await this.getFraById(fraid);
    const upperStatus = status.toUpperCase();
    await targetFra.updateStatus(upperStatus);
    if (upperStatus === 'COMPLETED') {
      await this.notifyDonors(fraid);
    }
    return targetFra;
  }

  // FR-2-08: Notify all donors of a campaign
  private async notifyDonors(fraid: number): Promise<void> {
    try {
      const { data: donations, error } = await supabase
        .from('donation')
        .select('donoremail, donorname')
        .eq('fraid', fraid);

      if (error) {
        throw new Error(`Failed to retrieve donor list for notification: ${error.message}`);
      }

      if (!donations || donations.length === 0) {
        console.log(`No active donors found to notify for campaign ID: ${fraid}`);
        return;
      }

      const uniqueDonors = Array.from(
        new Map(donations.map(d => [d.donoremail, d])).values()
      );

      console.log(`Dispatching completion announcements to ${uniqueDonors.length} unique donors...`);
      
      for (const donor of uniqueDonors) {
        console.log(`[Email Sent] To: ${donor.donorname} (${donor.donoremail}) - Campaign ${fraid} has been successfully completed!`);
      }

    } catch (err: any) {
      console.error(`Side-effect Notification Warning: ${err.message}`);
    }
  }
}
// fraController.ts - Control layer for FRA History (FR-5-01, FR-5-02, FR-5-05)

export const fraHistoryController = {
  // FR-5-01: Filter by category
  searchFraByFilter(categoryid: string, fraList: any[]) {
    return fraService.filterBycategoryid(categoryid, fraList)
  },

  // FR-5-02: Filter by date range
  searchFraByDateRange(startDate: string, endDate: string, fraList: any[]) {
    return fraService.filterByDateRange(startDate, endDate, fraList)
  },

  // FR-5-01 + FR-5-02: Combined filter
  searchFraByAllFilters(categoryid: string, startDate: string, endDate: string, fraList: any[]) {
    return fraService.filterByAllFilters(categoryid, startDate, endDate, fraList)
  },

  // FR-5-05: Get FRA detail by ID
  getFraById(fraid: string, fraList: any[]) {
    return fraService.getFraById(fraid, fraList)
  }
}
