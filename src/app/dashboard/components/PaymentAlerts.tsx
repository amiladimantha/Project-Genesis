'use client'

import { useEffect, useState } from 'react'
import { dismissAlert } from '@/app/dashboard/actions/notifications'

interface PaymentAlert {
  id: string
  user_id: string
  subscription_id: string
  days_until_payment: number
  message: string
  dismissed: boolean
  sent_at: string
}

interface PaymentAlertsProps {
  initialAlerts: PaymentAlert[]
}

export function PaymentAlerts({ initialAlerts }: PaymentAlertsProps) {
  const [alerts, setAlerts] = useState(initialAlerts)

  const handleDismiss = async (alertId: string) => {
    const result = await dismissAlert(alertId)
    if (!result.error) {
      setAlerts(alerts.filter((a) => a.id !== alertId))
    }
  }

  if (alerts.length === 0) {
    return null
  }

  return (
    <div className="mb-8 space-y-2">
      {alerts.map((alert) => {
        const urgencyColor =
          alert.days_until_payment === 1
            ? 'bg-red-500/10 border-red-500/20'
            : alert.days_until_payment === 3
              ? 'bg-amber-500/10 border-amber-500/20'
              : 'bg-blue-500/10 border-blue-500/20'

        const urgencyIcon =
          alert.days_until_payment === 1
            ? '🔴'
            : alert.days_until_payment === 3
              ? '🟠'
              : '🔵'

        return (
          <div
            key={alert.id}
            className={`p-4 border rounded-lg flex items-start justify-between ${urgencyColor}`}
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="text-xl mt-0.5">{urgencyIcon}</span>
              <div className="flex-1">
                <p className="font-medium text-white">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Alert sent {new Date(alert.sent_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(alert.id)}
              className="ml-2 text-gray-400 hover:text-gray-200 text-xl"
              aria-label="Dismiss alert"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
