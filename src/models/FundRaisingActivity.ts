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
// FundRaisingActivity.ts
// Create campaign (FR-2-01), Edit existing campaign details (FR-2-02), Mark campaign as completed (FR-2-08)

import { supabase } from '../lib/supabaseClient';

export class FundRaisingActivityClass {
  fraId: number
  userId: number
  title:         string
  description:   string
  targetAmount:  number
  currentAmount: number
  status:        string
  createdBy:     string
  categoryId:    number
  createdAt:     Date
  name:          string

  constructor(data: {
    fraId:         number
    userId:        number
    title:         string
    description:   string
    targetAmount:  number
    currentAmount: number
    status:        string
    createdBy:     string
    categoryId:    number
    createdAt:     Date | string
    name:          string
  }) {
    this.fraId         = data.fraId
    this.userId        = data.userId
    this.title         = data.title
    this.description   = data.description
    this.targetAmount  = data.targetAmount
    this.currentAmount = data.currentAmount
    this.status        = data.status
    this.createdBy     = data.createdBy
    this.categoryId    = data.categoryId
    this.createdAt     = new Date(data.createdAt)
    this.name          = data.name
  }

  // Map a raw DB row (lowercase columns) to constructor-compatible shape
  static fromDB(row: any): FundRaisingActivityClass {
    return new FundRaisingActivityClass({
      fraId:         row.fraid,
      userId:        row.userid,
      title:         row.title         ?? '',
      description:   row.description   ?? '',
      targetAmount:  row.targetamount  ?? 0,
      currentAmount: row.currentamount ?? 0,
      status:        row.status        ?? '',
      createdBy:     row.createdby     ?? '',
      categoryId:    row.categoryid    ?? 0,
      createdAt:     row.createdat     ?? new Date(),
      name:          row.name          ?? '',
    })
  }

  // FR-2-01: Create a new FRA
  static async create(userId: string): Promise<FundRaisingActivity> {
    const newFraData = {
      userid:        userId,
      createdby:     userId,
      status:        'active',
      currentamount: 0.0,
      title:         '',
      description:   '',
      targetamount:  0.0,
      categoryid:    '',
    };

    const { data, error } = await supabase
      .from('fundraisingactivity')
      .insert(newFraData)
      .select()
      .single();

    if (error) {
      console.error('Failed to create FRA in Supabase:', error.message);
      throw error;
    }
    return data;
  }

  // Read all FRAs for a user
  static async readByUserId(userId: string): Promise<FundRaisingActivityClass[]> {
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .select('*')
      .eq('userid', userId);

    if (error) {
      console.error('Failed to fetch user activities:', error.message);
      throw error;
    }
    return (data ?? []).map((row: any) => FundRaisingActivityClass.fromDB(row))
  }

  // Read a single FRA by fraId
  static async readByFraId(fraId: number): Promise<FundRaisingActivityClass | null> {
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .select('*')
      .eq('fraid', fraId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch activity by fraId:', error.message);
      throw error;
    }
    return data ? FundRaisingActivityClass.fromDB(data) : null
  }

  // FR-2-02: Update an existing FRA
  static async update(toUpdate: FundRaisingActivity): Promise<FundRaisingActivity> {
    const { fraId, userId, ...rest } = toUpdate;

    const { data, error } = await supabase
      .from('fundraisingactivity')
      .update({
        title:         rest.title,
        description:   rest.description,
        targetamount:  rest.targetAmount,
        currentamount: rest.currentAmount,
        status:        rest.status,
        createdby:     rest.createdBy,
        categoryid:    rest.categoryId,
        name:          rest.name,
      })
      .eq('fraid', fraId)
      .eq('userid', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update record in Supabase:', error.message);
      throw error;
    }
    return FundRaisingActivityClass.fromDB(data) as unknown as FundRaisingActivity
  }

  // Delete a FRA
  static async delete(userId: string, fraId: number, hard: boolean): Promise<boolean> {
    let query = supabase.from('fundraisingactivity');

    if (hard) {
      const { error } = await query
        .delete()
        .eq('fraid', fraId)
        .eq('userid', userId);

      if (error) throw error;
      return true;
    } else {
      const { error } = await query
        .update({ status: 'Archived' })
        .eq('fraid', fraId)
        .eq('userid', userId);

      if (error) {
        console.error('Failed to delete record from Supabase:', error.message);
        throw error;
      }
      return true;
    }
  }

  // FR-2-08: Update only the status field
  async updateStatus(status: string): Promise<void> {
    const { error } = await supabase
      .from('fundraisingactivity')
      .update({ status: status })
      .eq('fraid', this.fraId)
      .eq('userid', this.userId);

    if (error) {
      console.error('Failed to update status in Supabase:', error.message);
      throw error;
    }
    this.status = status
  }
}
