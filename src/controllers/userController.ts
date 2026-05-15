import { supabase } from '../lib/supabaseClient'

export const searchUser = async (
  id: number | null,
  role: string,
  query: string
) => {

  let request = supabase
    .from('userprofile')
    .select(`
      userid,
      name,
      role,
      createdat,
      useraccount (
        email
      )
    `)

  // For search 
  if (query) {

    // If query is a number, search by userid
    if (!isNaN(Number(query))) {
      request = request.eq('userid', Number(query))
    }

    // Or else search by name
    else {
      request = request.ilike('name', `%${query}%`)
    }
  }
  // Filter role
  if (role) {
    request = request.eq('role', role)
  }

  // Filter userid
  if (id !== null) {
    request = request.eq('userid', id)
  }

  const { data, error } = await request

  if (error) {
    console.error(error)
    throw error
  }

  return data || []
}

export async function updateUser(userId: number, name: string, role: string) {
  const { data, error } = await supabase
    .from('userprofile')
    .update({ 
      name: name, 
      role: role 
    })
    .eq('userid', userId) 
    .select()

  if (error) {
    console.error("Update Error:", error.message)
    return false
  }
  return data && data.length > 0
}

// 
export const getDoneeRegistrations = async (status: string = 'PENDING') => {
  const { data, error } = await supabase
    .from('doneeregistration')
    .select(`
      donee_reg_id,
      userid,
      bio,
      bankaccount,
      status,
      submittedat,
      userprofile ( name )
    `)
    .eq('status', status)

  if (error) throw error
  return data || []
}

export const handleDoneeProfileApproveClick = async (reg: any, adminUsername: string) => {
  // Update registration status
  const { error: updateError } = await supabase
    .from('doneeregistration')
    .update({ 
      status: 'APPROVED',
      reviewedby: adminUsername,
      reviewedat: new Date().toISOString()
    })
    .eq('donee_reg_id', reg.donee_reg_id)

  if (updateError) throw updateError

  // Create DoneeProfile
  const { error: profileError } = await supabase
    .from('doneeprofile')
    .insert([{
      userid: reg.userid,
      bio: reg.bio,
      bankaccount: reg.bankaccount,
      totalreceived: 0,
      createdat: new Date().toISOString()
    }])

  if (profileError) throw profileError
  return true
}

export const handleDoneeProfileRejectClick = async (regId: number, adminUsername: string, notes: string) => {
  const { error } = await supabase
    .from('doneeregistration')
    .update({ 
      status: 'REJECTED',
      reviewedby: adminUsername,
      reviewedat: new Date().toISOString(),
      notes: notes
    })
    .eq('donee_reg_id', regId)

  if (error) throw error
  return true
}