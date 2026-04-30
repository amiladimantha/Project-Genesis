'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface NotificationPreferences {
  user_id: string
  email_enabled: boolean
  alert_7_days: boolean
  alert_3_days: boolean
  alert_1_day: boolean
  created_at: string
}

export async function getNotificationPreferences() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get or create default preferences
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code === 'PGRST116') {
    // No row found, create defaults
    const defaults: NotificationPreferences = {
      user_id: user.id,
      email_enabled: true,
      alert_7_days: true,
      alert_3_days: true,
      alert_1_day: true,
      created_at: new Date().toISOString(),
    }

    const { data: createdData, error: createError } = await supabase
      .from('notification_preferences')
      .insert(defaults)
      .select()
      .single()

    if (createError) {
      return { error: createError.message, data: null }
    }

    return { error: null, data: createdData }
  }

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function updateNotificationPreferences(preferences: Partial<NotificationPreferences>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('notification_preferences')
    .update({
      ...preferences,
      user_id: user.id,
    })
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { error: null }
}

export async function getPendingAlerts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('payment_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('dismissed', false)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

export async function dismissAlert(alertId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('payment_alerts')
    .update({ dismissed: true })
    .eq('id', alertId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { error: null }
}
