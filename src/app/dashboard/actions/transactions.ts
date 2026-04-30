'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InsertTransaction, UpdateTransaction } from '@/types/database.types'

export async function getTransactions(limit?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  let query = supabase
    .from('transactions')
    .select(`
      *,
      category:categories(id, name, color),
      subscription:subscriptions(id, name)
    `)
    .order('date', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createTransaction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const categoryId = formData.get('category_id') as string
  const subscriptionId = formData.get('subscription_id') as string

  const transaction: InsertTransaction = {
    user_id: user.id,
    name: formData.get('name') as string,
    amount: parseFloat(formData.get('amount') as string),
    category_id: categoryId || null,
    subscription_id: subscriptionId || null,
    date: (formData.get('date') as string) || new Date().toISOString().split('T')[0],
  }

  const { error } = await supabase.from('transactions').insert(transaction)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const categoryId = formData.get('category_id') as string

  const updates: UpdateTransaction = {
    name: formData.get('name') as string,
    amount: parseFloat(formData.get('amount') as string),
    category_id: categoryId || null,
    date: formData.get('date') as string,
  }

  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function getMonthlySpendingTrend() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get last 6 months of transactions
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, date')
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])
    .order('date')

  if (error) {
    return { error: error.message, data: null }
  }

  // Group by month
  const monthlyData: Record<string, number> = {}
  transactions?.forEach((t) => {
    const month = new Date(t.date).toLocaleDateString('en-US', { month: 'short' })
    monthlyData[month] = (monthlyData[month] || 0) + Number(t.amount)
  })

  const data = Object.entries(monthlyData).map(([month, amount]) => ({
    month,
    amount: Math.round(amount * 100) / 100,
  }))

  return { error: null, data }
}

export async function getCategorySpending() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select(`
      amount,
      billing_cycle,
      status,
      category:categories(name, color)
    `)
    .eq('status', 'active')

  if (error) {
    return { error: error.message, data: null }
  }

  // Calculate monthly amount per category
  const categoryData: Record<string, { amount: number; color: string }> = {}
  
  subscriptions?.forEach((sub) => {
    let monthlyAmount = Number(sub.amount)
    if (sub.billing_cycle === 'yearly') monthlyAmount /= 12
    if (sub.billing_cycle === 'weekly') monthlyAmount *= 4.33

    const categoryName = sub.category?.name || 'Uncategorized'
    const categoryColor = sub.category?.color || '#6b7280'

    if (!categoryData[categoryName]) {
      categoryData[categoryName] = { amount: 0, color: categoryColor }
    }
    categoryData[categoryName].amount += monthlyAmount
  })

  const data = Object.entries(categoryData).map(([name, { amount, color }]) => ({
    name,
    value: Math.round(amount * 100) / 100,
    color,
  }))

  return { error: null, data }
}
