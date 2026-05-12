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