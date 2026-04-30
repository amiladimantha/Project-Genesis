'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InsertSubscription, UpdateSubscription } from '@/types/database.types'

export async function getSubscriptions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .order('next_payment_date')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function getSubscription(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      category:categories(id, name, color, icon)
    `)
    .eq('id', id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function createSubscription(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const categoryId = formData.get('category_id') as string

  const subscription: InsertSubscription = {
    user_id: user.id,
    name: formData.get('name') as string,
    amount: parseFloat(formData.get('amount') as string),
    currency: (formData.get('currency') as string) || 'USD',
    billing_cycle: formData.get('billing_cycle') as 'monthly' | 'yearly' | 'weekly',
    next_payment_date: formData.get('next_payment_date') as string,
    category_id: categoryId || null,
    status: 'active',
  }

  const { error } = await supabase.from('subscriptions').insert(subscription)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateSubscription(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const categoryId = formData.get('category_id') as string

  const updates: UpdateSubscription = {
    name: formData.get('name') as string,
    amount: parseFloat(formData.get('amount') as string),
    currency: (formData.get('currency') as string) || 'USD',
    billing_cycle: formData.get('billing_cycle') as 'monthly' | 'yearly' | 'weekly',
    next_payment_date: formData.get('next_payment_date') as string,
    category_id: categoryId || null,
    status: formData.get('status') as 'active' | 'cancelled' | 'paused',
  }

  const { error } = await supabase
    .from('subscriptions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteSubscription(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function getSubscriptionStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: subscriptions, error } = await supabase
    .from('subscriptions')
    .select('amount, billing_cycle, next_payment_date, status')
    .eq('status', 'active')

  if (error) {
    return { error: error.message, data: null }
  }

  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  let monthlySpending = 0
  let upcomingPayments = 0

  subscriptions?.forEach((sub) => {
    // Calculate monthly equivalent
    let monthlyAmount = sub.amount
    if (sub.billing_cycle === 'yearly') {
      monthlyAmount = sub.amount / 12
    } else if (sub.billing_cycle === 'weekly') {
      monthlyAmount = sub.amount * 4.33
    }
    monthlySpending += monthlyAmount

    // Check if payment is upcoming in next 30 days
    const paymentDate = new Date(sub.next_payment_date)
    if (paymentDate >= now && paymentDate <= thirtyDaysFromNow) {
      upcomingPayments += sub.amount
    }
  })

  return {
    error: null,
    data: {
      monthlySpending: Math.round(monthlySpending * 100) / 100,
      upcomingPayments: Math.round(upcomingPayments * 100) / 100,
      activeCount: subscriptions?.length || 0,
    },
  }
}
