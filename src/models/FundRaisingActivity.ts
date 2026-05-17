// FundRaisingActivity.ts
// Create campaign (FR-2-01), Edit existing campaign details (FR-2-02), Mark campaign as completed (FR-2-08)

import { supabase } from '../lib/supabaseClient';
export type FundRaisingActivity = {
  fraid: number
  userid: number
  title: string
  description: string
  target_amount: number
  current_amount: number
  status: 'active' | 'completed' | 'pending'
  createdby: string
  categoryid: number
  createdat: string
  name: string
  image?: string
  category?: {
    categoryname: string
  }
}

export class FundRaisingActivityClass {
  // Entity fields
  fraid: number
  userid: number
  title:         string
  description:   string
  target_amount:  number
  current_amount: number
  status:        string
  createdby:     string
  categoryid: number
  createdat:     Date
  name:          string
  category?: {
    categoryname: string
  }

  constructor(data: {
    fraid:         number
    userid:        number
    title:         string
    description:   string
    target_amount:  number
    current_amount: number
    status:        string
    createdby:     string
    categoryid:    number
    createdat:     Date | string
    name:          string
    category?: {
    categoryname: string
  }
  }) {
    this.fraid         = data.fraid
    this.userid        = data.userid
    this.title         = data.title
    this.description   = data.description
    this.target_amount = data.target_amount
    this.current_amount= data.current_amount
    this.status        = data.status
    this.createdby     = data.createdby
    this.categoryid    = data.categoryid
    this.createdat     = new Date(data.createdat)
    this.name          = data.name
    this.category      = data.category
  }

  // FR-2-01: Create a new FRA
  static async create(userid: string): Promise<FundRaisingActivity> {
    const newFraData = {
      userid: userid,
      createdby: userid,
      status: 'active',
      current_amount: 0.0,
      title: '',
      description: '',
      target_amount: 0.0,
      categoryid: '',
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
  static async readByuserid(userid: string): Promise<FundRaisingActivityClass[]> {
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .select('*, category(categoryname)')
      .eq('userid', userid);

    if (error) {
      console.error('Failed to fetch user activities:', error.message);
      throw error;
    }
    return data || [];
  }

  // Read a single FRA by fraid
  static async readByfraid(fraid: number): Promise<FundRaisingActivityClass | null> {
    const { data, error } = await supabase
      .from('fundraisingactivity')
      .select('*, category(categoryname)')
      .eq('fraid', fraid)
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch activity by fraid:', error.message);
      throw error;
    }
    return data;
  }

  // FR-2-02: Update an existing FRA
  static async update(toUpdate: FundRaisingActivity): Promise<FundRaisingActivity> {
    const { fraid, userid, ...dataPayload } = toUpdate;

    const { data, error } = await supabase
      .from('fundraisingactivity')
      .update(dataPayload)
      .eq('fraid', fraid)
      .eq('userid', userid)
      .select()
      .single();

    if (error) {
      console.error('Failed to update record in Supabase:', error.message);
      throw error;
    }
    return data;
  }
  
  // Delete a FRA
  static async delete(userid: string, fraid: number, hard: boolean): Promise<boolean> {
    let query = supabase.from('fundraisingactivity');
    
    if (hard) {
      const { error } = await query
        .delete()
        .eq('fraid', fraid)
        .eq('userid', userid);
    
      if (error) throw error;
      return true;
    } else {
      const { error } = await query
        .update({ status: 'Archived' })
        .eq('fraid', fraid)
        .eq('userid', userid);

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
      .eq('fraid', this.fraid)
      .eq('userid', this.userid);

    if (error) {
      console.error('Failed to update status in Supabase:', error.message);
      throw error;
    }
    this.status = status
  }

}