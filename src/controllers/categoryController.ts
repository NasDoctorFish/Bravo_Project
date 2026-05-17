// src/controllers/categoryController.ts
import { supabase } from '../lib/supabaseClient'

export type Category = {
  categoryId?: number
  categoryname: string
  categorydescription: string
  createdAt?: string
}

export type CategoryData = {
  categoryname: string
  categorydescription: string
}


/**
 * check the following 'Category' data format
 * categoryname less than 30 characters, and categorydescription less than 50 characters
 * returns Promise<Boolean> type since it is async function
 */
export function validateCategoryFormat(categoryData: any): boolean {
  const categoryname = categoryData.categoryname.trim()
  const categorydescription = categoryData.categorydescription.trim()
  const wordCount = categorydescription
    .split(/\s+/)
    .filter((word:string) => word.length > 0)
    .length

  if (categoryname.length === 0) {
    return false
  }

  if (categoryname.length > 30) {
    return false
  }

  if (wordCount > 50) {
    return false
  }

  return true
}

/**
 * check any duplicates on Category SQL database
 * returns Promise<Boolean> type since it is async function
 */
export async function checkDuplicateCategory(
  categoryname: string
): Promise<boolean> {
  console.log("Checking any duplicated dataset:", categoryname)

  if (!categoryname || categoryname.trim().length === 0) {
    throw new Error("Category name is required.")
  }

  const { data, error } = await supabase
    .from('category')
    .select('categoryname')
    .eq('categoryname', categoryname.trim())
    .maybeSingle()

  console.log("Duplicate query data:", data)
  console.log("Duplicate query error:", error)

  if (error) {
    throw error
  }

  return data !== null
}



/**
 * create Category logic with categoryData inputs and add to supabase PostgreSQL table: "Category"
 * categoryData format = {"categoryname": ___, "categorydescription": ___}
 * returns Promise type since it is async function
 */
export async function create(categoryname: string, categorydescription: string): Promise<Category[]> {
     // 1. create categoryData
    
    const cleanCategoryName = categoryname.trim()
    const cleanCategoryDescription = categorydescription.trim()
    const categoryData = {
        categoryname: cleanCategoryName,
        categorydescription: cleanCategoryDescription
    }

    // 2. validate format & check duplicates
    const isValid = await validateCategoryFormat(categoryData)
    const isDuplicate = await checkDuplicateCategory(categoryData.categoryname)
    if (!isValid) {
        throw new Error('The category data format is incorrect. The categoryname should be less than 30 words, and decription less than 50 words')
    }
    if (isDuplicate) {
        throw new Error('The category data is duplicated on dataset, please try with other categoryname.')
    }

    const { data, error } = await supabase
        .from('category')
        .insert([categoryData])
        .select()
    if (error) {
        throw error
    }

    return data
}