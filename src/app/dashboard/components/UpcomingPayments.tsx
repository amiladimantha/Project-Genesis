'use client'

import { format, isWithinInterval, addDays } from 'date-fns'
import type { Subscription, Category } from '@/types/database.types'

type SubscriptionWithCategory = Subscription & {
  category: Pick<Category, 'id' | 'name' | 'color'> | null
}

interface UpcomingPaymentsProps {
  subscriptions: SubscriptionWithCategory[]
}

export function UpcomingPayments({ subscriptions }: UpcomingPaymentsProps) {
  const today = new Date()
  const sevenDaysFromNow = addDays(today, 7)

  const upcoming = subscriptions
    .filter((sub) => {
      if (sub.status !== 'active') return false
      const paymentDate = new Date(sub.next_payment_date)
      return isWithinInterval(paymentDate, { start: today, end: sevenDaysFromNow })
    })
    .sort((a, b) => new Date(a.next_payment_date).getTime() - new Date(b.next_payment_date).getTime())

  if (upcoming.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        <p>No payments due in the next 7 days</p>
      </div>
    )
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  function getDaysUntil(dateString: string) {
    const date = new Date(dateString)
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays} days`
  }

  return (
    <div className="space-y-3">
      {upcoming.map((sub) => (
        <div
          key={sub.id}
          className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: sub.category?.color || '#6b7280' }}
            />
            <div>
              <p className="font-medium text-white text-sm">{sub.name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(sub.next_payment_date), 'MMM d')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-white text-sm">
              {formatCurrency(sub.amount, sub.currency)}
            </p>
            <p className="text-xs text-amber-400">{getDaysUntil(sub.next_payment_date)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
