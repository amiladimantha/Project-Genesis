import { createClient } from '@/lib/supabase/server'
import { sendPaymentAlert } from '@/lib/email'
import { NextRequest, NextResponse } from 'next/server'
import { addDays, startOfDay, endOfDay } from 'date-fns'

// Protect the route with a secret token
const CRON_SECRET = process.env.CRON_SECRET || 'your-secret-token'

export async function POST(request: NextRequest) {
  // Verify the request is from our cron service
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const alertDays = [1, 3, 7]
  const sentAlerts: string[] = []
  const errors: string[] = []

  try {
    // Get all active subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        user_id,
        name,
        amount,
        currency,
        next_payment_date,
        status,
        profile:profiles(id, email)
      `)
      .eq('status', 'active')

    if (subsError) {
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions', details: subsError },
        { status: 500 }
      )
    }

    // Check each subscription for upcoming payments
    for (const subscription of subscriptions) {
      const profile = subscription.profile as any
      if (!profile || !profile.email) continue

      const nextPaymentDate = new Date(subscription.next_payment_date)
      const today = startOfDay(new Date())

      // Check for each alert timing (1, 3, 7 days)
      for (const daysUntil of alertDays) {
        const alertDate = startOfDay(addDays(today, daysUntil))

        if (nextPaymentDate.getTime() === alertDate.getTime()) {
          // Check if user has this alert enabled
          const { data: prefs } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', subscription.user_id)
            .single()

          const emailEnabled = prefs?.email_enabled ?? true
          const alertEnabled =
            daysUntil === 1
              ? prefs?.alert_1_day ?? true
              : daysUntil === 3
                ? prefs?.alert_3_days ?? true
                : prefs?.alert_7_days ?? true

          if (!emailEnabled || !alertEnabled) {
            continue
          }

          // Send email
          try {
            const result = await sendPaymentAlert(
              profile.email,
              subscription.name,
              subscription.amount,
              subscription.currency,
              subscription.next_payment_date,
              daysUntil
            )

            if (result.success) {
              sentAlerts.push(
                `${subscription.name} to ${profile.email} (${daysUntil} days away)`
              )

              // Create in-app alert
              const { error: alertError } = await supabase
                .from('payment_alerts')
                .insert({
                  user_id: subscription.user_id,
                  subscription_id: subscription.id,
                  days_until_payment: daysUntil,
                  message: `Payment of ${new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: subscription.currency,
                  }).format(subscription.amount)} for ${subscription.name} is due in ${daysUntil} ${daysUntil === 1 ? 'day' : 'days'}`,
                  dismissed: false,
                  sent_at: new Date().toISOString(),
                })

              if (alertError) {
                errors.push(`Failed to create alert for ${subscription.name}: ${alertError.message}`)
              }
            } else {
              errors.push(
                `Failed to send email to ${profile.email}: ${JSON.stringify(result.error)}`
              )
            }
          } catch (err) {
            errors.push(`Exception sending email for ${subscription.name}: ${String(err)}`)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      sentAlerts: sentAlerts.length,
      alerts: sentAlerts,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
