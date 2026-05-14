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

import { supabase } from '../utils/supabase';

export class FundRaisingActivityClass {
  // Entity fields
  fraId: number
  userId: number
  title:         string
  description:   string
  targetAmount:  number
  currentAmount: number
  status:        string
  createdBy:     string
  categoryId: number
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

  // FR-2-01: Create a new FRA
  static async create(userId: string): Promise<FundRaisingActivity> {
    const newFraData = {
      userId: userId,
      createdBy: userId,
      status: 'active',
      currentAmount: 0.0,
      title: '',
      description: '',
      targetAmount: 0.0,
      categoryId: '',
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
      .eq('userId', userId);

    if (error) {
      console.error('Failed to fetch user activities:', error.message);
      throw error;
    }
    return data || [];
  }

  // Read a single FRA by fraId
  static async readByFraId(fraId: number): Promise<FundRaisingActivityClass | null> {
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .select('*')
      .eq('fraId', fraId)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch activity by fraId:', error.message);
      throw error;
    }
    return data;
  }

  // FR-2-02: Update an existing FRA
  static async update(toUpdate: FundRaisingActivity): Promise<FundRaisingActivity> {
    const { fraId, userId, ...dataPayload } = toUpdate;

    const { data, error } = await supabase
      .from('fundraisingactivity')
      .update(dataPayload)
      .eq('fraId', fraId)
      .eq('userId', userId)
      .select()
      .single();

    if (error) {
      console.error('Failed to update record in Supabase:', error.message);
      throw error;
    }
    return data;
  }
  
  // Delete a FRA
  static async delete(userId: string, fraId: number, hard: boolean): Promise<boolean> {
    let query = supabase.from('fundraisingactivity');
    
    if (hard) {
      const { error } = await query
        .delete()
        .eq('fraId', fraId)
        .eq('userId', userId);
    
      if (error) throw error;
      return true;
    } else {
      const { error } = await query
        .update({ status: 'Archived' })
        .eq('fraId', fraId)
        .eq('userId', userId);

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
      .eq('fraId', this.fraId)
      .eq('userId', this.userId);

    if (error) {
      console.error('Failed to update status in Supabase:', error.message);
      throw error;
    }
    this.status = status
  }

}